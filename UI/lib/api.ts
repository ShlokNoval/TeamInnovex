import { Incident, Camera, AnalyticsSummary, HeatmapPoint } from './types';

// Backend API base URL — proxied through Next.js rewrites in production,
// or direct in local dev
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getIncidents(): Promise<Incident[]> {
  return apiFetch<Incident[]>('/api/incidents');
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  try {
    return await apiFetch<Incident>(`/api/incidents/${id}`);
  } catch {
    return null;
  }
}

export async function updateIncidentStatus(id: string, status: string): Promise<Incident> {
  return apiFetch<Incident>(`/api/alerts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function getCameras(): Promise<Camera[]> {
  return apiFetch<Camera[]>('/api/cameras');
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>('/api/analytics/summary');
}

export async function getHeatmapData(): Promise<HeatmapPoint[]> {
  return apiFetch<HeatmapPoint[]>('/api/analytics/heatmap');
}
