"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getIncidentById, updateIncidentStatus } from "@/lib/api"
import { Incident } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HazardIcon } from "@/components/shared/hazard-icon"
import { SeverityBadge } from "@/components/shared/severity-badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatTimeAgo } from "@/lib/utils"
import { format } from "date-fns"
import { ArrowLeft, Clock, MapPin, AlertCircle, PlaySquare, FileCheck2, Send } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      getIncidentById(params.id as string)
        .then(data => {
          if (data) setIncident(data)
          else router.push('/dashboard/incidents')
        })
        .catch(err => {
          console.error(err)
          toast.error("Failed to load incident details")
        })
        .finally(() => setLoading(false))
    }
  }, [params.id, router])

  const handleStatusChange = async (newStatus: string) => {
    if (!incident) return
    try {
      await updateIncidentStatus(incident.id, newStatus)
      setIncident({ ...incident, status: newStatus as any })
      toast.success(`Incident marked as ${newStatus}`)
    } catch (e) {
      toast.error("Failed to update status")
    }
  }

  if (loading || !incident) {
    return <div className="p-8 flex items-center justify-center min-h-[500px]">Loading incident data...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/incidents">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            Incident Details
            <StatusBadge status={incident.status} />
          </h2>
          <p className="text-muted-foreground text-sm font-mono mt-1">ID: {incident.id}</p>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          {incident.status !== 'resolved' && (
            <>
              {incident.status === 'new' && (
                <Button onClick={() => handleStatusChange('acknowledged')} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <PlaySquare className="mr-2 h-4 w-4" /> Acknowledge
                </Button>
              )}
              <Button onClick={() => handleStatusChange('resolved')} className="bg-green-600 hover:bg-green-700 text-white">
                <FileCheck2 className="mr-2 h-4 w-4" /> Mark Resolved
              </Button>
            </>
          )}
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" /> Forward Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Hazard Type</div>
                <div className="flex items-center gap-2 text-lg font-medium capitalize">
                  <HazardIcon type={incident.hazard_type} className="w-5 h-5" />
                  {incident.hazard_type}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Severity</div>
                  <SeverityBadge severity={incident.severity_label} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Score / Conf</div>
                  <div className="font-mono">{incident.severity_score} / {(incident.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>

              {incident.metadata && (
                <div className="mt-4 p-3 bg-muted/30 rounded-md border text-sm">
                  <div className="font-semibold mb-2 text-muted-foreground">AI Metadata</div>
                  <pre className="font-mono text-xs whitespace-pre-wrap">
                    {JSON.stringify(incident.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                Location & Origin
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Camera Source</div>
                <div className="font-medium">{incident.camera?.name || incident.camera_id}</div>
                <div className="text-sm text-muted-foreground">{incident.camera?.location_name}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Coordinates</div>
                <div className="font-mono text-sm">
                  {incident.latitude ? `${incident.latitude.toFixed(4)}, ${incident.longitude?.toFixed(4)}` : 'GPS Unavailable'}
                </div>
              </div>

              <div className="h-32 bg-muted/50 rounded-md border flex items-center justify-center text-muted-foreground text-sm relative overflow-hidden">
                {/* Fallback mini-map placeholder */}
                <MapPin className="w-8 h-8 text-primary/40 absolute" />
                <span>Map View Unavailable (Dev Mode)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">First Detected</div>
                <div>{format(new Date(incident.created_at), 'PPP')}</div>
                <div className="text-sm text-muted-foreground">{format(new Date(incident.created_at), 'HH:mm:ss')} ({formatTimeAgo(incident.created_at)})</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                <div>{format(new Date(incident.updated_at), 'PPP')}</div>
                <div className="text-sm text-muted-foreground">{format(new Date(incident.updated_at), 'HH:mm:ss')}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Images and Evidence */}
        <div className="space-y-6 md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>Visual Evidence</CardTitle>
              <CardDescription>Frames extracted by AI engine during detection</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col items-center justify-center bg-muted/10">
              {incident.snapshots && incident.snapshots.length > 0 ? (
                <div className="w-full space-y-4">
                  {incident.snapshots.map((snap, i) => (
                    <div key={snap.id} className="relative rounded-lg border overflow-hidden bg-black/5 aspect-video flex items-center justify-center">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={snap.image_url} alt="Incident Evidence" className="w-full h-full object-contain" />
                       <Badge variant="secondary" className="absolute top-2 left-2 uppercase tracking-wider text-[10px]">
                         {snap.frame_type.toUpperCase()} FRAME
                       </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl w-full">
                  <HazardIcon type={incident.hazard_type} className="w-16 h-16 mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-1">No Snapshots Available</h3>
                  <p className="text-sm max-w-[250px]">Image data was not stored or has been purged for this incident.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
