"use client"

import { MetricCards } from "@/components/dashboard/metric-cards"
import { AlertFeed } from "@/components/dashboard/alert-feed"
import { AnalyticsCharts } from "@/components/dashboard/charts"
import { format } from "date-fns"

export default function DashboardOverview() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground mr-4">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
      </div>
      
      <MetricCards />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-[600px]">
        <div className="lg:col-span-4 h-[600px] flex flex-col gap-4">
          <AnalyticsCharts />
        </div>
        <div className="lg:col-span-3 h-[600px]">
          <AlertFeed />
        </div>
      </div>
    </div>
  )
}
