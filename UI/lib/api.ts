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
  
  try {
    const res = await fetch(`${API_BASE_URL}/alerts`, getAuthOptions());
    if (!res.ok) {
      console.warn(`Alerts API returned ${res.status}, falling back to mock data`);
      const { MOCK_INCIDENTS } = await import('./mock-data');
      return MOCK_INCIDENTS.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    const data = await res.json();
    
    // Map backend Alert model to frontend Incident type
    return data.map((a: any) => ({
      id: a.id,
      camera_id: 'cam-001', // Backend is missing camera_id in list, defaulting
      hazard_type: a.type,
      severity_label: a.level, // Backend returns 'level' which maps to 'alert_level'
      severity_score: a.score, // Backend returns 'score' which maps to 'severity_score'
      confidence: a.confidence || 0.95,
      status: a.status,
      latitude: a.latitude,
      longitude: a.longitude,
      created_at: a.time,
      updated_at: a.time
    }));
  } catch (err) {
    console.warn('Failed to fetch incidents, using mock data:', err);
    const { MOCK_INCIDENTS } = await import('./mock-data');
    return MOCK_INCIDENTS.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
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
  
  try {
    const res = await fetch(`${API_BASE_URL}/analytics`, getAuthOptions());
    if (!res.ok) {
      console.warn(`Analytics API returned ${res.status}, falling back to mock data`);
      const { MOCK_ANALYTICS } = await import('./mock-data');
      return MOCK_ANALYTICS;
    }
    const data = await res.json();
    
    // Format the raw analytics metrics returned by backend
    const severity = data.by_severity || { low: 0, medium: 0, high: 0, critical: 0 };
    
    return {
      total_detections: data.total_detections || 0,
      by_type: {
        pothole: data.pothole_count || 0,
        animal: data.animal_count || 0,
        accident: data.accident_count || 0
      },
      by_severity: {
        low: severity.low || 0,
        medium: severity.medium || 0,
        high: severity.high || 0,
        critical: severity.critical || 0
      },
      today_count: data.today_detections || 0,
      hourly_breakdown: data.hourly_breakdown || []
    };
  } catch (err) {
    console.warn('Failed to fetch analytics, using mock data:', err);
    const { MOCK_ANALYTICS } = await import('./mock-data');
    return MOCK_ANALYTICS;
  }
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

