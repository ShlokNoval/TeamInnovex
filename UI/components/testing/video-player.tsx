import { useEffect, useRef, useState } from "react"
import { wsService } from "@/lib/websocket"
import { AnnotatedFrameResponse } from "@/lib/types"

interface VideoPlayerProps {
  file: File | null
}

export function VideoPlayer({ file }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [fps, setFps] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [annotatedFrame, setAnnotatedFrame] = useState<string | null>(null)
  
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(Date.now())
  const requestRef = useRef<number>(0)
  
  useEffect(() => {
    let objectUrl: string | null = null
    
    if (file) {
      objectUrl = URL.createObjectURL(file)
      if (videoRef.current) {
        videoRef.current.src = objectUrl
        videoRef.current.play().catch(e => console.error("Autoplay failed", e))
      }
    }
    
    // Connect WebSocket
    wsService.connect()
    const handleFrame = (response: AnnotatedFrameResponse) => {
      // Diagnostic logging to confirm frame arrival in SOC Terminal
      if (frameCountRef.current === 0) {
        console.log("[VideoPlayer] First frame received from backend.");
      }

      setAnnotatedFrame(response.annotatedFrame)
      
      // Calculate FPS
      frameCountRef.current++
      const now = Date.now()
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current)
        frameCountRef.current = 0
        lastTimeRef.current = now
      }
    }

    wsService.subscribeToFrames(handleFrame)

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      wsService.unsubscribeFromFrames(handleFrame)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [file])

  // Process frames loop (extracts frame and sends to WS)
  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    
    if (ctx) {
      // Match canvas size to video size
      if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      // Draw current video frame to hidden canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Only process every ~5th frame for performance (approx 6 FPS)
      if (frameCountRef.current % 5 === 0) {
        // Convert to Base64 - Optimized for throughput over the tunnel
        const base64 = canvas.toDataURL('image/jpeg', 0.4) // Reduced from 0.6 to 0.4 for speed
        
        // Send via WebSocket
        wsService.sendFrame(base64, video.currentTime)
      }
    }

    setCurrentTime(video.currentTime)
    requestRef.current = requestAnimationFrame(processFrame)
  }

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(processFrame)
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isPlaying])

  return (
    <div className="relative w-full h-full flex flex-col group min-h-[400px]">
      {/* Hidden original video feed */}
      <video
        ref={videoRef}
        className="hidden"
        controls
        muted
        loop
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Hidden canvas for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Display - shows annotated frame if available, otherwise just black placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        {annotatedFrame ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={annotatedFrame} 
            alt="AI Annotated Frame" 
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <div className="text-muted-foreground animate-pulse font-mono text-xs tracking-widest">
            [ SENSOR_INIT_SEQUENCE_BYPASS_ACTIVE ]
          </div>
        )}
      </div>

      {/* Overlay controls and info */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded text-sm font-mono flex gap-4">
        <div><span className="text-white/60">FPS:</span> {fps}</div>
        <div><span className="text-white/60">TIME:</span> {currentTime.toFixed(1)}s</div>
      </div>
    </div>
  )
}
