"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Mail, Shield, Zap, Server, Save } from "lucide-react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Settings saved successfully")
    }, 800)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure integrations, email alerts, and backend connections.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Authority Email Alerts
            </CardTitle>
            <CardDescription>SMTP configuration for automated critical hazard reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="email-alerts" defaultChecked />
              <Label htmlFor="email-alerts">Enable automated email dispatch</Label>
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <div className="grid gap-2">
                <Label htmlFor="smtp-server">SMTP Server</Label>
                <Input id="smtp-server" placeholder="smtp.gmail.com" defaultValue="smtp.gmail.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="smtp-port">Port</Label>
                  <Input id="smtp-port" placeholder="587" defaultValue="587" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="smtp-security">Security</Label>
                  <Input id="smtp-security" placeholder="TLS" defaultValue="TLS" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-user">Username / Email</Label>
                <Input id="smtp-user" placeholder="admin@divyadrishti.gov" defaultValue="alerts@divyadrishti.org" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-pass">App Password</Label>
                <Input id="smtp-pass" type="password" placeholder="••••••••••••" defaultValue="secret_pass_123" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="receiver">Target Authority Email</Label>
                <Input id="receiver" placeholder="police@city.gov" defaultValue="city.traffic@aurangabad.gov.in" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-between">
            <Button variant="outline">Test Connection</Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Config
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {/* Engine Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" /> AI Detection Engine
              </CardTitle>
              <CardDescription>Configure YOLOv8 thresholds and processing limits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="conf-thresh">Minimum Confidence Threshold (%)</Label>
                <Input id="conf-thresh" type="number" placeholder="50" defaultValue="65" />
                <p className="text-[10px] text-muted-foreground">Alerts below this will be dropped.</p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="frame-skip">Frame Skip Interval</Label>
                <Input id="frame-skip" type="number" placeholder="5" defaultValue="5" />
                <p className="text-[10px] text-muted-foreground">Process every Nth frame to reduce load (current ~6 FPS).</p>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 justify-end">
               <Button onClick={handleSave} disabled={loading}>Update Engine</Button>
            </CardFooter>
          </Card>

          {/* Integration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-500" /> Backend Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid gap-2">
                <Label htmlFor="api-url">FastAPI Endpoint</Label>
                <Input id="api-url" placeholder="http://localhost:8000" defaultValue="http://localhost:8000" disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ws-url">WebSocket URL</Label>
                <Input id="ws-url" placeholder="ws://localhost:8000/ws" defaultValue="ws://localhost:8000/ws" disabled />
              </div>
              <p className="text-xs text-amber-500/80 mt-2">
                Database URLs must be modified in the .env file.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
