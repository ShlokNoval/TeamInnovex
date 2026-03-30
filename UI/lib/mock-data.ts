import { Camera, Incident, AnalyticsSummary, HeatmapPoint } from "./types";
import { subHours, subDays, subMinutes } from "date-fns";

const now = new Date();

export const MOCK_CAMERAS: Camera[] = [
  { id: "cam-01", name: "Jalna Road CCTV 1", location_name: "Aurangabad", latitude: 19.8762, longitude: 75.3433, active: true, created_at: subDays(now, 30).toISOString(), rtsp_url: "rtsp://mock-cam-01" },
  { id: "cam-02", name: "Beed Bypass Junct", location_name: "Aurangabad", latitude: 19.8541, longitude: 75.3219, active: true, created_at: subDays(now, 25).toISOString(), rtsp_url: "rtsp://mock-cam-02" },
  { id: "cam-03", name: "Pune Highway Toll", location_name: "Pune", latitude: 18.5204, longitude: 73.8567, active: true, created_at: subDays(now, 10).toISOString(), rtsp_url: "rtsp://mock-cam-03" },
  { id: "cam-04", name: "Mumbai Express", location_name: "Mumbai", latitude: 19.0760, longitude: 72.8777, active: false, created_at: subDays(now, 5).toISOString(), rtsp_url: "rtsp://mock-cam-04" },
  { id: "cam-05", name: "CIDCO N-4 Corner", location_name: "Aurangabad", latitude: 19.8820, longitude: 75.3520, active: true, created_at: subDays(now, 30).toISOString(), rtsp_url: "rtsp://mock-cam-05" },
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-101",
    camera_id: "cam-01",
    hazard_type: "pothole",
    severity_label: "high",
    severity_score: 85,
    confidence: 0.92,
    status: "new",
    latitude: 19.8762,
    longitude: 75.3433,
    created_at: subMinutes(now, 5).toISOString(),
    updated_at: subMinutes(now, 5).toISOString(),
    camera: MOCK_CAMERAS[0],
    snapshots: [{ id: "snap-1", incident_id: "inc-101", image_url: "/uploads/mock-pothole.jpg", frame_type: "detection", created_at: subMinutes(now, 5).toISOString() }],
  },
  {
    id: "inc-102",
    camera_id: "cam-02",
    hazard_type: "animal",
    severity_label: "critical",
    severity_score: 95,
    confidence: 0.88,
    status: "acknowledged",
    latitude: 19.8541,
    longitude: 75.3219,
    metadata: { animal_type: "cow", behavior: "crossing" },
    created_at: subMinutes(now, 15).toISOString(),
    updated_at: subMinutes(now, 10).toISOString(),
    camera: MOCK_CAMERAS[1],
  },
  {
    id: "inc-103",
    camera_id: "cam-03",
    hazard_type: "accident",
    severity_label: "high",
    severity_score: 75,
    confidence: 0.95,
    status: "new",
    latitude: 18.5205,
    longitude: 73.8568,
    metadata: { vehicles_involved: 2, human_presence: true, traffic_disruption: "high" },
    created_at: subMinutes(now, 2).toISOString(),
    updated_at: subMinutes(now, 2).toISOString(),
    camera: MOCK_CAMERAS[2],
  },
  {
    id: "inc-104",
    camera_id: "cam-05",
    hazard_type: "pothole",
    severity_label: "medium",
    severity_score: 45,
    confidence: 0.76,
    status: "resolved",
    latitude: 19.8820,
    longitude: 75.3520,
    created_at: subDays(now, 1).toISOString(),
    updated_at: subHours(now, 2).toISOString(),
    camera: MOCK_CAMERAS[4],
  },
  {
    id: "inc-105",
    camera_id: "cam-01",
    hazard_type: "animal",
    severity_label: "low",
    severity_score: 20,
    confidence: 0.97,
    status: "new",
    latitude: 19.8763,
    longitude: 75.3434,
    metadata: { animal_type: "dog", behavior: "standing" },
    created_at: subMinutes(now, 45).toISOString(),
    updated_at: subMinutes(now, 45).toISOString(),
    camera: MOCK_CAMERAS[0],
  }
];

export const MOCK_ANALYTICS: AnalyticsSummary = {
  total_detections: 1247,
  by_type: {
    pothole: 523,
    animal: 412,
    accident: 312
  },
  by_severity: {
    low: 450,
    medium: 500,
    high: 200,
    critical: 97
  },
  today_count: 47,
  hourly_breakdown: Array.from({ length: 24 }).map((_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 50) + 10,
  }))
};

export const MOCK_HEATMAP: HeatmapPoint[] = [
  { latitude: 19.8762, longitude: 75.3433, intensity: 0.9 },
  { latitude: 19.8541, longitude: 75.3219, intensity: 0.7 },
  { latitude: 18.5204, longitude: 73.8567, intensity: 0.8 },
  { latitude: 19.0760, longitude: 72.8777, intensity: 0.4 },
  { latitude: 19.8820, longitude: 75.3520, intensity: 0.6 },
];
