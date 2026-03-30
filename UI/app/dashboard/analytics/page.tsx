"use client"

import { AnalyticsCharts } from "@/components/dashboard/charts"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 pb-20">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Analytics</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Deep dive into road hazard trends, severity distributions, and system performance.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button>Download PDF Report</Button>
        </div>
      </div>
      
      <div className="min-h-[600px] h-auto flex flex-col gap-6">
        <AnalyticsCharts />
        
        {/* Placeholder for future detailed analytics like average resolution time by hazard type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-6 bg-card border rounded-lg text-center">
            <div className="text-muted-foreground text-sm uppercase font-semibold mb-2">Camera Uptime</div>
            <div className="text-4xl font-mono text-primary">98.4%</div>
            <div className="text-xs text-muted-foreground mt-2">Across 5 active nodes</div>
          </div>
          <div className="p-6 bg-card border rounded-lg text-center">
            <div className="text-muted-foreground text-sm uppercase font-semibold mb-2">False Positives</div>
            <div className="text-4xl font-mono text-green-500">{"<"}2.1%</div>
            <div className="text-xs text-muted-foreground mt-2">Based on manual review</div>
          </div>
          <div className="p-6 bg-card border rounded-lg text-center">
            <div className="text-muted-foreground text-sm uppercase font-semibold mb-2">Avg AI Latency</div>
            <div className="text-4xl font-mono text-orange-400">112ms</div>
            <div className="text-xs text-muted-foreground mt-2">End-to-end inference</div>
          </div>
        </div>
      </div>
    </div>
  )
}
