'use client'

import { formatExactDuration } from "@/lib/utils"
import type { WorkSession, User } from "@/lib/types"
import { Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SessionHistoryProps {
  sessions: WorkSession[]
  currentUser: User | null
  onEditSession: (session: WorkSession) => void
  onDeleteSession: (session: WorkSession) => void
}

export function SessionHistory({
  sessions,
  currentUser,
  onEditSession,
  onDeleteSession,
}: SessionHistoryProps) {
  // Group sessions by date
  const groupedSessions = sessions.reduce<Record<string, WorkSession[]>>((groups, session) => {
    const date = new Date(session.created_at).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(session)
    return groups
  }, {})

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedSessions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No sessions yet</p>
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <div key={date} className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">
            {new Date(date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </h5>
          <div className="space-y-1.5">
            {groupedSessions[date].map(session => {
              const isInProgress = !session.ended_at
              return (
                <div 
                  key={session.id}
                  onClick={() => onEditSession(session)}
                  className="group px-3 py-2 rounded-md bg-background hover:bg-muted/50 flex items-center gap-3 text-sm cursor-pointer relative"
                >
                  <div 
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full",
                      isInProgress ? "bg-blue-500" : "bg-green-500"
                    )}
                  />
                  <div className="flex-1 truncate">
                    <span className="font-medium">{session.name}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {new Date(session.created_at).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "font-mono text-sm",
                      isInProgress ? "text-blue-500" : "text-muted-foreground"
                    )}>
                      {isInProgress ? "IN PROGRESS" : formatExactDuration(session.duration)}
                    </div>
                    {session.created_by === currentUser?.id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditSession(session)
                          }}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteSession(session)
                          }}
                          className="p-1 hover:bg-muted rounded text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
