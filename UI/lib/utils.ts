import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { HazardType, SeverityLabel, IncidentStatus } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSeverityColor(severity: SeverityLabel): string {
  switch (severity) {
    case 'low': return 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900'
    case 'medium': return 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900'
    case 'high': return 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
    case 'critical': return 'bg-red-600 animate-pulse text-white border-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusColor(status: IncidentStatus): string {
  switch (status) {
    case 'new': return 'bg-orange-500/15 text-orange-700 dark:text-orange-400'
    case 'acknowledged': return 'bg-purple-500/15 text-purple-700 dark:text-purple-400'
    case 'resolved': return 'bg-gray-500/15 text-gray-700 dark:text-gray-400 line-through'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return `${Math.max(0, seconds)}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
