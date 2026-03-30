import { io, Socket } from 'socket.io-client';
import { AnnotatedFrameResponse, Incident } from './types';

// Set to false for live backend integration
const USE_MOCK = false;

type AlertCallback = (alert: Incident) => void;
type FrameCallback = (response: AnnotatedFrameResponse) => void;
type StatusCallback = (connected: boolean) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private statusCallbacks = new Set<StatusCallback>();

  private getConnectionConfig(): { url: string; options: any } {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

      if (isLocal) {
        // Direct to Flask locally
        const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
        return { 
          url: backendUrl, 
          options: { transports: ['websocket', 'polling'] } 
        };
      } else {
        // Through ngrok/proxy: Use root path and let Next.js rewrites handle it.
        // Allowing both websocket and polling for maximum compatibility.
        // We order websocket first for performance if the tunnel supports it.
        return { 
          url: '', // Empty string forces socket.io to connect to current host (ngrok)
          options: { transports: ['websocket', 'polling'] } 
        };
      }
    }
    return { url: 'http://localhost:8000', options: { transports: ['websocket', 'polling'] } };
  }

  // Mock simulation state
  private mockInterval: NodeJS.Timeout | null = null;
  private mockAlertInterval: NodeJS.Timeout | null = null;

  /** Subscribe to real-time WebSocket connection status updates */
  onStatusChange(cb: StatusCallback): () => void {
    this.statusCallbacks.add(cb);
    return () => this.statusCallbacks.delete(cb);
  }

  private notifyStatus(connected: boolean) {
    this.statusCallbacks.forEach(cb => cb(connected));
  }

  connect() {
    if (USE_MOCK) return;
    if (this.socket?.connected) return; // Already connected

    // Clean up any stale socket
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    const config = this.getConnectionConfig();
    console.log(`[WS] Connecting to "${config.url || 'current origin'}" via [${config.options.transports.join(', ')}]`);

    this.socket = io(config.url || undefined, {
      path: '/socket.io',
      autoConnect: true,
      transports: config.options.transports as ('websocket' | 'polling')[],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[WS] Connected. SID:', this.socket?.id);
      this.notifyStatus(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason);
      this.notifyStatus(false);
    });

    this.socket.on('connect_error', (err) => {
      // Don't flood console if polling fails repeatedly while proxy is waking up
      if (err.message !== 'xhr poll error') {
        console.error('[WS] Connection error:', err.message);
      }
      this.notifyStatus(false);
    });
  }

  disconnect() {
    if (USE_MOCK) {
      this.stopMockSimulation();
      return;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.notifyStatus(false);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // --- Frame streaming ---

  subscribeToFrames(onFrame: FrameCallback) {
    if (USE_MOCK) {
      this.startMockFrameSimulation(onFrame);
      return;
    }
    if (!this.socket) this.connect();
    this.socket?.on('frame_stream', (data: AnnotatedFrameResponse) => {
      onFrame(data);
    });
  }

  unsubscribeFromFrames(onFrame?: FrameCallback) {
    if (USE_MOCK) {
      if (this.mockInterval) clearInterval(this.mockInterval);
      return;
    }
    if (onFrame) {
      this.socket?.off('frame_stream', onFrame);
    } else {
      this.socket?.off('frame_stream');
    }
  }

  private isSendingFrame = false;

  async sendFrame(base64Frame: string, timestamp: number, location?: { lat: number; lng: number }) {
    if (USE_MOCK || this.isSendingFrame) return;

    this.isSendingFrame = true;
    try {
      if (!this.socket?.connected) {
        this.connect();
        // Wait up to 500ms for the connection before sending first frame
        await new Promise(r => setTimeout(r, 500));
      }
      if (this.socket?.connected) {
        this.socket.emit('raw_frame', { frame: base64Frame, timestamp, location });
      }
    } catch (e) {
      console.error('[WS] sendFrame error:', e);
    } finally {
      this.isSendingFrame = false;
    }
  }

  // --- Alert subscription ---

  private processedAlertIds = new Set<string>();

  subscribeToAlerts(onAlert: AlertCallback) {
    if (USE_MOCK) {
      this.startMockAlertSimulation(onAlert);
      return;
    }
    if (!this.socket) this.connect();
    this.socket?.on('new_alert', (alert: Incident) => {
      if (!this.processedAlertIds.has(alert.id)) {
        this.processedAlertIds.add(alert.id);
        onAlert(alert);
      }
      if (this.processedAlertIds.size > 100) {
        const iterator = this.processedAlertIds.values();
        for (let i = 0; i < 20; i++) this.processedAlertIds.delete(iterator.next().value!);
      }
    });
  }

  unsubscribeFromAlerts() {
    if (USE_MOCK) {
      if (this.mockAlertInterval) clearInterval(this.mockAlertInterval);
      return;
    }
    this.socket?.off('new_alert');
  }

  // --- Mock simulation ---

  private startMockFrameSimulation(onFrame: FrameCallback) {
    if (this.mockInterval) clearInterval(this.mockInterval);
    let ts = 0;
    this.mockInterval = setInterval(() => {
      ts += 0.5;
      const hasDetection = Math.random() > 0.7;
      const detections: any[] = [];
      if (hasDetection) {
        const types = ['pothole', 'animal', 'accident'];
        const severities = ['low', 'medium', 'high', 'critical'] as const;
        detections.push({
          bbox: [50, 50, 100, 100] as [number, number, number, number],
          class: types[Math.floor(Math.random() * types.length)],
          confidence: 0.7 + Math.random() * 0.25,
          severity: severities[Math.floor(Math.random() * severities.length)],
        });
      }
      onFrame({
        annotatedFrame: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
        detections,
        timestamp: ts,
      });
    }, 1000);
  }

  private startMockAlertSimulation(onAlert: AlertCallback) {
    if (this.mockAlertInterval) clearInterval(this.mockAlertInterval);
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

// Singleton export
export const wsService = new WebSocketService();
