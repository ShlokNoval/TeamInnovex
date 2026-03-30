import { io, Socket } from 'socket.io-client';
import { AnnotatedFrameResponse, Incident } from './types';

// Used for simulating WebSocket events in UI-only mode
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

type AlertCallback = (alert: Incident) => void;
type FrameCallback = (response: AnnotatedFrameResponse) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
  
  // Mock simulation state
  private mockInterval: NodeJS.Timeout | null = null;
  private mockAlertInterval: NodeJS.Timeout | null = null;

  connect() {
    if (USE_MOCK) return;

    if (!this.socket) {
      this.socket = io(this.backendUrl, {
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

  // Testing Dashboard - Send raw frame, receive annotated frame
  subscribeToFrames(onFrame: FrameCallback) {
    if (USE_MOCK) {
      this.startMockFrameSimulation(onFrame);
      return;
    }

    this.socket?.on('annotated_frame', onFrame);
  }

  unsubscribeFromFrames() {
    if (USE_MOCK) {
      if (this.mockInterval) clearInterval(this.mockInterval);
      return;
    }
    this.socket?.off('annotated_frame');
  }

  sendFrame(base64Frame: string, timestamp: number) {
    if (USE_MOCK) return; // Mock simulation handles itself once started
    this.socket?.emit('process_frame', { frame: base64Frame, timestamp });
  }

  // Admin Dashboard - Receive new alerts
  subscribeToAlerts(onAlert: AlertCallback) {
    if (USE_MOCK) {
      this.startMockAlertSimulation(onAlert);
      return;
    }
    this.socket?.on('new_alert', onAlert);
  }

  unsubscribeFromAlerts() {
    if (USE_MOCK) {
      if (this.mockAlertInterval) clearInterval(this.mockAlertInterval);
      return;
    }
    this.socket?.off('new_alert');
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
