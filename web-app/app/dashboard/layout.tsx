"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, AlertCircle, Map, BarChart3, Camera as CameraIcon, Settings, Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Incidents", href: "/dashboard/incidents", icon: AlertCircle },
  { title: "Map View", href: "/dashboard/map", icon: Map },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Cameras", href: "/dashboard/cameras", icon: CameraIcon },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const NavContent = () => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
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
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <AlertCircle className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold">Aura-Sys</span>
        </div>
        <div className="flex-1 overflow-auto py-4 px-3">
          <NavContent />
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-medium text-green-500">Online</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-4 md:hidden">
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center border-b px-6">
                  <AlertCircle className="h-6 w-6 text-primary mr-2" />
                  <span className="font-bold">Aura-Sys</span>
                </div>
                <div className="p-4">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-bold">Aura-Sys</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search cameras or incidents..."
                className="w-full bg-background pl-9 md:w-[300px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-8 w-8 rounded-full overflow-hidden outline-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src="" alt="@admin" />
                    <AvatarFallback className="bg-primary/20 text-primary">AD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Authority Admin</p>
                    <p className="text-xs leading-none text-muted-foreground">admin@divyadrishti.gov</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Email History</DropdownMenuItem>
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  )
}
