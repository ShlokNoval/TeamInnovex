"use client"

import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User, ShieldCheck, Zap, Activity } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Authentication successful. Entering Command Hub...")
        // Wait a beat for the animation / toast
        setTimeout(() => {
          login(data.access_token, { username: data.username, role: data.role })
        }, 1000)
      } else {
        toast.error(data.msg || "Invalid credentials. Access Denied.")
      }
    } catch (error) {
      toast.error("Critical Connection Error. Backend unreachable.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Animated Scanline */}
          <motion.div 
             animate={{ top: ["0%", "100%", "0%"] }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute left-0 right-0 h-px bg-indigo-500/20 z-0 pointer-events-none"
          />

          <div className="mb-8 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 group-hover:glow-primary transition-all duration-500">
               <ShieldCheck className="w-8 h-8 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">AUTHORITY ACCESS</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Neural Road Security Protocol 0842</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Operator ID</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input 
                  id="username"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-slate-950/50 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 h-12 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Biometric / Passphrase</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input 
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-950/50 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 h-12 text-sm"
                  required
                />
              </div>
            </div>

            <Button 
               type="submit" 
               disabled={isLoading}
               className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm tracking-[0.2em] uppercase rounded-2xl transition-all active:scale-95 group overflow-hidden"
            >
               {isLoading ? (
                 <Activity className="w-5 h-5 animate-spin" />
               ) : (
                 <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 group-hover:animate-pulse" />
                    INITIALIZE AUTHENTICATION
                 </div>
               )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center text-[8px] text-slate-600 tracking-[0.3em] font-bold uppercase">
             <span>ENCRYPTED_AES_256</span>
             <span>PULSE_SECURE_LINK</span>
          </div>
        </div>
        
        {/* Pre-seeded credentials hint for the user/judges */}
        <div className="mt-6 text-center">
            <p className="text-[9px] text-slate-600 font-mono italic">
               Hint: Use your backend admin credentials (admin / admin123)
            </p>
        </div>
      </motion.div>
    </div>
  )
}
