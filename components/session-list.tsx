"use client"

import { useMemo } from 'react'
import { formatDuration } from '@/lib/utils'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Session {
  id: number
  name: string
  created_at: string
  ended_at: string | null
  duration: number
}

interface SessionListProps {
  sessions: Session[]
  onEditSession: (session: Session) => void
}

function groupSessionsByDate(sessions: Session[]) {
  const groups = sessions.reduce((acc, session) => {
    const date = new Date(session.created_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let dateKey: string
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday'
    } else {
      dateKey = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }

    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(session)
    return acc
  }, {} as Record<string, Session[]>)

  return Object.entries(groups).sort((a, b) => {
    if (a[0] === 'Today') return -1
    if (b[0] === 'Today') return 1
    if (a[0] === 'Yesterday') return -1
    if (b[0] === 'Yesterday') return 1
    return new Date(b[1][0].created_at).getTime() - new Date(a[1][0].created_at).getTime()
  })
}

export function SessionList({ sessions, onEditSession }: SessionListProps) {
  const groupedSessions = useMemo(() => groupSessionsByDate(sessions), [sessions])
  const totalDuration = useMemo(() => 
    sessions.reduce((acc, session) => acc + session.duration, 0), 
    [sessions]
  )
  
  const inspirationalMessage = useMemo(() => {
    const totalHours = totalDuration / 3600
    if (totalHours >= 40) return "Amazing work! You've put in a full work week! 🎉"
    if (totalHours >= 20) return "You're crushing it! Keep up the great momentum! 💪"
    if (totalHours >= 10) return "Fantastic! You've worked over 10 hours this week! 🌟"
    if (totalHours >= 5) return "Great progress! You're building momentum! 🚀"
    if (totalHours > 0) return "Every minute counts! Keep going! ✨"
    return "Ready to start your journey? Let's go! 🎯"
  }, [totalDuration])

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Image
          src="/empty.png"
          alt="No sessions"
          width={200}
          height={200}
          className="mb-4 opacity-50"
        />
        <p className="text-lg text-muted-foreground">No sessions yet!</p>
        <p className="text-sm text-muted-foreground">Start a new session to begin tracking your progress.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 rounded-lg p-4">
        <p className="text-sm font-medium text-primary">{inspirationalMessage}</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {groupedSessions.map(([date, dateSessions]) => (
            <div key={date} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background py-2">
                {date}
              </h3>
              <div className="space-y-1">
                {dateSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => session.ended_at && onEditSession(session)}
                    className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                      session.ended_at 
                        ? 'hover:bg-secondary cursor-pointer' 
                        : 'bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        session.ended_at ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                      }`} />
                      <span className="font-medium">{session.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(session.duration * 1000)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="timeline" className="relative min-h-[200px]">
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Timeline view coming soon! 🎨
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
