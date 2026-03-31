"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Activity, ShieldAlert, Cpu, Network, Lock, Zap, Search, ShieldCheck, CheckCircle2, ChevronRight, Play, MonitorPlay, FileVideo, Video, Wifi, Shield } from "lucide-react"
import { ModeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const FAKE_LOGS = [
  "[SYS] Neural mesh initialized.",
  "[INFERENCE] Awaiting RTSP stream...",
  "[CAM_01] Connected. 30 FPS.",
  "[ALERT] Type: Pothole || Conf: 98.2%",
  "[TRACKING] Obj_842 -> Coordinates logged.",
  "[CAM_02] Analyzing traffic flow...",
  "[ALERT] Type: Animal || Conf: 85.1%",
  "[SYS] Authority webhook dispatched.",
  "[INFERENCE] Nominal operations.",
]

export default function LandingPage() {
  const [logIndex, setLogIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex(prev => (prev + 1) % FAKE_LOGS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col font-sans selection:bg-orange-100 text-slate-900">
        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md border-b border-slate-200 bg-white/80">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 py-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-600/5 flex items-center justify-center border border-orange-600/10 p-1 backdrop-blur-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="CSN Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-black text-xs tracking-[0.2em] text-orange-600">CSN MUNICIPAL CORP</span>
                <span className="font-mono font-black text-sm tracking-tighter text-slate-900 leading-none">DIVYADRISHTI X SMART CITY</span>
              </div>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="h-10 border-slate-200 bg-white hover:bg-slate-50 text-orange-700 font-bold text-xs tracking-widest gap-2 rounded-full px-5 transition-all active:scale-95 shadow-sm">
                <Lock className="w-3.5 h-3.5" />
                OPERATOR LOGS
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center pt-40 pb-20 z-10 container px-4 mx-auto max-w-6xl">
          
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center space-y-10 mb-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-72 h-36 mb-4 flex items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="CSN Municipal Corporation Logo" 
                className="w-full h-full object-contain relative z-10" 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center rounded-full border border-orange-100 bg-orange-50/50 px-4 py-1.5 text-xs font-bold text-orange-600 tracking-widest uppercase shadow-sm backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Neural Inference Engine Active v1.2
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: -12,
              }}
              transition={{ 
                opacity: { duration: 1, delay: 0.2 },
                y: { 
                  duration: 2.5, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut" 
                } 
              }}
              className="text-center space-y-6 will-change-transform"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] max-w-4xl mx-auto text-slate-900">
                Understand every <br />
                <span className="text-orange-600">घटना instantly.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                Real-time YOLOv8 monitoring of CCTV streams. Automatically detect road घटना, track hazards, and orchestrate immediate emergency protocols.
              </p>
            </motion.div>

            {/* Technical Info Row (Inspired by reference) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-8 md:gap-16 pt-4"
            >
              {[
                { label: "INFERENCE TIME", value: "< 50ms" },
                { label: "PRECISION RATE", value: "98.4%" },
                { label: "INTELLIGENCE MODULES", value: "8" },
                { label: "ACTIVE NODES", value: "750+" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 group border-r border-slate-100 last:border-0 px-8">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase group-hover:text-orange-600 transition-colors">{stat.label}</span>
                  <span className="text-2xl font-black font-mono tracking-tighter text-slate-900">{stat.value}</span>
                </div>
              ))}
            </motion.div>

            {/* Dual Action CTA (Replaces confusing input box) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full max-w-3xl flex flex-col md:flex-row items-stretch justify-center gap-4 mt-8"
            >
              {/* Action 1: Local Analysis */}
              <Link href="/testing?mode=file" className="group relative flex-1">
                <div className="absolute -inset-px bg-linear-to-r from-white/20 to-white/0 rounded-2xl blur-[2px] opacity-20 group-hover:opacity-100 transition-opacity" />
                <div className="h-full relative flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 backdrop-blur-xl hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group-hover:shadow-lg group-hover:shadow-orange-500/10">
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-orange-500/5 to-transparent skew-x-[-20deg]" />
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                    <MonitorPlay className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex flex-col items-start flex-1 text-left">
                    <span className="text-slate-900 font-bold tracking-tight text-lg">Local Simulation</span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Upload mp4 dataset</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              {/* Action 2: Live Node (Primary) */}
              <Link href="/testing?mode=live" className="group relative flex-1">
                <div className="h-full relative flex items-center gap-4 p-4 rounded-2xl bg-orange-600 border border-orange-700 hover:bg-orange-700 transition-colors cursor-pointer overflow-hidden shadow-lg shadow-orange-500/20">
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white/10 to-transparent skew-x-[-20deg]" />
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 border border-white/40">
                    <Wifi className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="flex flex-col items-start flex-1 text-left">
                    <span className="text-white font-black tracking-tight text-lg">Live Node Uplink</span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/70">Connect remote IP / Phone</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Intelligence Modules Section (Redesigned 'Neural Mesh Capabilities') */}
          <div className="w-full space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-[0.3em] text-orange-600 uppercase flex items-center gap-2">
                  <div className="w-8 h-px bg-orange-600/40" />
                  Intelligence Modules
                </span>
                <h2 className="text-5xl font-black tracking-tight max-w-xl text-slate-900">Neural Mesh <span className="text-slate-300">Infrastructure.</span></h2>
              </div>
              <div className="items-center gap-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden md:flex">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse transition-shadow shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  SYSTEM_NOMINAL
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <span>ENCRYPTED_FEED</span>
                  <Lock className="w-3 h-3" />
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              <div className="md:col-span-8 group relative h-[500px]">
                <div className="absolute inset-0 bg-slate-50 rounded-3xl transition-colors border border-slate-100 shadow-sm" />
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-[0.03]">
                  {/* Subtle Tech Grid Background */}
                  <div className="absolute inset-0 bg-size-[20px_20px] bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)]" />
                </div>

                <div className="relative h-full flex flex-col p-10 justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-lg border border-slate-100 group-hover:scale-105 transition-transform">
                      <Zap className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-orange-600 font-bold tracking-[0.2em] mb-1">MODULE_ALPHA_01</div>
                      <Badge variant="outline" className="bg-orange-50 border-orange-100 text-orange-600 uppercase font-mono text-[9px]">LIDAR-KINEMATIC</Badge>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter max-w-md text-slate-900">Accident Kinetic Recognition</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6 border-y border-slate-100 bg-white/50 backdrop-blur-sm -mx-10 px-10">
                      {[
                        { l: "LATENCY", v: "14ms" },
                        { l: "OBJECTS", v: "150+" },
                        { l: "V_MAX", v: "240km/h" },
                        { l: "CONFIDENCE", v: "99.2%" }
                      ].map((s, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{s.l}</span>
                          <span className="text-sm font-black font-mono text-orange-600">{s.v}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-slate-500 text-lg max-w-xl leading-relaxed font-medium">
                      Employs multi-frame neural motion analysis to detect high-velocity collisions and sudden traffic disruptions with real-time priority alerts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Side Card: Pothole Detection */}
              <div className="md:col-span-4 group relative h-[500px]">
                 <div className="absolute inset-0 bg-white rounded-3xl border border-slate-200 hover:border-orange-200 transition-all flex flex-col">
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 border border-orange-100">
                            <Search className="w-6 h-6" />
                          </div>
                          <span className="text-[9px] font-mono text-slate-300 tracking-widest uppercase">MODULE_BETA_08</span>
                        </div>
                        <h3 className="text-3xl font-black mb-4 tracking-tighter text-slate-900">Dynamic Pothole Monitoring</h3>
                        <p className="text-slate-500 leading-relaxed text-sm">
                          Identifies road damage instantly, logging precise GPS coordinates for city authorities through automated sensor arrays.
                        </p>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-slate-100">
                          <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                            <span className="text-slate-400">Active Nodes</span>
                            <span className="text-primary font-bold">750+</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: "65%" }}
                              className="h-full bg-primary"
                            />
                          </div>
                      </div>
                    </div>
                    
                    {/* Subtle Background Icon */}
                    <div className="absolute bottom-4 right-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
                      <Shield className="w-32 h-32" />
                    </div>
                 </div>
              </div>

              {/* Multi-Component Bottom Card: Intelligence Feed */}
              <div className="md:col-span-12 group relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Animal Tracking Minor Card */}
                  <div className="glass-card rounded-3xl p-8 border border-slate-100 hover:border-orange-100 transition-all relative overflow-hidden group/card bg-white shadow-sm hover:shadow-md">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl pointer-events-none group-hover/card:bg-orange-100/50 transition-colors" />
                     <div className="relative z-10 w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6 text-orange-600 border border-orange-100">
                        <Activity className="w-6 h-6" />
                     </div>
                     <h3 className="relative z-10 text-xl font-bold mb-3 text-slate-900">Trajectory Tracking</h3>
                     <p className="relative z-10 text-slate-500 text-sm leading-relaxed font-medium">
                        Predicts accident risks by analyzing wildlife and stray animal pathways in high-speed zones.
                     </p>
                  </div>

                  {/* Integration Log View (Shifted to a better secondary box) */}
                  <div className="md:col-span-2 rounded-3xl border border-slate-200 overflow-hidden flex flex-col bg-white shadow-sm group/terminal">
                    <div className="flex items-center px-6 py-4 border-b border-slate-100 justify-between bg-slate-50">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                      </div>
                      <div className="font-mono text-[9px] text-slate-500 font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        PRIMARY_INFERENCE_STREAM_LIVE
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-xs">
                         <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 font-mono text-[10px] p-6 text-slate-600 bg-slate-50/30 overflow-hidden relative">
                      <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 to-transparent pointer-events-none" />
                      <div className="space-y-1 relative z-10">
                        {FAKE_LOGS.slice(0, 4).map((log, i) => (
                          <motion.div 
                            key={i}
                            animate={{ opacity: i <= logIndex ? 1 : 0.2 }}
                            className={log.includes("ALERT") ? "text-orange-700 font-bold" : "text-slate-500"}
                          >
                            {`# [${i}] > ${log}`}
                          </motion.div>
                        ))}
                      </div>
                      <div className="space-y-1 hidden md:block relative z-10 mt-1">
                        {FAKE_LOGS.slice(4, 8).map((log, i) => (
                          <motion.div 
                            key={i+4}
                            animate={{ opacity: (i+4) <= logIndex ? 1 : 0.2 }}
                            className={log.includes("ALERT") ? "text-orange-700 font-bold" : "text-slate-500"}
                          >
                            {`# [${i+4}] > ${log}`}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>

          <footer className="mt-40 w-full text-center space-y-8 pb-10">
             <div className="flex justify-center gap-10">
                {["Analytics", "Live Stream", "Incidents", "API Docs"].map(link => (
                  <span key={link} className="text-[10px] font-bold tracking-[0.2em] text-slate-400 hover:text-orange-600 cursor-pointer transition-colors uppercase">
                    {link}
                  </span>
                ))}
             </div>
            <p className="text-[10px] font-mono text-slate-300 tracking-[0.5em] uppercase">
              DivyaDrishti v1.0 // Command Center // CSN Smart City
            </p>
          </footer>
        </main>
      </div>
  )
}

