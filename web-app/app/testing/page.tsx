"use client"

import { useState } from "react"
import { VideoUploader } from "@/components/testing/video-uploader"
import { VideoPlayer } from "@/components/testing/video-player"
import { DetectionSidebar } from "@/components/testing/detection-sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MonitorPlay } from "lucide-react"

export default function TestingDashboard() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />
      
      <header className="border-b bg-card/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 border-white/5">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md border border-primary/20">
              <MonitorPlay className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SOC Terminal <span className="text-primary">v1.2</span></h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Live Simulation Feed</p>
            </div>
          </div>
        </div>
        <div className="text-xs font-mono text-primary flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded shadow-[0_0_10px_oklch(0.65_0.15_250/20%)]">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          WS_CONNECTED
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden z-10">
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {!videoFile ? (
            <div className="flex-1 flex items-center justify-center animate-in zoom-in-95 duration-500">
              <div className="max-w-xl w-full p-1 rounded-xl bg-linear-to-b from-primary/20 to-transparent">
                <div className="glass-card rounded-lg p-8">
                  <VideoUploader onUpload={setVideoFile} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-700">
              <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-widest text-primary font-mono flex items-center gap-2">
                  <span className="w-2 h-6 bg-primary inline-block animate-pulse" />
                  Neural Inference Engine
                </h2>
                <Button variant="outline" size="sm" onClick={() => setVideoFile(null)} className="font-mono text-xs border-primary/20 hover:bg-primary/10 hover:text-primary">
                  [ TERMINATE FEED ]
                </Button>
              </div>
              <div className="flex-1 rounded-lg overflow-hidden relative shadow-[0_0_30px_oklch(0.65_0.15_250/10%)] group">
                {/* Techy Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary z-20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary z-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary z-20 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary z-20 pointer-events-none" />
                
                <VideoPlayer file={videoFile} />
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full lg:w-96 border-l border-white/5 bg-card/60 backdrop-blur flex flex-col">
          <DetectionSidebar />
        </div>
      </main>
    </div>
  )
}
