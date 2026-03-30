import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CarFront, PawPrint, Activity, AlertCircle, Clock } from "lucide-react"
import { AnalyticsSummary } from "@/lib/types"
import { getAnalyticsSummary } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export function MetricCards() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    getAnalyticsSummary().then(setData).catch(console.error)
  }, [])

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
      <Card className="glass-card group hover:-translate-y-1 transition-all duration-300 border-primary/20 hover:border-primary/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Total Detections</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-[0_0_15px_oklch(0.65_0.15_250/0%)] group-hover:shadow-[0_0_15px_oklch(0.65_0.15_250/50%)]">
            <Activity className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold font-mono tracking-tight">{data.total_detections}</div>
          <p className="text-xs text-primary/70 mt-1 flex items-center gap-1">+20.1% baseline variation</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card group hover:-translate-y-1 transition-all duration-300 border-destructive/20 hover:border-destructive/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-destructive transition-colors">Active Alerts</CardTitle>
          <div className="p-2 rounded-lg bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors shadow-[0_0_15px_oklch(0.65_0.15_250/0%)] group-hover:shadow-[0_0_15px_oklch(0.60_0.20_20/50%)]">
            <AlertCircle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold font-mono tracking-tight text-destructive">
            {data.by_severity.critical + data.by_severity.high}
          </div>
          <p className="text-xs text-destructive/70 mt-1">Unacknowledged</p>
        </CardContent>
      </Card>

      <Card className="glass-card group hover:-translate-y-1 transition-all duration-300 hover:border-orange-500/50 overflow-hidden relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-orange-400 transition-colors">Potholes</CardTitle>
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold font-mono tracking-tight">{data.by_type.pothole}</div>
          <p className="text-xs text-muted-foreground mt-1">+4 from yesterday</p>
        </CardContent>
      </Card>

      <Card className="glass-card group hover:-translate-y-1 transition-all duration-300 hover:border-primary/50 overflow-hidden relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Animals</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
             <PawPrint className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold font-mono tracking-tight">{data.by_type.animal}</div>
          <p className="text-xs text-muted-foreground mt-1">-2% from last week</p>
        </CardContent>
      </Card>

      <Card className="glass-card group hover:-translate-y-1 transition-all duration-300 border-red-500/10 hover:border-red-500/50 overflow-hidden relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-red-400 transition-colors">Accidents</CardTitle>
           <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
             <CarFront className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold font-mono tracking-tight">{data.by_type.accident}</div>
          <p className="text-xs text-muted-foreground mt-1">0 reported today</p>
        </CardContent>
      </Card>

      <Card className="glass-card group hover:-translate-y-1 transition-all duration-300 hover:border-white/20 overflow-hidden relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">Avg Response Time</CardTitle>
          <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-white/20 group-hover:text-white transition-colors">
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold font-mono tracking-tight">14<span className="text-lg text-muted-foreground">m</span></div>
          <p className="text-xs text-muted-foreground mt-1">Since acknowledged</p>
        </CardContent>
      </Card>
    </div>
  )
}
