"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Activity, ShieldAlert, Cpu, Network, Lock, Zap, Search, ShieldCheck, CheckCircle2, ChevronRight, Play, MonitorPlay, FileVideo, Video, Wifi, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black/95 relative overflow-hidden flex flex-col font-sans selection:bg-primary/30 text-white">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-size-[40px_40px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Atmospheric Backgrounds (Blooms) */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[140px] pointer-events-none opacity-50" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl border-b border-white/5 bg-black/20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5 font-mono font-black text-xl tracking-tighter"
        >
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <Activity className="w-5 h-5 text-black animate-pulse" />
          </div>
          <span className="bg-clip-text text-transparent bg-linear-to-r from-white to-white/60">DIVYADRISHTI</span>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" className="h-10 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-mono text-xs tracking-widest gap-2 rounded-full px-5 transition-all active:scale-95 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              AUTHORITY LOGIN
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-40 pb-20 z-10 container px-4 mx-auto max-w-6xl">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-10 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center rounded-full border border-primary/40 bg-primary/5 px-4 py-1.5 text-xs font-mono font-bold text-primary tracking-widest uppercase shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Neural Inference Engine Active v1.2
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] max-w-4xl mx-auto">
              Understand every <br />
              <span className="bg-clip-text text-transparent bg-linear-to-b from-primary via-orange-500 to-red-600">anomaly instantly.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
              Real-time YOLOv8 monitoring of CCTV streams. Automatically detect road anomalies, track hazards, and orchestrate immediate emergency protocols.
            </p>
          </motion.div>

          {/* Technical Info Row */}
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
              { label: "ACTIVE NODES", value: "256+" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1 group">
                <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase group-hover:text-primary transition-colors">{stat.label}</span>
                <span className="text-2xl font-black font-mono tracking-tighter">{stat.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Dual Action CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-3xl flex flex-col md:flex-row items-stretch justify-center gap-4 mt-8"
          >
            {/* Action 1: Local Analysis */}
            <Link href="/testing?mode=file" className="group relative flex-1">
              <div className="absolute -inset-px bg-linear-to-r from-white/20 to-white/0 rounded-2xl blur-[2px] opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="h-full relative flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white/5 to-transparent skew-x-[-20deg]" />
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                  <MonitorPlay className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-start flex-1 text-left">
                  <span className="text-white font-bold tracking-tight text-lg">Local Simulation</span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">Upload mp4 dataset</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* Action 2: Live Node (Primary) */}
            <Link href="/testing?mode=live" className="group relative flex-1">
              <div className="absolute -inset-px bg-linear-to-r from-primary to-orange-500 rounded-2xl blur-[2px] opacity-40 group-hover:opacity-80 transition-opacity" />
              <div className="h-full relative flex items-center gap-4 p-4 rounded-2xl bg-black border border-primary/30 backdrop-blur-xl hover:bg-primary/10 transition-colors cursor-pointer overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-primary/10 to-transparent skew-x-[-20deg]" />
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border border-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
                  <Wifi className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div className="flex flex-col items-start flex-1 text-left">
                  <span className="text-primary font-black tracking-tight text-lg">Live Node Uplink</span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-primary/60">Connect remote IP / Phone</span>
                </div>
                <ChevronRight className="w-5 h-5 text-primary/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Intelligence Modules Section */}
        <div className="w-full space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase flex items-center gap-2">
                <div className="w-8 h-px bg-primary/40" />
                Intelligence Modules
              </span>
              <h2 className="text-5xl font-black tracking-tight max-w-xl">Neural Mesh <span className="text-white/30">Infrastructure.</span></h2>
            </div>
            <div className="items-center gap-4 text-[10px] font-mono text-white/40 uppercase tracking-widest hidden md:flex">
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
            {/* Primary Large Card: Kinetic Detection */}
            <div className="md:col-span-8 group relative h-[500px]">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl group-hover:bg-primary/10 transition-colors pointer-events-none border border-white/5 shadow-inner" />
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <motion.div 
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-10 bg-linear-to-b from-transparent via-primary/10 to-transparent z-20 pointer-events-none"
                />
                <div className="absolute inset-0 bg-size-[20px_20px] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] opacity-20" />
              </div>

              <div className="relative h-full flex flex-col p-10 justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-2xl shadow-primary/20 border border-primary/20 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-primary font-bold tracking-[0.2em] mb-1">MODULE_ALPHA_01</div>
                    <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary uppercase font-mono text-[9px]">LIDAR-KINEMATIC</Badge>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter max-w-md">Accident Kinetic Recognition</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6 border-y border-white/5 bg-black/20 backdrop-blur-sm -mx-10 px-10">
                    {[
                      { l: "LATENCY", v: "14ms" },
                      { l: "OBJECTS", v: "150+" },
                      { l: "V_MAX", v: "240km/h" },
                      { l: "CONFIDENCE", v: "99.2%" }
                    ].map((s, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{s.l}</span>
                        <span className="text-sm font-black font-mono text-primary">{s.v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-lg max-w-xl leading-relaxed">
                    Employs multi-frame neural motion analysis to detect high-velocity collisions and sudden traffic disruptions with real-time priority alerts.
                  </p>
                </div>
              </div>
            </div>

            {/* Side Card: Pothole Detection */}
            <div className="md:col-span-4 group relative h-[500px]">
               <div className="absolute inset-0 bg-white/5 rounded-3xl border border-white/5 hover:border-primary/20 transition-all flex flex-col">
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 border border-orange-500/20">
                          <Search className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-mono text-white/20 tracking-widest uppercase">MODULE_BETA_08</span>
                      </div>
                      <h3 className="text-3xl font-black mb-4 tracking-tighter">Dynamic Pothole Monitoring</h3>
                      <p className="text-white/40 leading-relaxed text-sm">
                        Identifies road damage instantly, logging precise GPS coordinates for city authorities through automated sensor arrays.
                      </p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                          <span className="text-white/40">Active Nodes</span>
                          <span className="text-primary">021/NODE</span>
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
                  <div className="absolute bottom-4 right-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
                    <Shield className="w-32 h-32" />
                  </div>
               </div>
            </div>

            {/* Bottom Card: Trajectory Tracking */}
            <div className="md:col-span-12 group relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-3xl p-8 border border-white/5 hover:border-indigo-500/30 transition-all relative overflow-hidden group/card shadow-2xl bg-black/20">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover/card:bg-indigo-500/10 transition-colors" />
                   <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/20">
                      <Activity className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-bold mb-3">Trajectory Tracking</h3>
                   <p className="text-white/30 text-sm leading-relaxed">
                      Predicts accident risks by analyzing wildlife and stray animal pathways in high-speed zones.
                   </p>
                </div>
                <div className="md:col-span-2 glass-card rounded-3xl p-8 border border-white/5 bg-linear-to-br from-white/[0.02] to-transparent flex items-center justify-center min-h-[160px]">
                  <div className="text-center space-y-2">
                    <div className="text-[10px] font-mono text-white/20 tracking-[0.4em] uppercase">Status Check</div>
                    <div className="text-2xl font-black text-white/40 tracking-tighter">ALL MODULES OPERATIONAL</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <footer className="mt-40 w-full text-center space-y-8">
           <div className="flex justify-center gap-10">
              {["Analytics", "Live Stream", "Incidents", "API Docs"].map(link => (
                <span key={link} className="text-[10px] font-bold tracking-[0.2em] text-white/20 hover:text-primary cursor-pointer transition-colors uppercase">
                  {link}
                </span>
              ))}
           </div>
          <p className="text-[10px] font-mono text-white/10 tracking-[0.5em] uppercase pb-8">
            DivyaDrishti v1.0 // Command Center // Predicted Excellence
          </p>
        </footer>
      </main>
    </div>
  )
}
