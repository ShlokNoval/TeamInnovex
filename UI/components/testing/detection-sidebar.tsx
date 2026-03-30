import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { HazardIcon } from "@/components/shared/hazard-icon"
import { wsService } from "@/lib/websocket"
import { Detection } from "@/lib/types"
import { getSeverityColor } from "@/lib/utils"
// Internal singleton cooldown block outside component to track globals
const cooldownTracker: Record<string, number> = {}

export function DetectionSidebar() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [counts, setCounts] = useState({ pothole: 0, animal: 0, accident: 0 })

  useEffect(() => {
    const handleFrame = (response: any) => {
      if (response.detections && response.detections.length > 0) {
        
        // Filter out identical redundant events pushed natively by consecutive frames
        const now = Date.now();
        const validDetections = response.detections.filter((d: any) => {
           const key = d.class;
           if (!cooldownTracker[key] || now - cooldownTracker[key] > 5000) {
               cooldownTracker[key] = now;
               return true;
           }
           return false;
        });

        if (validDetections.length === 0) return;

        setDetections(prev => {
          const updated = [...validDetections, ...prev].slice(0, 50) // Keep last 50
          return updated
        })

        // Update counts
        setCounts(prev => {
          const newCounts = { ...prev }
          validDetections.forEach((d: any) => {
            if (newCounts[d.class as keyof typeof newCounts] !== undefined) {
              newCounts[d.class as keyof typeof newCounts]++
            }
          })
          return newCounts
        })
      }
    };

    wsService.subscribeToFrames(handleFrame)

    return () => {
      wsService.unsubscribeFromFrames(handleFrame)
    }
  }, [])

  return (
    <div className="h-full flex flex-col pt-1">
      <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-transparent">
        <h3 className="font-mono text-sm tracking-widest text-primary flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
          DETECTION STREAM
        </h3>
        <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/30">
          {detections.length} RECORDED
        </Badge>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5 bg-black/40 text-center py-3 text-xs backdrop-blur-sm">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-muted-foreground uppercase text-[9px] tracking-widest">Potholes</span>
          <span className="font-mono text-lg font-bold text-amber-500">{counts.pothole}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-muted-foreground uppercase text-[9px] tracking-widest">Animals</span>
          <span className="font-mono text-lg font-bold text-orange-400">{counts.animal}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-muted-foreground uppercase text-[9px] tracking-widest">Accidents</span>
          <span className="font-mono text-lg font-bold text-red-500">{counts.accident}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-2">
        <div className="flex flex-col gap-3 pb-4 pt-3">
          {detections.map((detection, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-3 p-3 rounded bg-black/40 border border-white/5 hover:border-primary/30 transition-colors animate-in fade-in slide-in-from-left-4 duration-500 relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30 group-hover:bg-primary transition-colors" />
              
              <div className="p-2 rounded bg-primary/10 border border-primary/20 shrink-0 text-primary">
                <HazardIcon type={detection.class as any} className="w-4 h-4" />
              </div>
              
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-medium text-xs text-white uppercase tracking-wider truncate">
                    {detection.class}_DETECTED
                  </span>
                  {detection.severity && (
                    <Badge variant="outline" className={`font-mono text-[9px] px-1.5 py-0 uppercase tracking-widest ${getSeverityColor(detection.severity)}`}>
                      {detection.severity}
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground items-center">
                  <span className="text-primary/70">CF: {(detection.confidence * 100).toFixed(1)}%</span>
                  <span className="opacity-50">
                    BBOX:[{detection.bbox.map(n => n.toFixed(0)).join(',')}]
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {detections.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-sm font-mono text-primary/40 animate-pulse">
              <span className="text-2xl mb-2">[-_-]</span>
              AWAITING SENSOR INITIATION...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
