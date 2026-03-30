import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { AnalyticsSummary } from "@/lib/types"
import { getAnalyticsSummary } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = {
  pothole: "hsl(var(--orange-500, 32 95% 44%))",
  animal: "hsl(var(--primary))",
  accident: "hsl(var(--red-500, 0 84% 60%))",
  low: "hsl(var(--green-500, 142 71% 45%))",
  medium: "hsl(var(--orange-500, 32 95% 44%))",
  high: "hsl(var(--red-500, 0 84% 60%))",
  critical: "hsl(var(--red-700, 0 74% 42%))",
}

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    getAnalyticsSummary().then(setData).catch(console.error)
  }, [])

  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <Skeleton className="h-full rounded-xl" />
        <Skeleton className="h-full rounded-xl" />
      </div>
    )
  }

  // Transform data for charts
  const hourlyData = data.hourly_breakdown.map(d => ({
    name: `${d.hour}:00`,
    Detections: d.count
  }))

  const typeData = [
    { name: 'Pothole', value: data.by_type.pothole, fill: COLORS.pothole },
    { name: 'Animal', value: data.by_type.animal, fill: COLORS.animal },
    { name: 'Accident', value: data.by_type.accident, fill: COLORS.accident },
  ]

  const severityData = [
    { name: 'Low', value: data.by_severity.low, fill: COLORS.low },
    { name: 'Medium', value: data.by_severity.medium, fill: COLORS.medium },
    { name: 'High', value: data.by_severity.high, fill: COLORS.high },
    { name: 'Critical', value: data.by_severity.critical, fill: COLORS.critical },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full pb-4">
      {/* Line Chart */}
      <Card className="col-span-1 lg:col-span-2 shadow-sm">
        <CardHeader className="py-4">
          <CardTitle>Detections Today</CardTitle>
          <CardDescription>Hourly breakdown of all recorded road hazards</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] min-h-[250px] min-w-0 w-full relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={hourlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line type="monotone" dataKey="Detections" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="shadow-sm">
        <CardHeader className="py-4">
          <CardTitle>By Hazard Type</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] min-h-[200px] min-w-0 w-full relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={typeData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={40} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="shadow-sm">
        <CardHeader className="py-4">
          <CardTitle>By Severity</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] min-h-[200px] min-w-0 w-full relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Tooltip />
              <Pie
                data={severityData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
