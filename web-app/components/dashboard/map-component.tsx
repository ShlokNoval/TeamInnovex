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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
              fillOpacity: point.intensity * 0.4 
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
                color: '#fff',
                weight: 2,
                fillColor: getMarkerColor(incident.severity_label),
                fillOpacity: 1
              }}
            >
              <Popup className="incident-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold capitalize">{incident.hazard_type}</span>
                    <Badge variant="outline" className={`text-[10px] capitalize ${getSeverityColor(incident.severity_label)}`}>
                      {incident.severity_label}
                    </Badge>
                  </div>
                  <div className="text-xs space-y-1 mb-3">
                    <p><span className="text-muted-foreground">ID:</span> {incident.id}</p>
                    <p><span className="text-muted-foreground">Score:</span> {incident.severity_score}</p>
                    <p><span className="text-muted-foreground">Camera:</span> {incident.camera?.name || incident.camera_id}</p>
                  </div>
                  <a href={`/dashboard/incidents/${incident.id}`} className="text-xs text-primary hover:underline block text-center border-t pt-2 w-full">
                    View Full Details
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
            <Popup>
              <div className="text-sm font-medium">{camera.name}</div>
              <div className="text-xs text-muted-foreground">{camera.location_name}</div>
              <div className="text-xs mt-1 flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${camera.active ? 'bg-green-500' : 'bg-red-500'}`} />
                {camera.active ? 'Active' : 'Offline'}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <Card className="absolute bottom-6 left-6 z-1000 p-3 shadow-lg bg-background/95 backdrop-blur">
        <div className="text-xs font-semibold mb-2">Legend</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#dc2626] border-2 border-white shadow-sm" /> Critical Alert</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444] border-2 border-white shadow-sm" /> High Alert</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f97316] border-2 border-white shadow-sm" /> Medium Alert</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 opacity-50 rounded-full" /> Heatmap Intensity</div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t"><img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" className="h-4 w-auto grayscale opacity-50" alt="camera" /> CCTV Camera</div>
        </div>
      </Card>

      {/* Tailwind dark mode support for map tile layer via CSS filter */}
      <style dangerouslySetInnerHTML={{__html: `
        .dark .map-tiles {
          filter: invert(1) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      `}} />
    </div>
  )
}
