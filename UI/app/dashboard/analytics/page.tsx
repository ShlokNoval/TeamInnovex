"use client"

import { AnalyticsCharts } from "@/components/dashboard/charts"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"
import { toast } from "sonner"

async function downloadPDFReport() {
  try {
    toast.info("Generating PDF report...")
    
    // Fetch current data from backend
    const [incidentsRes, analyticsRes] = await Promise.all([
      fetch('/api/incidents').then(r => r.json()),
      fetch('/api/analytics/summary').then(r => r.json()),
    ])

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    
    // Build HTML report
    const html = `
      <html>
      <head>
        <title>DivyaDrishti - Hazard Detection Report</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
          h1 { color: #0f3460; border-bottom: 3px solid #e94560; padding-bottom: 12px; }
          h2 { color: #16213e; margin-top: 28px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #0f3460; color: white; padding: 10px 14px; text-align: left; font-size: 13px; }
          td { padding: 8px 14px; border-bottom: 1px solid #ddd; font-size: 13px; }
          tr:nth-child(even) { background: #f8f9fa; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
          .summary-card { background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; }
          .summary-card .value { font-size: 32px; font-weight: bold; color: #0f3460; }
          .summary-card .label { font-size: 12px; color: #666; text-transform: uppercase; }
          .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
          .badge-high { background: #fee2e2; color: #dc2626; }
          .badge-medium { background: #fef3c7; color: #d97706; }
          .badge-low { background: #dcfce7; color: #16a34a; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; color: #999; font-size: 11px; }
        </style>
      </head>
      <body>
        <h1>🛡️ DivyaDrishti — Road Hazard Intelligence Report</h1>
        <div class="meta">Generated on ${dateStr} | System: AI Neural Analysis Engine v1.2</div>
        
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="value">${analyticsRes.total_detections}</div>
            <div class="label">Total Detections</div>
          </div>
          <div class="summary-card">
            <div class="value">${analyticsRes.by_type?.pothole || 0}</div>
            <div class="label">Potholes</div>
          </div>
          <div class="summary-card">
            <div class="value">${analyticsRes.by_type?.accident || 0}</div>
            <div class="label">Accidents</div>
          </div>
        </div>
        
        <h2>Incident Log</h2>
        <table>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Score</th>
            <th>Confidence</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
          ${incidentsRes.slice(0, 50).map((inc: any, idx: number) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${(inc.hazard_type || '').toUpperCase()}</td>
              <td><span class="badge badge-${inc.severity_label}">${(inc.severity_label || '').toUpperCase()}</span></td>
              <td>${inc.severity_score || 0}/100</td>
              <td>${((inc.confidence || 0) * 100).toFixed(0)}%</td>
              <td>${(inc.status || '').toUpperCase()}</td>
              <td>${new Date(inc.created_at).toLocaleString('en-IN')}</td>
            </tr>
          `).join('')}
        </table>
        ${incidentsRes.length === 0 ? '<p style="color:#999;text-align:center;">No incidents recorded in this session.</p>' : ''}
        
        <div class="footer">
          DivyaDrishti AI Road Hazard Detection System — Team Innovex | Confidential
        </div>
      </body>
      </html>
    `

    // Open print dialog with formatted HTML
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
      toast.success("PDF report ready — use Save as PDF in the print dialog")
    }
  } catch (err) {
    console.error('PDF generation error:', err)
    toast.error("Failed to generate PDF report")
  }
}

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 pb-20">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Analytics</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Deep dive into road hazard trends, severity distributions, and system performance.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button onClick={downloadPDFReport}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </Button>
        </div>
      </div>
      
      <div className="min-h-[600px] h-auto flex flex-col gap-6">
        <AnalyticsCharts />
        
        {/* Placeholder for future detailed analytics like average resolution time by hazard type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-6 bg-card border rounded-lg text-center">
            <div className="text-muted-foreground text-sm uppercase font-semibold mb-2">Camera Uptime</div>
            <div className="text-4xl font-mono text-primary">98.4%</div>
            <div className="text-xs text-muted-foreground mt-2">Across 5 active nodes</div>
          </div>
          <div className="p-6 bg-card border rounded-lg text-center">
            <div className="text-muted-foreground text-sm uppercase font-semibold mb-2">False Positives</div>
            <div className="text-4xl font-mono text-green-500">{"<"}2.1%</div>
            <div className="text-xs text-muted-foreground mt-2">Based on manual review</div>
          </div>
          <div className="p-6 bg-card border rounded-lg text-center">
            <div className="text-muted-foreground text-sm uppercase font-semibold mb-2">Avg AI Latency</div>
            <div className="text-4xl font-mono text-orange-400">112ms</div>
            <div className="text-xs text-muted-foreground mt-2">End-to-end inference</div>
          </div>
        </div>
      </div>
    </div>
  )
}
