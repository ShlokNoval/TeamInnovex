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

  // Fetch initial alerts + poll every 5s for updates
  useEffect(() => {
    const fetchAlerts = () => {
      getIncidents()
        .then(data => {
          const activeAlerts = data.filter(a => a.status !== 'resolved').slice(0, 50)
          setAlerts(activeAlerts)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }

    fetchAlerts()
    const pollInterval = setInterval(fetchAlerts, 5000)

    // Subscribe to real-time new alerts
    wsService.connect()
    
    const handleNewAlert = (newAlert: Incident) => {
      setAlerts(prev => {
        // Avoid duplicates by checking if this ID is already in the list
        if (prev.some(a => a.id === newAlert.id)) return prev
        return [newAlert, ...prev].slice(0, 50)
      })
      
      // Show toast for critical/high alerts
      const sev = newAlert.severity_label?.toLowerCase()
      if (sev === 'critical' || sev === 'high') {
        toast.error(`${newAlert.hazard_type.toUpperCase()} ALERT: ${newAlert.camera?.name || 'Camera'}`, {
          description: `Score: ${newAlert.severity_score} - Needs immediate attention`,
          action: { label: "View", onClick: () => window.location.href = `/dashboard/incidents/${newAlert.id}` }
        })
      }
    }

    wsService.subscribeToAlerts(handleNewAlert)

    return () => {
      clearInterval(pollInterval)
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
    <Card className="flex flex-col h-full shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-border bg-card/40 backdrop-blur-md relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
      <CardHeader className="py-4 px-6 border-b border-border flex flex-row items-center justify-between relative z-10 bg-card/60">
        <CardTitle className="text-lg font-bold tracking-wider text-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          ACTIVE INCIDENT FEED
        </CardTitle>
        <div className="flex gap-2 text-xs font-mono text-muted-foreground">
          LIVE UPLINK
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative z-10">
        <ScrollArea className="h-full px-4">
          <div className="flex flex-col gap-3 py-4">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground font-mono text-sm animate-pulse">ESTABLISHING NEURAL LINK...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground font-mono text-sm">NO ACTIVE INCIDENTS. GRID SECURE.</div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`
                    flex flex-col border rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-default
                    ${alert.status === 'new' && alert.severity_label === 'critical' 
                      ? 'border-destructive/50 bg-destructive/5 dark:bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                      : alert.status === 'new' && alert.severity_label === 'high'
                      ? 'border-orange-500/40 bg-orange-500/5 dark:bg-orange-950/10 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
                      : 'border-border bg-card/50 hover:bg-accent hover:border-primary/30'}
                  `}
                >
                  <div className="flex items-start p-4 gap-4">
                    <div className="mt-1">
                      <div className={`p-2.5 rounded-lg border ${
                        alert.severity_label === 'critical' ? 'bg-destructive/10 border-destructive/30 text-destructive' :
                        alert.severity_label === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400' :
                        'bg-muted border-border text-muted-foreground'
                      }`}>
                        <HazardIcon type={alert.hazard_type} className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-[15px] uppercase tracking-wide text-foreground truncate">
                          {alert.hazard_type} DETECTED
                        </h4>
                        <div className="flex gap-2 items-center shrink-0">
                          <StatusBadge status={alert.status} />
                          <SeverityBadge severity={alert.severity_label} />
                        </div>
                      </div>
                      
                      <div className="text-sm font-mono text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-2 mt-1 bg-muted/50 dark:bg-slate-950/50 p-2.5 rounded-md border border-border">
                        <div className="truncate flex items-center gap-1.5" title={alert.camera?.name || alert.camera_id}>
                          <span className="text-primary dark:text-orange-400">LOC:</span> {alert.camera?.name || alert.camera_id}
                        </div>
                        <div className="text-right flex items-center justify-end gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400">T-MINUS:</span> {formatTimeAgo(alert.created_at)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-600 dark:text-amber-400">RISK:</span> <span className="text-foreground">{alert.severity_score}/100</span>
                        </div>
                        <div className="text-right flex items-center justify-end gap-1.5">
                          <span className="text-orange-600 dark:text-orange-400">CONF:</span> <span className="opacity-80">{(alert.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {alert.status === 'new' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1 h-8 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-mono text-xs tracking-wider"
                            onClick={(e) => handleAcknowledge(alert.id, e)}
                          >
                            ACKNOWLEDGE
                          </Button>
                        )}
                        <Link href={`/dashboard/incidents/${alert.id}`} className={alert.status === 'new' ? "flex-1" : "w-full"}>
                          <Button variant="outline" size="sm" className="w-full h-8 border-border bg-transparent hover:bg-accent text-foreground font-mono text-xs tracking-wider">
                            VIEW LOGIC
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
