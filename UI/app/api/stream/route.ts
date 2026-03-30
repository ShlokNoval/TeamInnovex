import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Global memory cache to hold the latest frame and a queue of pending alerts
declare global {
  var _latestFrameData: any;
  var _alertQueue: any[];
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const nodeLocation = data.location;
    
    // Initialize queue if needed
    if (!globalThis._alertQueue) globalThis._alertQueue = [];

    // Simulate AI Detection randomly (or handle real detections from AI engine)
    const hasDetection = Math.random() > 0.8;
    const detections = [];
    if (hasDetection) {
      const type = ['pothole', 'animal', 'accident'][Math.floor(Math.random() * 3)];
      const detection = {
        bbox: [100, 100, 200, 200],
        class: type,
        confidence: 0.91,
        severity: 'medium'
      };
      detections.push(detection);

      // Add to government alert queue with real-time location
      globalThis._alertQueue.push({
        id: `inc-live-${Date.now()}`,
        hazard_type: type as any,
        severity_score: 85,
        severity_label: 'high',
        status: 'new',
        lat: nodeLocation ? nodeLocation.lat : (28.6139 + (Math.random() - 0.5) * 0.01),
        lng: nodeLocation ? nodeLocation.lng : (77.2090 + (Math.random() - 0.5) * 0.01),
        created_at: new Date().toISOString(),
        camera: {
          id: 'cam-live-mobile',
          name: 'Mobile Neural Node',
          location_name: nodeLocation ? `GPS: ${nodeLocation.lat.toFixed(4)}, ${nodeLocation.lng.toFixed(4)}` : 'Remote Uplink'
        }
      });

      // Keep queue manageable
      if (globalThis._alertQueue.length > 50) globalThis._alertQueue.shift();
    }

    // Store in global memory
    globalThis._latestFrameData = {
      annotatedFrame: data.frame, 
      detections,
      timestamp: data.timestamp,
      location: nodeLocation // Pass the location back to the dashboard too
    };

    console.log(`[API] Received frame. GPS: ${nodeLocation ? 'ACTIVE' : 'OFF'}. Detect: ${hasDetection}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error processing frame:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

export async function GET() {
  const alerts = globalThis._alertQueue || [];
  
  // If there's a frame in memory, return it along with any queued alerts
  if (globalThis._latestFrameData) {
    // console.log(`[API] Serving frame to dashboard`);
    return NextResponse.json({ ...globalThis._latestFrameData, newAlerts: alerts });
  }
  return NextResponse.json({ active: false, newAlerts: alerts });
}
