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
    
    // Initialize queue if needed
    if (!globalThis._alertQueue) globalThis._alertQueue = [];

    // Simulate AI Detection randomly
    const hasDetection = Math.random() > 0.8;
    const detections = [];
    if (hasDetection) {
      const bbox = [100, 100, 200, 200];
      const cls = Math.random() > 0.5 ? "pothole" : (Math.random() > 0.5 ? "animal" : "accident");
      const sev = Math.random() > 0.7 ? "high" : "medium";
      const conf = 0.85 + (Math.random() * 0.14);
      
      detections.push({
        bbox,
        class: cls,
        confidence: conf,
        severity: sev
      });

      // Generate a structured incident object for the alert feed
      globalThis._alertQueue.push({
        id: `mock-rt-${Date.now()}-${Math.floor(Math.random()*100)}`,
        camera_id: "NODE_0842",
        hazard_type: cls,
        severity_label: sev,
        severity_score: Math.floor(conf * 100),
        confidence: conf,
        status: "new",
        created_at: new Date().toISOString(),
        metadata: { bbox }
      });
      // Keep only last 20 alerts to prevent memory leaks and allow multiple clients to poll
      if (globalThis._alertQueue.length > 20) {
        globalThis._alertQueue.shift();
      }
    }

    // Store in global memory
    globalThis._latestFrameData = {
      annotatedFrame: data.frame, // Bouncing the frame back
      detections,
      timestamp: data.timestamp
    };

    console.log(`[API] Received frame. Queue size: ${globalThis._alertQueue.length}. Detect: ${hasDetection}`);

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
