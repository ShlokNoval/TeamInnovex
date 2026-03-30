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
    <Card className="flex flex-col h-full shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-slate-800/80 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      <CardHeader className="py-4 px-6 border-b border-slate-800/60 flex flex-row items-center justify-between relative z-10 bg-slate-900/60">
        <CardTitle className="text-lg font-bold tracking-wider text-slate-200 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          ACTIVE INCIDENT FEED
        </CardTitle>
        <div className="flex gap-2 text-xs font-mono text-slate-500">
          LIVE UPLINK
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative z-10">
        <ScrollArea className="h-full px-4">
          <div className="flex flex-col gap-3 py-4">
            {loading ? (
              <div className="text-center py-10 text-slate-500 font-mono text-sm animate-pulse">ESTABLISHING NEURAL LINK...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-mono text-sm">NO ACTIVE INCIDENTS. GRID SECURE.</div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`
                    flex flex-col border rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-default
                    ${alert.status === 'new' && alert.severity_label === 'critical' 
                      ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                      : alert.status === 'new' && alert.severity_label === 'high'
                      ? 'border-orange-500/40 bg-orange-950/10 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
                      : 'border-slate-800/60 bg-slate-900/50 hover:bg-slate-800/80 hover:border-indigo-500/30'}
                  `}
                >
                  <div className="flex items-start p-4 gap-4">
                    <div className="mt-1">
                      <div className={`p-2.5 rounded-lg border ${
                        alert.severity_label === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                        alert.severity_label === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                        'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        <HazardIcon type={alert.hazard_type} className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-[15px] uppercase tracking-wide text-slate-200 truncate">
                          {alert.hazard_type} DETECTED
                        </h4>
                        <div className="flex gap-2 items-center shrink-0">
                          <StatusBadge status={alert.status} />
                          <SeverityBadge severity={alert.severity_label} />
                        </div>
                      </div>
                      
                      <div className="text-sm font-mono text-slate-400 grid grid-cols-2 gap-x-4 gap-y-2 mt-1 bg-slate-950/50 p-2.5 rounded-md border border-slate-800/50">
                        <div className="truncate flex items-center gap-1.5" title={alert.camera?.name || alert.camera_id}>
                          <span className="text-indigo-400">LOC:</span> {alert.camera?.name || alert.camera_id}
                        </div>
                        <div className="text-right flex items-center justify-end gap-1.5">
                          <span className="text-emerald-400">T-MINUS:</span> {formatTimeAgo(alert.created_at)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400">RISK:</span> <span className="text-slate-200">{alert.severity_score}/100</span>
                        </div>
                        <div className="text-right flex items-center justify-end gap-1.5">
                          <span className="text-cyan-400">CONF:</span> <span className="opacity-80">{(alert.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {alert.status === 'new' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1 h-8 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 font-mono text-xs tracking-wider"
                            onClick={(e) => handleAcknowledge(alert.id, e)}
                          >
                            ACKNOWLEDGE
                          </Button>
                        )}
                        <Link href={`/dashboard/incidents/${alert.id}`} className={alert.status === 'new' ? "flex-1" : "w-full"}>
                          <Button variant="outline" size="sm" className="w-full h-8 border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 font-mono text-xs tracking-wider">
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
