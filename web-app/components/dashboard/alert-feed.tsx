import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { HazardIcon } from "@/components/shared/hazard-icon"
import { SeverityBadge } from "@/components/shared/severity-badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { Incident } from "@/lib/types"
import { getIncidents, updateIncidentStatus } from "@/lib/api"
import { wsService } from "@/lib/websocket"
import { formatTimeAgo } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

export function AlertFeed() {
  const [alerts, setAlerts] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch initial alerts
  useEffect(() => {
    getIncidents()
      .then(data => {
        // Show only active or recent alerts for the feed
        const activeAlerts = data.filter(a => a.status !== 'resolved').slice(0, 50)
        setAlerts(activeAlerts)
      })
      .catch(console.error)
      .finally(() => setLoading(false))

    // Subscribe to real-time new alerts
    wsService.connect()
    
    // In mock mode, this will return alerts based on the simulation
    const handleNewAlert = (newAlert: Incident) => {
      setAlerts(prev => [newAlert, ...prev].slice(0, 50))
      
      // Show toast for critical/high alerts
      if (newAlert.severity_label === 'critical' || newAlert.severity_label === 'high') {
        toast.error(`${newAlert.hazard_type.toUpperCase()} ALERT: ${newAlert.camera?.name || 'Camera'}`, {
          description: `Score: ${newAlert.severity_score} - Needs immediate attention`,
          action: { label: "View", onClick: () => window.location.href = `/dashboard/incidents/${newAlert.id}` }
        })
      }
    }

    wsService.subscribeToAlerts(handleNewAlert)

    return () => {
      wsService.unsubscribeFromAlerts()
    }
  }, [])

  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await updateIncidentStatus(id, 'acknowledged')
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a))
      toast.success("Alert acknowledged")
    } catch (error) {
      toast.error("Failed to acknowledge alert")
    }
  }

  return (
    <Card className="flex flex-col h-full shadow-md">
      <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Real-Time Alert Feed</CardTitle>
        <div className="flex gap-2">
          {/* Add filter toggles here later */}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full px-4">
          <div className="flex flex-col gap-3 py-4">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No active alerts. System is clear.</div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`
                    flex flex-col border rounded-lg overflow-hidden transition-colors hover:bg-muted/30
                    ${alert.status === 'new' && alert.severity_label === 'critical' ? 'border-destructive/50 bg-destructive/5' : ''}
                  `}
                >
                  <div className="flex items-start p-4 gap-4">
                    <div className="mt-1">
                      <div className="p-2.5 bg-muted rounded-full">
                        <HazardIcon type={alert.hazard_type} className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-base capitalize truncate">
                          {alert.hazard_type} Detected
                        </h4>
                        <div className="flex gap-2 items-center shrink-0">
                          <StatusBadge status={alert.status} />
                          <SeverityBadge severity={alert.severity_label} />
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="truncate" title={alert.camera?.name || alert.camera_id}>
                          📍 {alert.camera?.name || alert.camera_id}
                        </div>
                        <div className="text-right">
                          ⏱ {formatTimeAgo(alert.created_at)}
                        </div>
                        <div>
                          Score: {alert.severity_score}/100
                        </div>
                        <div className="text-right">
                          Conf: {(alert.confidence * 100).toFixed(0)}%
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 pt-3 border-t">
                        {alert.status === 'new' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1 h-8"
                            onClick={(e) => handleAcknowledge(alert.id, e)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        <Link href={`/dashboard/incidents/${alert.id}`} className={alert.status === 'new' ? "flex-1" : "w-full"}>
                          <Button variant="outline" size="sm" className="w-full h-8">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
