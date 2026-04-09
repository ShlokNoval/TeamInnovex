import { useCallback, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud, FileVideo, AlertCircle } from "lucide-react"

interface VideoUploaderProps {
  onUpload: (file: File) => void
}

export function VideoUploader({ onUpload }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true)
    } else if (e.type === "dragleave") {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError(null)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setError(null)
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    const validTypes = ["video/mp4", "video/avi", "video/quicktime", "image/jpeg", "image/png"]
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid MP4, AVI, MOV, JPG, or PNG file.")
      return
    }
    onUpload(file)
  }

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-zinc-950/40 backdrop-blur-md transition-all hover:bg-zinc-950/60 group">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-black italic tracking-tighter uppercase text-white/90">
          Manual <span className="text-primary">Feed</span> Intake
        </CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-widest text-white/30 font-mono">
          Upload local telemetry for simulation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <label 
          className={`flex flex-col items-center justify-center h-56 w-full rounded-xl cursor-pointer transition-all border-2 border-transparent ${
            isDragging ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" : "hover:bg-primary/5 active:scale-[0.98]"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
               <UploadCloud className={`w-8 h-8 ${isDragging ? "text-primary animate-bounce" : "text-primary/60"}`} />
            </div>
            <p className="mb-1 text-xs font-bold text-white/60 tracking-wider">
               <span className="text-primary">ACTIVATE</span> PORT
            </p>
            <p className="text-[8px] text-white/20 font-mono uppercase tracking-[0.2em]">MP4 / AVI / MOV / JPG / PNG</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="video/mp4,video/x-msvideo,video/quicktime,image/jpeg,image/png"
            onChange={handleChange}
          />
        </label>
        
        {error && (
          <div className="mt-4 p-3 bg-red-950/30 border border-red-500/20 rounded-xl flex items-center gap-2 text-[10px] text-red-400 font-mono uppercase tracking-widest">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
