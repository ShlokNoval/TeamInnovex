"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Incident } from "@/lib/types"
import { getIncidents } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HazardIcon } from "@/components/shared/hazard-icon"
import { SeverityBadge } from "@/components/shared/severity-badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filtered, setFiltered] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    getIncidents()
      .then(data => {
        setIncidents(data)
        setFiltered(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!search) {
      setFiltered(incidents)
      return
    }
    const lower = search.toLowerCase()
    setFiltered(incidents.filter(i => 
      i.id.toLowerCase().includes(lower) || 
      i.camera?.name.toLowerCase().includes(lower) ||
      i.hazard_type.toLowerCase().includes(lower)
    ))
  }, [search, incidents])

  return (
    <div className="p-4 md:p-8 pt-6 h-full flex flex-col">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Incidents Log</h2>
          <p className="text-muted-foreground mt-1">
            Complete history of all detected hazards and their resolution status.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 max-w-sm w-full relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, camera, or type..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      <div className="border rounded-md bg-card flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Location / Camera</TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer hover:text-primary">
                  Severity <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer hover:text-primary">
                  Detection Time <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(10).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <HazardIcon type={incident.hazard_type} className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize font-medium">{incident.hazard_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{incident.camera?.name || 'Unknown Camera'}</span>
                      <span className="text-xs text-muted-foreground">{incident.camera?.location_name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={incident.severity_label} />
                    <span className="text-xs text-muted-foreground ml-2">({incident.severity_score}/100)</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={incident.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{format(new Date(incident.created_at), 'MMM d, yyyy')}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(incident.created_at), 'HH:mm:ss')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/incidents/${incident.id}`}>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
