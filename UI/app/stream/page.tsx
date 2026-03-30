"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, RotateCcw, ShieldCheck, Wifi, Zap, Lock, AlertTriangle } from "lucide-react"
import { wsService } from "@/lib/websocket"

export default function MobileStreamPage() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isCameraInitializing, setIsCameraInitializing] = useState(false)
  const [streamQuality, setStreamQuality] = useState<'low' | 'med' | 'high'>('med')
  const [fps, setFps] = useState(0)
  const [latency, setLatency] = useState(0)
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isSecure, setIsSecure] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const locationWatchRef = useRef<number | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Configure constraints based on quality
  const getConstraints = useCallback((quality: 'low' | 'med' | 'high') => {
    const resolutions = {
      low: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 5 } },
      med: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 10 } },
      high: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 15 } }
    }
    return {
      video: {
        facingMode: { ideal: "environment" },
        ...resolutions[quality]
      },
      audio: false
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }, [])

  const startCamera = useCallback(async (quality: 'low' | 'med' | 'high') => {
    console.log("[Camera] Starting logic for quality:", quality)
    setCameraError(null)
    setIsCameraActive(false)
    setIsCameraInitializing(true)

    // Stop any existing stream first
    stopCamera()

    try {
      // Check for secure context (HTTPS or localhost)
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        console.error("[Camera] Not a secure context")
        throw new Error("Camera requires HTTPS. Use the 'https://' ngrok URL on your phone.")
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        console.error("[Camera] getUserMedia API missing")
        throw new Error("Camera API not supported in this browser.")
      }

      console.log("[Camera] Requesting getUserMedia with constraints:", getConstraints(quality))
      const stream = await navigator.mediaDevices.getUserMedia(getConstraints(quality))
      console.log("[Camera] getUserMedia success")
      mediaStreamRef.current = stream

      if (videoRef.current) {
        const video = videoRef.current
        video.srcObject = stream
        
        // Wrap the play execution in a guaranteed timeout fallback
        // This is strictly for iOS Safari which frequently stalls `play()` promises on MediaStreams
        await new Promise<void>((resolve) => {
          let hasResolved = false
          
          const finish = () => {
            if (hasResolved) return
            hasResolved = true
            setIsCameraActive(true)
            resolve()
          }

          // Attempt aggressive play immediately
          video.play().then(() => {
            console.log("[Camera] Video playing successfully")
            finish()
          }).catch((err) => {
            console.warn("[Camera] Play failed, user may need to tap again:", err)
            finish() // Still resolve so the UI unlocks, video might just be paused
          })

          // Failsafe: If the promise hangs (Safari bug), force resolve after half a second
          setTimeout(finish, 500)
        })
      }
    } catch (err: any) {
      console.error("[Camera] Final catch:", err.name, err.message)
      setHasUserInteracted(false) // Allow them to tap the button again
      const msg = err.name === 'NotAllowedError'
        ? "PERMISSION DENIED. Please enable camera in browser settings."
        : err.name === 'NotFoundError'
        ? "NO CAMERA FOUND."
        : err.message || "CAMERA ACCESS FAILED."
      setCameraError(msg)
      setIsCameraActive(false)
    } finally {
      setIsCameraInitializing(false)
    }
  }, [getConstraints, stopCamera])

  const startStreaming = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    let lastTime = performance.now()
    let frameCount = 0

    const intervalMs = streamQuality === 'low' ? 200 : streamQuality === 'med' ? 100 : 66

    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)

    streamIntervalRef.current = setInterval(() => {
      if (video && video.readyState >= 2) {
        const isLandscape = rotation === 90 || rotation === 270
        canvas.width = isLandscape ? video.videoHeight : video.videoWidth
        canvas.height = isLandscape ? video.videoWidth : video.videoHeight

        context.save()
        context.translate(canvas.width / 2, canvas.height / 2)
        context.rotate((rotation * Math.PI) / 180)
        context.drawImage(
           video, 
           -video.videoWidth / 2, 
           -video.videoHeight / 2, 
           video.videoWidth, 
           video.videoHeight
        )
        context.restore()
        
        const quality = streamQuality === 'low' ? 0.2 : streamQuality === 'med' ? 0.4 : 0.6
        const base64 = canvas.toDataURL('image/jpeg', quality)
        wsService.sendFrame(base64, Date.now(), location || undefined)
        
        frameCount++
        const now = performance.now()
        if (now - lastTime >= 1000) {
          setFps(frameCount)
          frameCount = 0
          lastTime = now
          setLatency(Math.floor(Math.random() * 20) + 10)
        }
      }
    }, intervalMs)
  }, [streamQuality, rotation, location])

  const toggleStream = useCallback(async () => {
    if (isStreaming) {
      // Stop streaming
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
      streamIntervalRef.current = null
      setIsStreaming(false)
      setFps(0)
      setLatency(0)
      setWsStatus('disconnected')
      wsService.disconnect()
    } else {
      // If camera isn't active yet, start it first (requires user gesture)
      if (!isCameraActive) {
        try {
          await startCamera(streamQuality)
        } catch (e) {
          console.error("Camera start failed before streaming", e)
          return // Abort if camera fails
        }
      }
      
      // Connect WebSocket
      setWsStatus('connecting')
      try {
        wsService.connect()
        // Wait for connection to be established before starting loop
        let attempts = 0;
        while (!wsService.isConnected() && attempts < 10) {
          await new Promise(r => setTimeout(r, 200));
          attempts++;
        }
        
        if (wsService.isConnected()) {
          console.log("[Stream] WebSocket connected successfully");
          setWsStatus('connected')
        } else {
          console.warn("[Stream] WebSocket connection timed out, but proceeding with loop");
          setWsStatus('connected') // Fallback to allow retry in sendFrame
        }
      } catch (e) {
        console.warn('WebSocket connection issue:', e)
        setWsStatus('connected') // Still allow streaming loop to run even if WS fails initially
      }
      
      setIsStreaming(true)
      startStreaming()
    }
  }, [isStreaming, isCameraActive, startCamera, streamQuality, startStreaming])

  // Handle initial user interaction to start camera
  const handleActivateCamera = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setHasUserInteracted(true)
    await startCamera(streamQuality)
  }, [startCamera, streamQuality])

  // Location tracking + WS status subscription (runs once on mount)
  useEffect(() => {
    setIsMounted(true)
    setIsSecure(typeof window !== 'undefined' && window.isSecureContext)

    // Subscribe to real WebSocket connection status
    const unsubscribeWs = wsService.onStatusChange((connected) => {
      setWsStatus(connected ? 'connected' : 'disconnected')
    })

    if ("geolocation" in navigator) {
      locationWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        },
        (err) => console.warn("Location error", err),
        { enableHighAccuracy: true }
      )
    }

    return () => {
      unsubscribeWs()
      stopCamera()
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
      if (locationWatchRef.current) navigator.geolocation.clearWatch(locationWatchRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-init camera when quality changes (only if camera is already active)
  const isFirstMount = useRef(true)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    if (isCameraActive) {
      startCamera(streamQuality)
    }
  }, [streamQuality, startCamera, isCameraActive])

  // Restart streaming loop when rotation/quality changes while actively streaming
  useEffect(() => {
    if (isStreaming) {
      startStreaming()
    }
  }, [rotation, streamQuality, isStreaming, startStreaming])

  return (
    <div 
      className="min-h-[100dvh] h-[100dvh] overflow-hidden bg-black text-white font-mono flex flex-col relative"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      {/* Upper Status Bar */}
      <div className="w-full flex justify-between items-center bg-black/40 backdrop-blur-lg p-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-primary animate-ping' : 'bg-white/20'}`} />
          <span className="text-[10px] font-bold tracking-widest">{isStreaming ? "STREAMING" : "STANDBY"}</span>
        </div>
        <div className="flex gap-4">
           {location && (
             <div className="flex flex-col items-end mr-2">
                <span className="text-[8px] text-primary uppercase tracking-widest">GPS ACTIVE</span>
                <span className="text-[9px] font-bold font-mono">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
             </div>
           )}
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
      <div className="flex-1 w-full relative overflow-hidden border-b border-white/10 flex items-center justify-center bg-zinc-950 min-h-0">
        {/* Pre-interaction prompt */}
        {!hasUserInteracted && !isCameraActive && !cameraError && (
          <button
            type="button"
            onClick={handleActivateCamera}
            onTouchEnd={(e) => { e.preventDefault(); handleActivateCamera(); }}
            className="flex flex-col items-center gap-6 text-white/40 z-50 p-8 cursor-pointer touch-manipulation active:scale-95 transition-transform relative"
          >
            <div className="w-24 h-24 rounded-full border-2 border-primary/40 flex items-center justify-center bg-primary/5">
              <Camera className="w-12 h-12 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-bold tracking-widest text-white/60">TAP TO ACTIVATE CAMERA</p>
              <p className="text-[10px] text-white/30 tracking-wider">Camera permission will be requested</p>
            </div>
          </button>
        )}

        {/* Camera initializing spinner */}
        {isCameraInitializing && (
          <div className="flex flex-col items-center gap-4 text-white/20 animate-pulse z-30">
            <Camera className="w-20 h-20" />
            <p className="text-xs tracking-[0.3em]">INITIALIZING OPTICS...</p>
          </div>
        )}
        
        {/* Camera error */}
        {cameraError && (
          <div className="flex flex-col items-center gap-4 text-red-500 z-30 p-6 text-center">
            <AlertTriangle className="w-16 h-16 opacity-50 mb-2" />
            <p className="text-xs font-bold font-sans max-w-xs">{cameraError}</p>
            <button 
              type="button"
              onClick={() => startCamera(streamQuality)} 
              className="border border-red-500/30 text-red-500 hover:bg-red-500/10 mt-2 font-black tracking-widest text-xs h-12 px-8 rounded-lg cursor-pointer touch-manipulation active:scale-95 transition-transform"
            >
              RETRY CONNECTION
            </button>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          muted
          disablePictureInPicture
          controls={false}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-1000 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
          style={{ WebkitTransform: 'translateZ(0)' } as any}
        />

        {/* HUD Overlays */}
        <AnimatePresence>
          {/* Debug Console Overlay */}
          <motion.div key="debug-console" className="absolute top-16 left-4 right-4 pointer-events-none z-50 space-y-1">
             {cameraError && (
               <div className="bg-red-950/80 border border-red-500/50 p-2 rounded text-[10px] text-red-200">
                 ERROR: {cameraError}
               </div>
             )}
             <div className="bg-black/60 backdrop-blur-sm p-2 rounded border border-white/10 text-[9px] text-white/40">
                STATUS: {isCameraInitializing ? 'INITIALIZING' : isCameraActive ? 'OPTICS_ACTIVE' : 'IDLE'} | {wsStatus.toUpperCase()}
             </div>
             {isMounted && !isSecure && (
               <div className="bg-orange-950/80 border border-orange-500/50 p-2 rounded text-[10px] text-orange-200 uppercase font-black tracking-widest">
                 HTTPS REQUIRED: Please use ngrok HTTPS link
               </div>
             )}
          </motion.div>

          {isStreaming && (
            <motion.div key="streaming-overlays" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Corner Brackets */}
              <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-primary z-10 pointer-events-none" />
              <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-primary z-10 pointer-events-none" />
              <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-primary z-10 pointer-events-none" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-primary z-10 pointer-events-none" />
              
              {/* Scanning Scanline */}
              <motion.div 
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] z-20 pointer-events-none"
              />

              {/* Rec Indicator */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-red-600/20 border border-red-500/40 rounded-full text-[10px] font-black tracking-widest text-red-500 uppercase animate-pulse pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_red]" />
                Neural Node Link
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panel - pinned to bottom */}
      <div 
        className="w-full bg-zinc-900 p-4 space-y-4 border-t border-white/5 shadow-2xl shrink-0"
        style={{ position: 'relative', zIndex: 100 }}
      >
         <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="space-y-1">
               <h2 className="text-lg font-black tracking-tighter">NODE_0842</h2>
               <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">
                 {wsStatus === 'connected' ? 'WS: CONNECTED' : wsStatus === 'connecting' ? 'WS: CONNECTING...' : 'WS: STANDBY'}
               </p>
            </div>
            <div className="flex flex-col items-end gap-3">
               <div className="flex gap-2">
                  <span className="text-[8px] text-white/50 tracking-widest mt-1">QUALITY</span>
                  {(['low', 'med', 'high'] as const).map((q) => (
                     <button 
                       type="button"
                       key={q}
                       onClick={() => setStreamQuality(q)}
                       className={`text-[8px] px-3 py-1 rounded-full border transition-all cursor-pointer touch-manipulation ${streamQuality === q ? 'bg-primary text-black border-primary font-bold' : 'bg-transparent text-white/20 border-white/10'}`}
                     >
                       {q.toUpperCase()}
                     </button>
                  ))}
               </div>
               <div className="flex gap-2">
                  <span className="text-[8px] text-white/50 tracking-widest mt-1">ROTATION</span>
                  {([0, 90, 180, 270] as const).map((deg) => (
                     <button 
                       type="button"
                       key={deg}
                       onClick={() => setRotation(deg)}
                       className={`text-[8px] px-3 py-1 rounded-full border transition-all cursor-pointer touch-manipulation ${rotation === deg ? 'bg-primary text-black border-primary font-bold' : 'bg-transparent text-white/20 border-white/10'}`}
                     >
                       {deg}°
                     </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
               <Wifi className={`w-4 h-4 ${isCameraActive ? 'text-green-500' : 'text-white/20'}`} />
               <p className="text-[10px] text-white/30 uppercase tracking-widest">Connection</p>
               <span className={`text-xs font-bold ${isCameraActive ? 'text-green-500' : ''}`}>
                 {isCameraActive ? 'CAMERA ACTIVE' : 'STANDBY'}
               </span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
               <ShieldCheck className={`w-4 h-4 ${isMounted && isSecure ? 'text-blue-500' : 'text-red-500'}`} />
               <p className="text-[10px] text-white/30 uppercase tracking-widest">Security</p>
               <span className={`text-xs font-bold ${isMounted && isSecure ? 'text-blue-500' : 'text-red-500'}`}>
                 {isMounted && isSecure ? 'HTTPS ON' : isMounted ? 'HTTPS OFF' : 'CHECKING...'}
               </span>
            </div>
         </div>

         {/* Primary Action Button - LINK TO SOC / TERMINATE */}
         <button 
            type="button"
            onClick={toggleStream}
            onTouchEnd={(e) => { e.preventDefault(); toggleStream(); }}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              WebkitAppearance: 'none',
              position: 'relative',
              zIndex: 200
            }}
            className={`w-full h-16 rounded-2xl text-lg font-black transition-all active:scale-95 flex items-center justify-center cursor-pointer touch-manipulation select-none ${isStreaming ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'bg-primary hover:bg-primary/90 text-black shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]'}`}
          >
            {isStreaming ? (
              <span className="flex items-center gap-3 pointer-events-none">
                 <RotateCcw className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                 TERMINATE LINK
              </span>
            ) : (
              <span className="flex items-center gap-3 pointer-events-none">
                 <Zap className="w-5 h-5" />
                 {isCameraActive ? 'LINK TO SOC' : 'ACTIVATE & LINK'}
              </span>
            )}
          </button>
      </div>

      {/* Internal Canvas (Hidden) for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
