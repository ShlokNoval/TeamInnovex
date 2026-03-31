"use client"

import { MetricCards } from "@/components/dashboard/metric-cards"
import { AlertFeed } from "@/components/dashboard/alert-feed"
import { AnalyticsCharts } from "@/components/dashboard/charts"
import { format } from "date-fns"

export default function DashboardOverview() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Node Command Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time surveillance and incident tracking layer.</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs font-mono text-orange-600 dark:text-orange-400 font-bold mr-4 tracking-wider hidden lg:block">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} | GLOBAL SENSORS: ACTIVE
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
