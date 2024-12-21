'use client'

import { Project, WorkSession } from "@/lib/types"
import { formatDuration } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { EmptyState } from "./empty-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

interface DaySessionsTabsProps {
  date: string
  sessions: (WorkSession & { project: Project })[]
  className?: string
}

export function DaySessionsTabs({ date, sessions, className }: DaySessionsTabsProps) {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === today.toISOString().split('T')[0]) return 'Today'
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  const getDuration = (session: WorkSession): number => {
    if (session.ended_at) {
      return new Date(session.ended_at).getTime() - new Date(session.created_at).getTime()
    }
    return session.duration || 0
  }

  // Get summary data
  const totalSessions = sessions.length
  const sessionsByProject = sessions.reduce((acc, session) => {
    const projectId = session.project.id
    if (!acc[projectId]) {
      acc[projectId] = {
        name: session.project.name,
        color: session.project.color,
        count: 0,
        totalDuration: 0,
        sessions: []
      }
    }
    acc[projectId].count++
    const duration = getDuration(session)
    acc[projectId].totalDuration += duration
    acc[projectId].sessions.push({
      name: session.name,
      duration
    })
    return acc
  }, {} as Record<string, {
    name: string
    color: string
    count: number
    totalDuration: number
    sessions: { name: string, duration: number }[]
  }>)

  // Find project with longest total duration
  const favoriteProject = Object.values(sessionsByProject)
    .sort((a, b) => b.totalDuration - a.totalDuration)[0]

  // Find session name with longest total duration within favorite project
  const favoritePastime = favoriteProject?.sessions
    .reduce((acc, { name, duration }) => {
      acc[name] = (acc[name] || 0) + duration
      return acc
    }, {} as Record<string, number>)

  const favoriteSessionName = favoritePastime ?
    Object.entries(favoritePastime)
      .sort(([, a], [, b]) => b - a)[0]?.[0]
    : null

  if (!sessions.length) {
    return (
      <div className={cn("space-y-2", className)}>
        <h3 className="font-medium">{formatDate(date)}</h3>
        <EmptyState className="py-12" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-medium text-xl">{formatDate(date)}</h3>
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="mt-6 space-y-8">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-3xl font-bold tracking-tight">
              You completed{" "}
              <span className="text-primary">
                {totalSessions} session{totalSessions !== 1 ? 's' : ''}
              </span>{" "}
              today! 🎉
            </p>
            {favoriteSessionName && favoriteProject && (
              <p className="text-2xl">
                Your favorite pastime was{" "}
                <span className={cn(
                  "font-bold",
                  favoriteProject.color ? `text-${favoriteProject.color}-500` : "text-primary"
                )}>
                  "{favoriteSessionName}"
                </span>
              </p>
            )}
          </motion.div>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-xl font-semibold">Breakdown by project</h4>
            <div className="space-y-3">
              {Object.values(sessionsByProject)
                .sort((a, b) => b.totalDuration - a.totalDuration)
                .map(({ name, color, count, totalDuration }) => (
                  <motion.div
                    key={name}
                    className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="space-y-1">
                      <span className={cn(
                        "text-lg font-bold block group-hover:scale-105 transition-transform duration-200",
                        color ? `text-${color}-500` : "text-primary"
                      )}>
                        {name}
                      </span>
                      <span className="text-sm text-muted-foreground block">
                        {count} session{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-lg font-medium">
                      {formatDuration(totalDuration)}
                    </span>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="sessions" className="mt-6">
          <div className="space-y-1">
            {sessions.map(session => (
              <motion.div
                key={session.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-all duration-200"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "font-medium",
                      session.project.color ? `text-${session.project.color}-500` : "text-primary"
                    )}
                  >
                    {session.project.name}
                  </span>
                  <span className="text-muted-foreground">
                    {session.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {formatDuration(getDuration(session))}
                </span>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
