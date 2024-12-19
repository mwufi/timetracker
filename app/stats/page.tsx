"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { NavBar } from "@/components/nav-bar"
import { formatDuration } from "@/lib/utils"
import { createBackend } from "@/lib/backend"

const chartConfig = {
  totalTime: {
    label: "Total Time (hours)",
    color: "#2563eb",
  },
  sessions: {
    label: "Number of Sessions",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export default function StatsPage() {
  const [projectStats, setProjectStats] = useState<any[]>([])
  const [totalStats, setTotalStats] = useState({
    totalTime: 0,
    totalSessions: 0,
    averageSessionLength: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const backend = createBackend('supabase')
      const projects = await backend.getProjects()

      const stats = await Promise.all(
        projects.map(async (project) => {
          const sessions = await backend.getSessions(project.id)
          const totalTime = sessions.reduce((acc, session) => {
            if (!session.ended_at) return acc
            const duration = new Date(session.ended_at).getTime() - new Date(session.created_at).getTime()
            return acc + duration
          }, 0)

          return {
            name: project.name,
            totalTime: totalTime / (1000 * 60 * 60), // Convert to hours
            sessions: sessions.length,
          }
        })
      )

      const overallTotalTime = stats.reduce((acc, stat) => acc + stat.totalTime, 0)
      const overallTotalSessions = stats.reduce((acc, stat) => acc + stat.sessions, 0)

      setProjectStats(stats)
      setTotalStats({
        totalTime: overallTotalTime,
        totalSessions: overallTotalSessions,
        averageSessionLength: overallTotalSessions ? overallTotalTime / overallTotalSessions : 0,
      })
    }

    fetchStats()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <NavBar />
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalStats.totalTime * 60 * 60 * 1000)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Session Length</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(totalStats.averageSessionLength * 60 * 60 * 1000)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[400px]">
            <BarChart data={projectStats}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "totalTime"
                    ? formatDuration(value * 60 * 60 * 1000)
                    : `${value} session${value !== 1 ? 's' : ''}`,
                  name
                ]}
              />
              <Bar
                dataKey="totalTime"
                fill="var(--color-totalTime)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="sessions"
                fill="var(--color-sessions)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
