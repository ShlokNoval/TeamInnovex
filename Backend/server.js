// DivyaDrishti — Node.js Backend Server
// Bridges the Next.js UI and the Python AI Engine via Socket.io + REST

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';

// ─── Configuration ──────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '8000', 10);
const AI_ENGINE_WS = process.env.AI_ENGINE_WS || 'ws://localhost:8001/ws/stream/mobile';

// ─── Express App ────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Large payloads for base64 frames

const httpServer = createServer(app);

// ─── Socket.io Server ──────────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  maxHttpBufferSize: 10e6, // 10MB for frame data
  pingTimeout: 30000,
  pingInterval: 10000,
});

// ─── In-Memory Data Store ───────────────────────────────────────────────────
const incidents = [];
const cameras = [
  {
    id: 'cam-mobile',
    name: 'Mobile Neural Node',
    location_name: 'Live GPS Feed',
    latitude: 19.8762,
    longitude: 75.3433,
    active: true,
    created_at: new Date().toISOString(),
  },
];

// ─── AI Engine WebSocket Bridge ─────────────────────────────────────────────
let aiSocket = null;
let aiConnected = false;
let aiReconnectTimer = null;

// Pending frame callbacks: when we send a frame to AI, we store a callback
// to handle the response. Since the AI Engine processes frames sequentially,
// we use a simple queue.
let pendingFrameCallback = null;

