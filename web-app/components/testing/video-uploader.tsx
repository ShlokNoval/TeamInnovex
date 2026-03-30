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
    <Card className="border-2 border-dashed border-primary/20 bg-card/50">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Upload Demo Video</CardTitle>
        <CardDescription>Drag and drop a video or image to start real-time inference</CardDescription>
      </CardHeader>
      <CardContent>
        <label 
          className={`flex flex-col items-center justify-center h-64 w-full rounded-lg cursor-pointer transition-colors ${
            isDragging ? "bg-primary/10 border-primary" : "hover:bg-accent/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">MP4, AVI, MOV, JPG, PNG (Max 50MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="video/mp4,video/x-msvideo,video/quicktime,image/jpeg,image/png"
            onChange={handleChange}
          />
        </label>
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
