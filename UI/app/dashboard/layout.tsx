"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, AlertCircle, Map, BarChart3, Camera as CameraIcon, Settings, Bell, Search, Menu, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { title: "Command Hub", href: "/dashboard", icon: LayoutDashboard },
  { title: "Active Alerts", href: "/dashboard/incidents", icon: AlertCircle },
  { title: "Geospatial Map", href: "/dashboard/map", icon: Map },
  { title: "AI Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Node Uplinks", href: "/dashboard/cameras", icon: CameraIcon },
  { title: "System Config", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const NavContent = () => (
    <nav className="space-y-2 max-w-[full]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
        return (
          <Link key={item.href} href={item.href} className="block w-full">
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start transition-all duration-300 ${
                isActive 
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)] font-medium" 
                  : "text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.title}
            </Button>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 md:flex-row font-sans selection:bg-indigo-500/30">
      {/* Desktop Sidebar (Glassmorphic) */}
      <aside className="hidden w-72 flex-col border-r border-slate-800/60 bg-slate-900/40 backdrop-blur-xl md:flex z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="flex h-20 items-center border-b border-slate-800/60 px-6 backdrop-blur-md">
          <ShieldAlert className="h-7 w-7 text-indigo-500 mr-3 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">DIVYADRISHTI</span>
            <span className="text-[10px] tracking-widest text-slate-500 font-mono">NEURAL SOC COMMAND</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-6 px-4">
          <NavContent />
        </div>
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Mesh Status</span>
              <span className="text-[10px] font-mono text-slate-500 mt-1">UPLINK: SECURE</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-emerald-400">ONLINE</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Deep Space Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md px-4 md:px-8 z-10 relative">
          <div className="flex items-center gap-4 md:hidden">
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-slate-950 border-r border-slate-800">
                <div className="flex h-20 items-center border-b border-slate-800 px-6">
                  <ShieldAlert className="h-7 w-7 text-indigo-500 mr-3" />
                  <div className="flex flex-col">
                    <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">DIVYADRISHTI</span>
                    <span className="text-[10px] tracking-widest text-slate-500 font-mono">SOC COMMAND</span>
                  </div>
                </div>
                <div className="p-4">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-bold tracking-wider text-indigo-400">SOC ALERTS</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md ml-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input
                type="search"
                placeholder="Search global incident logs..."
                className="w-full bg-slate-900/50 border-slate-700/50 pl-10 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500/50 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-full h-10 w-10">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full overflow-hidden outline-none ring-2 ring-indigo-500/20 ring-offset-2 ring-offset-slate-950 transition-all hover:ring-indigo-500/50">
                <Avatar className="h-full w-full cursor-pointer">
                    <AvatarImage src="" alt="@admin" />
                    <AvatarFallback className="bg-indigo-900/50 text-indigo-300 font-bold border border-indigo-500/30">AD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-slate-200" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-100">Authority Admin</p>
                      <p className="text-xs leading-none text-slate-500">ops@divyadrishti.gov</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem className="focus:bg-indigo-500/20 focus:text-indigo-300 cursor-pointer text-slate-300">Auth Profile</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-indigo-500/20 focus:text-indigo-300 cursor-pointer text-slate-300">Export Global Logs</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400 cursor-pointer text-red-500/80">Terminate Session</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto relative z-10 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
