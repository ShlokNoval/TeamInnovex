"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { getCameras, getHeatmapData, getIncidents } from "@/lib/api"
import { Camera, HeatmapPoint, Incident } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSeverityColor } from "@/lib/utils"

// Fix Leaflet default icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Create custom icons for hazard severities
const getMarkerColor = (severity: string) => {
  if (severity === 'critical') return '#dc2626'
  if (severity === 'high') return '#ef4444'
  if (severity === 'medium') return '#f97316'
  return '#22c55e'
}

export default function MapComponent() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([])
  const [loading, setLoading] = useState(true)

  // Map center (Aurangabad roughly based on mock data)
  const center: [number, number] = [19.8762, 75.3433]

  useEffect(() => {
    Promise.all([
      getCameras(),
      getIncidents(),
      getHeatmapData()
    ])
    .then(([camData, incData, heatData]) => {
      setCameras(camData)
      setIncidents(incData.filter(i => i.status !== 'resolved' && i.latitude && i.longitude))
      setHeatmapData(heatData)
    })
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-full w-full flex items-center justify-center bg-muted/20 animate-pulse">Loading Map Data...</div>

  return (
    <div className="h-full w-full relative group">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          className="map-tiles"
        />

        {/* Heatmap Layer (Simplified using CircleMarkers for demo) */}
        {heatmapData.map((point, idx) => (
          <CircleMarker
            key={`heat-${idx}`}
            center={[point.latitude, point.longitude]}
            radius={point.intensity * 30}
            pathOptions={{ 
              color: 'transparent',
              fillColor: '#ef4444',
              fillOpacity: point.intensity * 0.25 
            }}
          />
        ))}

        {/* Active Incidents */}
        {incidents.map((incident) => {
          if (!incident.latitude || !incident.longitude) return null
          
          return (
            <CircleMarker
              key={`inc-${incident.id}`}
              center={[incident.latitude, incident.longitude]}
              radius={8}
              pathOptions={{
                color: '#020617', // slate-950
                weight: 2,
                fillColor: getMarkerColor(incident.severity_label),
                fillOpacity: 0.9
              }}
            >
              <Popup className="incident-popup bg-transparent drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] border-0">
                <div className="p-3 min-w-[220px] bg-slate-900 border border-slate-700 rounded-lg text-slate-200">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <span className="font-bold capitalize text-indigo-400 tracking-wider text-sm">{incident.hazard_type}</span>
                    <Badge variant="outline" className={`text-[10px] capitalize font-mono ${getSeverityColor(incident.severity_label)} bg-slate-950`}>
                      {incident.severity_label}
                    </Badge>
                  </div>
                  <div className="text-xs space-y-2 mb-4 font-mono text-slate-400">
                    <p><span className="text-slate-500">ID:</span> {incident.id.split('-')[0] + '...'}</p>
                    <p className="flex justify-between"><span className="text-slate-500">SCORE:</span> <span className="text-amber-400">{incident.severity_score}/100</span></p>
                    <p className="flex justify-between"><span className="text-slate-500">NODE:</span> <span className="text-cyan-400">{incident.camera?.name || incident.camera_id}</span></p>
                  </div>
                  <a href={`/dashboard/incidents/${incident.id}`} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold tracking-wider block text-center border-t border-slate-800 pt-3 w-full transition-colors">
                    ACCESS LOGIC DETAILS
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

        {/* Camera Locations */}
        {cameras.map((camera) => (
          <Marker 
            key={`cam-${camera.id}`}
            position={[camera.latitude, camera.longitude]}
          >
            <Popup className="bg-transparent border-0 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
              <div className="p-3 min-w-[180px] bg-slate-900 border border-slate-700 rounded-lg text-slate-200">
                <div className="text-sm font-bold tracking-wider text-indigo-400 mb-1">{camera.name}</div>
                <div className="text-xs text-slate-500 font-mono mb-3">{camera.location_name}</div>
                <div className="text-xs pb-1 flex items-center gap-2 font-mono border-t border-slate-800 pt-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${camera.active ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`} />
                  <span className={camera.active ? 'text-emerald-400' : 'text-red-500'}>{camera.active ? 'UPLINK ACTIVE' : 'NODE OFFLINE'}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <Card className="absolute bottom-6 left-6 z-[1000] p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-slate-700 bg-slate-900/90 backdrop-blur-md">
        <div className="text-xs font-bold tracking-wider text-slate-400 mb-3 border-b border-slate-800 pb-2">MAP LEGEND</div>
        <div className="space-y-2.5 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[#dc2626] shadow-[0_0_8px_rgba(220,38,38,0.8)]" /> CRITICAL ALERT</div>
          <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_5px_rgba(239,68,68,0.5)]" /> HIGH RISK</div>
          <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[#f97316]" /> MEDIUM RISK</div>
          <div className="flex items-center gap-3"><div className="w-3 h-3 bg-red-500 opacity-40 rounded-full" /> INCIDENT HEATMAP</div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800"><div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> ACTIVE NODE</div>
        </div>
      </Card>

      {/* Override leaflet popup default styles to match dark theme */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #94a3b8 !important;
          top: 8px !important;
          right: 8px !important;
        }
      `}} />
    </div>
  )
}
