import { Incident, Camera, AnalyticsSummary, HeatmapPoint } from './types';
import { MOCK_INCIDENTS, MOCK_CAMERAS, MOCK_ANALYTICS, MOCK_HEATMAP } from './mock-data';

// Determine if we should use actual fetch calls (defaults to false for UI-core)
// When backend merges, we can flip this or base it on an env var
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getIncidents(): Promise<Incident[]> {
  if (USE_MOCK) {
    await delay(500);
    return MOCK_INCIDENTS.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  const res = await fetch('/api/incidents');
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_INCIDENTS.find(i => i.id === id) || null;
  }
  const res = await fetch(`/api/incidents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch incident');
  return res.json();
}

export async function updateIncidentStatus(id: string, status: string): Promise<Incident> {
  if (USE_MOCK) {
    await delay(400);
    const incident = MOCK_INCIDENTS.find(i => i.id === id);
    if (!incident) throw new Error('Incident not found');
    incident.status = status as any;
    return incident;
  }
  const res = await fetch(`/api/alerts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update incident');
  return res.json();
}

export async function getCameras(): Promise<Camera[]> {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_CAMERAS;
  }
  const res = await fetch('/api/cameras');
  if (!res.ok) throw new Error('Failed to fetch cameras');
  return res.json();
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (USE_MOCK) {
    await delay(600);
    return MOCK_ANALYTICS;
  }
  const res = await fetch('/api/analytics/summary');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function getHeatmapData(): Promise<HeatmapPoint[]> {
  if (USE_MOCK) {
    await delay(500);
    return MOCK_HEATMAP;
  }
  const res = await fetch('/api/analytics/heatmap');
  if (!res.ok) throw new Error('Failed to fetch heatmap data');
  return res.json();
}
