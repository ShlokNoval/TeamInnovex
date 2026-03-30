import { Incident, Camera, AnalyticsSummary, HeatmapPoint } from './types';

// Determine if we should use actual fetch calls
const USE_MOCK = false; // Forced to false for live integration
const API_BASE_URL = '/api'; // Proxied through Next.js to Flask backend at localhost:8000


// Helper to get auth header from localStorage
const getAuthOptions = (method: string = 'GET'): RequestInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return {
    method,
    headers
  };
};

export async function getIncidents(): Promise<Incident[]> {
  if (USE_MOCK) {
    const { MOCK_INCIDENTS } = await import('./mock-data');
    return MOCK_INCIDENTS.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  
  const res = await fetch(`${API_BASE_URL}/alerts`, getAuthOptions());
  if (!res.ok) throw new Error('Failed to fetch incidents');
  const data = await res.json();
  
  // Map backend Alert model to frontend Incident type
  return data.map((a: any) => ({
    id: a.id,
    camera_id: 'cam-001', // Backend is missing camera_id in list, defaulting
    hazard_type: a.type,
    severity_label: a.level,
    severity_score: a.score,
    confidence: 0.95, // Default confidence
    status: a.status,
    created_at: a.time,
    updated_at: a.time
  }));
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  if (USE_MOCK) {
    const { MOCK_INCIDENTS } = await import('./mock-data');
    return MOCK_INCIDENTS.find(i => i.id === id) || null;
  }
  // Backend lacks a single-alert GET in routes.py, but we can filter the list
  const all = await getIncidents();
  return all.find(i => i.id === id) || null;
}

export async function updateIncidentStatus(id: string, status: string): Promise<any> {
  if (USE_MOCK) {
    const { MOCK_INCIDENTS } = await import('./mock-data');
    const incident = MOCK_INCIDENTS.find(i => i.id === id);
    if (!incident) throw new Error('Incident not found');
    incident.status = status as any;
    return incident;
  }
  
  const endpoint = status === 'acknowledged' ? 'acknowledge' : 'resolve';
  const res = await fetch(`${API_BASE_URL}/alerts/${id}/${endpoint}`, getAuthOptions('POST'));
  
  if (!res.ok) throw new Error(`Failed to ${endpoint} incident`);
  return res.json();
}

export async function getCameras(): Promise<Camera[]> {
  if (USE_MOCK) {
    const { MOCK_CAMERAS } = await import('./mock-data');
    return MOCK_CAMERAS;
  }
  // Backend doesn't have a camera route yet, return mock for now but allow for API expansion
  const { MOCK_CAMERAS } = await import('./mock-data');
  return MOCK_CAMERAS;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (USE_MOCK) {
    const { MOCK_ANALYTICS } = await import('./mock-data');
    return MOCK_ANALYTICS;
  }
  const res = await fetch(`${API_BASE_URL}/analytics`, getAuthOptions());
  if (!res.ok) throw new Error('Failed to fetch analytics');
  const data = await res.json();
  
  // Format the raw analytics metrics returned by backend
  return {
    total_detections: data.total_detections || 0,
    by_type: {
      pothole: data.pothole_count || 0,
      animal: data.animal_count || 0,
      accident: data.accident_count || 0
    },
    by_severity: {
      low: 10,  // Sample values if backend doesn't provide breakdown yet
      medium: 15,
      high: 5,
      critical: 2
    },
    today_count: data.today_detections || 0,
    hourly_breakdown: []
  };
}

export async function getHeatmapData(): Promise<HeatmapPoint[]> {
  if (USE_MOCK) {
    const { MOCK_HEATMAP } = await import('./mock-data');
    return MOCK_HEATMAP;
  }
  // Backend doesn't have heatmap route yet
  const { MOCK_HEATMAP } = await import('./mock-data');
  return MOCK_HEATMAP;
}

