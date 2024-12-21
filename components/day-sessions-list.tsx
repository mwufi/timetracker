'use client'

import { Project, WorkSession } from "@/lib/types"
import { formatDuration } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { EmptyState } from "./empty-state"

interface DaySessionsListProps {
  date: string
  sessions: (WorkSession & { project: Project })[]
  className?: string
}

export function DaySessionsList({ date, sessions, className }: DaySessionsListProps) {
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

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-medium">{formatDate(date)}</h3>
      {sessions.length > 0 ? (
        <div className="space-y-1">
          {sessions.map(session => (
            <div 
              key={session.id} 
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span 
                    className={cn(
                      "font-medium",
                      session.project.color ? `text-${session.project.color}-500` : "text-primary"
                    )}
                  >
                    {session.project.name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {session.name}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDuration(getDuration(session))}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          className="py-12"
          showImage={true}
        />
      )}
    </div>
  )
}