function connectToAIEngine() {
  if (aiSocket && aiSocket.readyState === WebSocket.OPEN) return;

  try {
    aiSocket = new WebSocket(AI_ENGINE_WS);

    aiSocket.on('open', () => {
      aiConnected = true;
      console.log('[AI Bridge] Connected to AI Engine at', AI_ENGINE_WS);
      if (aiReconnectTimer) {
        clearInterval(aiReconnectTimer);
        aiReconnectTimer = null;
      }
    });

    aiSocket.on('message', (data) => {
      try {
        const response = JSON.parse(data.toString());
        if (pendingFrameCallback) {
          const cb = pendingFrameCallback;
          pendingFrameCallback = null;
          cb(response);
        }
      } catch (e) {
        console.error('[AI Bridge] Failed to parse AI response:', e.message);
      }
    });

    aiSocket.on('close', () => {
      aiConnected = false;
      aiSocket = null;
      console.log('[AI Bridge] Disconnected from AI Engine. Will retry...');
      scheduleReconnect();
    });

    aiSocket.on('error', (err) => {
      // Suppress ECONNREFUSED spam — it just means AI Engine isn't running yet
      if (err.code !== 'ECONNREFUSED') {
        console.error('[AI Bridge] WebSocket error:', err.message);
      }
      aiConnected = false;
    });
  } catch (e) {
    aiConnected = false;
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (aiReconnectTimer) return;
  aiReconnectTimer = setInterval(() => {
    if (!aiConnected) {
      connectToAIEngine();
    } else {
      clearInterval(aiReconnectTimer);
      aiReconnectTimer = null;
    }
  }, 5000); // Retry every 5 seconds
}

function sendFrameToAI(frameBase64, timestamp) {
  return new Promise((resolve) => {
    if (!aiConnected || !aiSocket || aiSocket.readyState !== WebSocket.OPEN) {
      resolve(null); // AI not available, passthrough
      return;
    }

    // Set a timeout in case AI Engine hangs
    const timeout = setTimeout(() => {
      pendingFrameCallback = null;
      resolve(null);
    }, 5000);

    pendingFrameCallback = (response) => {
      clearTimeout(timeout);
      resolve(response);
    };

    try {
      aiSocket.send(JSON.stringify({ frame: frameBase64, timestamp }));
    } catch (e) {
      clearTimeout(timeout);
      pendingFrameCallback = null;
      resolve(null);
    }
  });
}

// ─── Helper: Map AI Engine incident → UI Incident schema ────────────────────
function mapAIIncidentToUIIncident(aiIncident, location) {
  const now = new Date().toISOString();

  // Map hazard type: YOLO classes like dog/cow/cat → 'animal'
  let hazardType = (aiIncident.type || 'pothole').toLowerCase();
  if (['dog', 'cat', 'cow', 'horse', 'sheep'].includes(hazardType)) {
    hazardType = 'animal';
  }
  // Ensure it's one of the valid types
  if (!['pothole', 'animal', 'accident'].includes(hazardType)) {
    hazardType = 'pothole';
  }

  // Extract scores from the nested data object
  const data = aiIncident.data || {};
  const severityScore = data.severity_score || data.risk_score || 50;
  const confidence = data.confidence || 0.8;
  const severityLabel = (aiIncident.severity || data.severity_label || data.risk_label || 'medium').toLowerCase();

  return {
    id: `inc-${uuidv4().slice(0, 8)}`,
    camera_id: aiIncident.camera_id || 'cam-mobile',
    hazard_type: hazardType,
    severity_label: severityLabel,
    severity_score: severityScore,
    confidence: confidence,
    status: 'new',
    latitude: location?.lat || null,
    longitude: location?.lng || null,
    metadata: data,
    created_at: now,
    updated_at: now,
    camera: cameras[0],
  };
}

// ─── Helper: Map AI Engine response → UI AnnotatedFrameResponse ─────────────
function mapAIResponseToFrameStream(aiResponse, rawFrame, timestamp, location) {
  // If AI Engine gave us an annotated frame, use it; else passthrough the raw frame
  let annotatedFrame = rawFrame;
  if (aiResponse && aiResponse.annotated_frame) {
    // AI Engine returns raw base64 without the data URL prefix
    const b64 = aiResponse.annotated_frame;
    annotatedFrame = b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}`;
  }

  // Map AI incidents to UI Detection format
  const detections = [];
  if (aiResponse && aiResponse.incidents) {
    for (const inc of aiResponse.incidents) {
      const data = inc.data || {};
      detections.push({
        bbox: data.bbox || [100, 100, 200, 200],
        class: inc.type || 'unknown',
        confidence: data.confidence || 0.8,
        severity: (inc.severity || 'low').toLowerCase(),
      });
    }
  }

  return {
    annotatedFrame,
    detections,
    timestamp: timestamp || Date.now(),
    location: location || null,
  };
}

// ─── Socket.io Event Handlers ───────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.emit('connection_response', { data: 'Connected to DivyaDrishti Backend' });

  // Handle raw frames from mobile camera node
  socket.on('raw_frame', async (data) => {
    const { frame, timestamp, location } = data;

    if (!frame) return;

    // Strip data URL prefix for AI Engine (it expects raw base64)
    let rawBase64 = frame;
    if (frame.includes(',')) {
      rawBase64 = frame.split(',')[1];
    }

    // Forward to AI Engine
    const aiResponse = await sendFrameToAI(rawBase64, timestamp);

    // Build the frame_stream payload for the SOC Dashboard
    const framePayload = mapAIResponseToFrameStream(aiResponse, frame, timestamp, location);

    // Broadcast annotated frame to ALL connected clients (SOC dashboards on PC)
    io.emit('frame_stream', framePayload);

    // Process incidents and create alerts
    if (aiResponse && aiResponse.incidents && aiResponse.incidents.length > 0) {
      for (const aiInc of aiResponse.incidents) {
        const incident = mapAIIncidentToUIIncident(aiInc, location);
        
        // --- COOLDOWN DEDUPLICATION logic ---
        // Prevent spamming 50 identical alerts if physical crash persists across frames
        const cooldownKey = `${incident.camera_id}_${incident.hazard_type}`;
        const lastTime = global.incidentCooldowns ? global.incidentCooldowns[cooldownKey] : 0;
        
        if (!global.incidentCooldowns) global.incidentCooldowns = {};
        
        if (Date.now() - lastTime > 10000) { // 10 second physical cooldown 
          global.incidentCooldowns[cooldownKey] = Date.now();
          
          incidents.unshift(incident); // Add to front

          // Keep incidents list manageable
          if (incidents.length > 500) incidents.length = 500;

          // Broadcast new alert to dashboards
          io.emit('new_alert', incident);
          console.log(`[Alert] ${incident.hazard_type.toUpperCase()} | Severity: ${incident.severity_label} | Score: ${incident.severity_score}`);
        }
      }
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
  });
});

// ─── REST API ───────────────────────────────────────────────────────────────

// GET /api/incidents — Return all incidents
app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

// GET /api/incidents/:id — Return single incident
app.get('/api/incidents/:id', (req, res) => {
  const incident = incidents.find((i) => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

// PATCH /api/alerts/:id — Update incident status
app.patch('/api/alerts/:id', (req, res) => {
  const incident = incidents.find((i) => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const { status } = req.body;
  if (status && ['new', 'acknowledged', 'resolved'].includes(status)) {
    incident.status = status;
    incident.updated_at = new Date().toISOString();
  }
  res.json(incident);
});

// POST /api/incidents — Create incident (used by AI Engine's HTTP POST)
app.post('/api/incidents', (req, res) => {
  const data = req.body;
  const now = new Date().toISOString();

  const incident = {
    id: `inc-${uuidv4().slice(0, 8)}`,
    camera_id: data.camera_id || 'cam-mobile',
    hazard_type: (data.type || 'pothole').toLowerCase(),
    severity_label: (data.severity || 'medium').toLowerCase(),
    severity_score: data.metadata?.severity_score || data.metadata?.risk_score || 50,
    confidence: data.metadata?.confidence || 0.8,
    status: 'new',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    metadata: data.metadata || {},
    created_at: now,
    updated_at: now,
    camera: cameras[0],
  };

  incidents.unshift(incident);
  if (incidents.length > 500) incidents.length = 500;

  // Also broadcast as alert
  io.emit('new_alert', incident);

  res.status(201).json(incident);
});

// GET /api/cameras — Return camera list
app.get('/api/cameras', (req, res) => {
  res.json(cameras);
});

// GET /api/analytics/summary — Compute analytics from incidents
app.get('/api/analytics/summary', (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const byType = { pothole: 0, animal: 0, accident: 0 };
  const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
  let todayCount = 0;
  const hourlyMap = {};

  for (const inc of incidents) {
    if (byType[inc.hazard_type] !== undefined) byType[inc.hazard_type]++;
    if (bySeverity[inc.severity_label] !== undefined) bySeverity[inc.severity_label]++;

    const incDate = new Date(inc.created_at);
    if (incDate >= todayStart) {
      todayCount++;
      const hour = incDate.getHours();
      hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;
    }
  }

  const hourlyBreakdown = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourlyMap[i] || 0,
  }));

  res.json({
    total_detections: incidents.length,
    by_type: byType,
    by_severity: bySeverity,
    today_count: todayCount,
    hourly_breakdown: hourlyBreakdown,
  });
});

// GET /api/analytics/heatmap — Return geo-points from incidents
app.get('/api/analytics/heatmap', (req, res) => {
  const points = incidents
    .filter((i) => i.latitude && i.longitude)
    .map((i) => ({
      latitude: i.latitude,
      longitude: i.longitude,
      intensity: i.severity_score / 100,
    }));
  res.json(points);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    ai_engine_connected: aiConnected,
    incidents_count: incidents.length,
    uptime: process.uptime(),
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════════════╗`);
  console.log(`  ║  DivyaDrishti Backend — Port ${PORT}            ║`);
  console.log(`  ╠══════════════════════════════════════════════╣`);
  console.log(`  ║  REST API:    http://localhost:${PORT}/api      ║`);
  console.log(`  ║  Socket.io:   http://localhost:${PORT}          ║`);
  console.log(`  ║  Health:      http://localhost:${PORT}/health   ║`);
  console.log(`  ╚══════════════════════════════════════════════╝\n`);

  // Attempt initial connection to AI Engine
  connectToAIEngine();
  // If it fails, it will auto-retry every 5 seconds
  scheduleReconnect();
});
