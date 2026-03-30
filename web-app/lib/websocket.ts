import { io, Socket } from 'socket.io-client';
import { AnnotatedFrameResponse, Incident } from './types';

// Disabled MOCK mode so mobile frames can actually reach the local network relay.
const USE_MOCK = false;

type AlertCallback = (alert: Incident) => void;
type FrameCallback = (response: AnnotatedFrameResponse) => void;

class WebSocketService {
  private socket: Socket | null = null;
  
  // Use current origin if we are accessed via Ngrok or external IP, otherwise fallback to explicit localhost
  private getBackendUrl() {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return ''; // Socket.io will automatically use the current origin
      }
    }
    return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
  }

  // Mock simulation state
  private mockInterval: NodeJS.Timeout | null = null;
  private mockAlertInterval: NodeJS.Timeout | null = null;

  connect() {
    if (USE_MOCK) return;

    if (!this.socket) {
      this.socket = io(this.getBackendUrl(), {
        path: '/ws',
        autoConnect: true,
      });

      this.socket.on('connect', () => console.log('WebSocket connected'));
      this.socket.on('disconnect', () => console.log('WebSocket disconnected'));
    }
  }

  disconnect() {
    if (USE_MOCK) {
      this.stopMockSimulation();
      return;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private httpPollInterval: NodeJS.Timeout | null = null;
  private frameCallbacks = new Set<FrameCallback>();

  // Testing Dashboard - Send raw frame, receive annotated frame
  subscribeToFrames(onFrame: FrameCallback) {
    if (USE_MOCK) {
      this.startMockFrameSimulation(onFrame);
      return;
    }

    this.frameCallbacks.add(onFrame);

    if (!this.httpPollInterval) {
      this.httpPollInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/stream', { cache: 'no-store' });
          const data = await res.json();
          if (data.annotatedFrame) {
            this.frameCallbacks.forEach(cb => cb(data));
          }
        } catch (err) {
          // silent fail
        }
      }, 80); // Increased to ~12.5 FPS for smoother playback
    }
  }

  unsubscribeFromFrames(onFrame: FrameCallback) {
    if (USE_MOCK) {
      if (this.mockInterval) clearInterval(this.mockInterval);
      return;
    }
    this.frameCallbacks.delete(onFrame);
    if (this.frameCallbacks.size === 0 && this.httpPollInterval) {
      clearInterval(this.httpPollInterval);
      this.httpPollInterval = null;
    }
  }

  sendFrame(base64Frame: string, timestamp: number) {
    if (USE_MOCK) return; 
    
    // Send standard HTTP payload
    fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame: base64Frame, timestamp })
    }).catch(e => console.error("Send failed", e));
  }

  private httpAlertPollInterval: NodeJS.Timeout | null = null;
  private processedAlertIds = new Set<string>();

  // Admin Dashboard - Receive new alerts
  subscribeToAlerts(onAlert: AlertCallback) {
    if (USE_MOCK) {
       // Currently hardcoded to false, but keeping structure
      this.startMockAlertSimulation(onAlert);
      return;
    }

    if (this.httpAlertPollInterval) clearInterval(this.httpAlertPollInterval);
    this.httpAlertPollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/stream');
        const data = await res.json();
        if (data.newAlerts && data.newAlerts.length > 0) {
          data.newAlerts.forEach((alert: any) => {
             if (!this.processedAlertIds.has(alert.id)) {
                this.processedAlertIds.add(alert.id);
                onAlert(alert);
             }
          });
          // Keep set from growing infinitely
          if (this.processedAlertIds.size > 100) {
             const iterator = this.processedAlertIds.values();
             for(let i=0; i<20; i++) this.processedAlertIds.delete(iterator.next().value!);
          }
        }
      } catch (err) {
        // silent fail on poll
      }
    }, 1000); // Admin polls every 1 second
  }

  unsubscribeFromAlerts() {
    if (USE_MOCK) {
      if (this.mockAlertInterval) clearInterval(this.mockAlertInterval);
      return;
    }
    if (this.httpAlertPollInterval) clearInterval(this.httpAlertPollInterval);
  }

  // Mock simulation logic
  private startMockFrameSimulation(onFrame: FrameCallback) {
    if (this.mockInterval) clearInterval(this.mockInterval);
    
    let ts = 0;
    this.mockInterval = setInterval(() => {
      ts += 0.5;
      
      // Every few frames, simulate a detection
      const hasDetection = Math.random() > 0.7;
      const detections = [];
      
      if (hasDetection) {
        const types = ['pothole', 'animal', 'accident'];
        const type = types[Math.floor(Math.random() * types.length)];
        const severities = ['low', 'medium', 'high', 'critical'] as const;
        detections.push({
          bbox: [50, 50, 100, 100] as [number, number, number, number],
          class: type,
          confidence: 0.7 + (Math.random() * 0.25),
          severity: severities[Math.floor(Math.random() * severities.length)]
        });
      }

      onFrame({
        annotatedFrame: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", // 1x1 transparent
        detections,
        timestamp: ts
      });
    }, 1000); // 1 mock frame per second
  }

  private startMockAlertSimulation(onAlert: AlertCallback) {
    if (this.mockAlertInterval) clearInterval(this.mockAlertInterval);
    
    // Simulate a random critical alert every 30-60 seconds
    this.mockAlertInterval = setInterval(() => {
      import('./mock-data').then(({ MOCK_INCIDENTS }) => {
        const idx = Math.floor(Math.random() * MOCK_INCIDENTS.length);
        const randomIncident = JSON.parse(JSON.stringify(MOCK_INCIDENTS[idx]));
        randomIncident.id = `inc-mock-${Date.now()}`;
        randomIncident.created_at = new Date().toISOString();
        randomIncident.status = 'new';
        onAlert(randomIncident);
      });
    }, 45000);
  }

  private stopMockSimulation() {
    if (this.mockInterval) clearInterval(this.mockInterval);
    if (this.mockAlertInterval) clearInterval(this.mockAlertInterval);
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
