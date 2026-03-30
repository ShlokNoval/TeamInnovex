"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import the map component with SSR disabled
// This prevents "window is not defined" errors during build
const MapComponent = dynamic(
  () => import("@/components/dashboard/map-component"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col pt-12 items-center justify-center bg-muted/10">
        <Skeleton className="h-[60%] w-[80%] rounded-xl" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">Initializing Geospatial Engine...</p>
      </div>
    )
  }
)

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 md:px-8 md:pt-6 bg-background border-b z-10 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Geospatial Overview</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Live geographic mapping of cameras, events, and hazard hotspots.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full relative z-0">
        <MapComponent />
      </div>
    </div>
  )
}
