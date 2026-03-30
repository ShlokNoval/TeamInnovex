"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Camera, RotateCcw, ShieldCheck, Wifi, Zap, Settings, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { wsService } from "@/lib/websocket"

export default function MobileStreamPage() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [streamQuality, setStreamQuality] = useState<'low' | 'med' | 'high'>('med')
  const [fps, setFps] = useState(0)
  const [latency, setLatency] = useState(0)
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(90) // Default to 90 for tripod
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Configure constraints based on quality
  const getConstraints = () => {
    const resolutions = {
      low: { width: 320, height: 240, frameRate: 5 },
      med: { width: 640, height: 480, frameRate: 10 },
      high: { width: 1280, height: 720, frameRate: 15 }
    }
    return {
      video: {
        facingMode: { ideal: "environment" }, // More permissive for iOS
        ...resolutions[streamQuality]
      },
      audio: false
    }
  }

  const startCamera = async () => {
    setCameraError(null)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser.")
      }
      const stream = await navigator.mediaDevices.getUserMedia(getConstraints())
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Wait for it to actually be ready to play
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true)
        }
      }
    } catch (err: any) {
      console.error("Camera access denied:", err)
      setCameraError(err.message || "Camera access denied. Please click to retry.")
      setIsCameraActive(false)
    }
  }

  const toggleStream = () => {
    if (isStreaming) {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
      setIsStreaming(false)
    } else {
      setIsStreaming(true)
      startStreaming()
    }
  }

  const startStreaming = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    let lastTime = performance.now()
    let frameCount = 0

    const intervalMs = streamQuality === 'low' ? 200 : streamQuality === 'med' ? 100 : 66

    streamIntervalRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        // Calculate dimensions based on rotation
        const isLandscape = rotation === 90 || rotation === 270
        canvas.width = isLandscape ? videoRef.current.videoHeight : videoRef.current.videoWidth
        canvas.height = isLandscape ? videoRef.current.videoWidth : videoRef.current.videoHeight

        context.save()
        // Move registration point to the center of the canvas
        context.translate(canvas.width / 2, canvas.height / 2)
        // Rotate 
        context.rotate((rotation * Math.PI) / 180)
        // Draw the image, centered on the new registration point
        context.drawImage(
           videoRef.current, 
           -videoRef.current.videoWidth / 2, 
           -videoRef.current.videoHeight / 2, 
           videoRef.current.videoWidth, 
           videoRef.current.videoHeight
        )
        context.restore()
        
        // Convert to Base64
        const base64 = canvas.toDataURL('image/jpeg', 0.4) // Reduced from 0.6 to 0.4 for speed
        
        // Send via WebSocket
        wsService.sendFrame(base64, Date.now())
        
        // Calculate FPS
        frameCount++
        const now = performance.now()
        if (now - lastTime >= 1000) {
          setFps(frameCount)
          frameCount = 0
          lastTime = now
          // Mock latency for UI display
          setLatency(Math.floor(Math.random() * 20) + 10)
        }
      }
    }, intervalMs)
  }

  useEffect(() => {
    startCamera()
    // Restart streaming loop if quality or rotation changes while active
    if (isStreaming) {
       toggleStream()
       setTimeout(() => toggleStream(), 50)
    }
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
    }
  }, [streamQuality, rotation])

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono flex flex-col items-center justify-between">
      {/* Upper Status Bar */}
      <div className="w-full flex justify-between items-center z-20 bg-black/40 backdrop-blur-lg p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-primary animate-ping' : 'bg-white/20'}`} />
          <span className="text-[10px] font-bold tracking-widest">{isStreaming ? "STREAMING" : "STANDBY"}</span>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[8px] text-white/30">FPS</span>
              <span className="text-xs font-bold font-mono text-primary">{fps}</span>
           </div>
           <div className="flex flex-col items-end text-right">
              <span className="text-[8px] text-white/30">LATENCY</span>
              <span className="text-xs font-bold font-mono text-primary">{latency}ms</span>
           </div>
        </div>
      </div>

      {/* Main Viewfinder */}
      <div className="flex-1 w-full my-4 relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(var(--primary-rgb),0.05)] flex items-center justify-center bg-zinc-950">
        {!isCameraActive && !cameraError && (
          <div className="flex flex-col items-center gap-4 text-white/20 animate-pulse">
            <Camera className="w-20 h-20" />
            <p className="text-xs tracking-[0.3em]">INITIALIZING OPTICS...</p>
          </div>
        )}
        
        {cameraError && (
          <div className="flex flex-col items-center gap-4 text-red-500 z-30 p-6 text-center">
            <ShieldCheck className="w-16 h-16 opacity-50 mb-2" />
            <p className="text-xs font-bold font-sans">{cameraError}</p>
            <Button onClick={startCamera} variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 mt-2 font-black tracking-widest text-xs h-10 px-8">
              RETRY CONNECTION
            </Button>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          muted
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-1000 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* HUD Overlays */}
        <AnimatePresence>
          {isStreaming && (
            <>
              {/* Corner Brackets */}
              <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-primary z-10" />
              <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-primary z-10" />
              <div className="absolute bottom-110 left-6 w-12 h-12 border-b-2 border-l-2 border-primary z-10" />
              <div className="absolute bottom-110 right-6 w-12 h-12 border-b-2 border-r-2 border-primary z-10" />
              
              {/* Scanning Scanline */}
              <motion.div 
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] z-20 pointer-events-none"
              />

              {/* Rec Indicator */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-red-600/20 border border-red-500/40 rounded-full text-[10px] font-black tracking-widest text-red-500 uppercase animate-pulse">
                <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_red]" />
                Neural Node Link
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panel */}
      <div className="w-full bg-zinc-900 rounded-[32px] p-6 space-y-6 border border-white/5 shadow-2xl">
         <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <div className="space-y-1">
               <h2 className="text-lg font-black tracking-tighter">NODE_0842</h2>
               <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">Location: Tripod_Mount_A1</p>
            </div>
            <div className="flex flex-col items-end gap-3">
               <div className="flex gap-2">
                  <span className="text-[8px] text-white/50 tracking-widest mt-1">QUALITY</span>
                  {['low', 'med', 'high'].map((q) => (
                     <button 
                       key={q}
                       onClick={() => setStreamQuality(q as any)}
                       className={`text-[8px] px-3 py-1 rounded-full border transition-all ${streamQuality === q ? 'bg-primary text-black border-primary font-bold' : 'bg-transparent text-white/20 border-white/10'}`}
                     >
                       {q.toUpperCase()}
                     </button>
                  ))}
               </div>
               <div className="flex gap-2">
                  <span className="text-[8px] text-white/50 tracking-widest mt-1">ROTATION</span>
                  {[0, 90, 180, 270].map((deg) => (
                     <button 
                       key={deg}
                       onClick={() => setRotation(deg as any)}
                       className={`text-[8px] px-3 py-1 rounded-full border transition-all ${rotation === deg ? 'bg-primary text-black border-primary font-bold' : 'bg-transparent text-white/20 border-white/10'}`}
                     >
                       {deg}°
                     </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-2">
               <Wifi className="w-4 h-4 text-green-500" />
               <p className="text-[10px] text-white/30 uppercase tracking-widest">Connection</p>
               <span className="text-xs font-bold text-green-500">OPTIMAL</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-2">
               <Lock className="w-4 h-4 text-primary" />
               <p className="text-[10px] text-white/30 uppercase tracking-widest">Encryption</p>
               <span className="text-xs font-bold">AES-256</span>
            </div>
         </div>

         <Button 
            onClick={toggleStream}
            className={`w-full h-20 rounded-[28px] text-xl font-black transition-all active:scale-95 ${isStreaming ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'bg-primary hover:bg-primary/90 text-black shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]'}`}
          >
            {isStreaming ? (
              <div className="flex items-center gap-3">
                 <RotateCcw className="w-6 h-6 animate-spin-slow" />
                 TERMINATE LINK
              </div>
            ) : (
              <div className="flex items-center gap-3">
                 <Zap className="w-6 h-6" />
                 LINK TO SOC
              </div>
            )}
          </Button>
      </div>

      {/* Internal Canvas (Hidden) for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
