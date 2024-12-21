'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { Clock, Calendar, Target, Zap } from 'lucide-react'
import type { WorkSession } from '@/lib/types'

interface StatsViewProps {
  currentUser: User | null
}

export function StatsView({ currentUser }: StatsViewProps) {
  const [sessions, setSessions] = useState<WorkSession[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchSessions() {
      if (!currentUser) {
        setSessions([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('start_time', { ascending: false })

      if (error) {
        console.error('Error fetching sessions:', error)
        return
      }

      setSessions(data || [])
      setLoading(false)
    }

    fetchSessions()
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="text-center text-muted-foreground">
        Please sign in to view your statistics.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center text-muted-foreground">
        Loading statistics...
      </div>
    )
  }

  const totalHours = sessions.reduce((total, session) => {
    const duration = new Date(session.end_time).getTime() - new Date(session.start_time).getTime()
    return total + (duration / (1000 * 60 * 60))
  }, 0)

  const totalSessions = sessions.length
  const averageSessionLength = totalSessions > 0 ? totalHours / totalSessions : 0
  const lastSession = sessions[0]
  const lastSessionDate = lastSession ? new Date(lastSession.end_time).toLocaleDateString() : 'N/A'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">hours tracked</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSessions}</div>
          <p className="text-xs text-muted-foreground">work sessions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Session</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageSessionLength.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">hours per session</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Session</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lastSessionDate}</div>
          <p className="text-xs text-muted-foreground">most recent</p>
        </CardContent>
      </Card>
    </div>
  )
}
