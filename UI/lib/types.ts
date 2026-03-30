export type HazardType = "pothole" | "animal" | "accident";
export type SeverityLabel = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "new" | "acknowledged" | "resolved";

export interface Camera {
  id: string;
  name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  rtsp_url?: string;
  active: boolean;
  created_at: string;
}

export interface IncidentSnapshot {
  id: string;
  incident_id: string;
  image_url: string;
  frame_time?: number;
  frame_type: "before" | "after" | "detection";
  created_at: string;
}

export interface IncidentHistory {
  id: string;
  incident_id: string;
  event_type: string;
  notes?: string;
  event_time: string;
}

// Main incident/alert payload standard
export interface Incident {
  id: string;
  camera_id: string;
  hazard_type: HazardType;
  severity_label: SeverityLabel;
  severity_score: number;
  confidence: number;
  status: IncidentStatus;
  latitude?: number;
  longitude?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
  snapshots?: IncidentSnapshot[];
  history?: IncidentHistory[];
  camera?: Camera;
}

// Used for real-time WebSocket frames
export interface Detection {
  bbox: [number, number, number, number];
  class: string;
  confidence: number;
  severity?: SeverityLabel;
}

export interface AnnotatedFrameResponse {
  annotatedFrame: string; // Base64
  detections: Detection[];
  timestamp: number;
}

export interface AnalyticsSummary {
  total_detections: number;
  by_type: Record<HazardType, number>;
  by_severity: Record<SeverityLabel, number>;
  today_count: number;
  hourly_breakdown: { hour: number; count: number }[];
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number;
}
