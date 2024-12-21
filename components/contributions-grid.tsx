'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { WorkSession, Project } from '@/lib/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ContributionsGridProps {
  sessions: (WorkSession & { project: Project })[]
  metric: 'count' | 'duration'
  selectedDate: string | null
  onSelectDate: (date: string) => void
  className?: string
}

export function ContributionsGrid({
  sessions,
  metric,
  selectedDate,
  onSelectDate,
  className
}: ContributionsGridProps) {
  const gridData = useMemo(() => {
    // Get dates for the last 7 days
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 6) // 7 days including today

    // Create a map of dates to session data
    const dateMap = new Map<string, {
      count: number
      duration: number
      sessions: (WorkSession & { project: Project })[]
    }>()

    // Initialize all dates in the range
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      dateMap.set(dateKey, { count: 0, duration: 0, sessions: [] })
    }

    // Populate with actual session data
    sessions.forEach(session => {
      const sessionDate = new Date(session.created_at)
      const localDate = new Date(sessionDate.getTime() - sessionDate.getTimezoneOffset() * 60000)
      const dateKey = localDate.toISOString().split('T')[0]
      const existing = dateMap.get(dateKey)
      if (existing) {
        existing.count += 1
        if (session.ended_at) {
          existing.duration += (new Date(session.ended_at).getTime() - new Date(session.created_at).getTime())
        } else if (session.duration) {
          existing.duration += session.duration
        }
        existing.sessions.push(session)
      }
    })

    // Convert to array of days
    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      duration: data.duration / (1000 * 60), // Convert to minutes
      value: metric === 'count' ? data.count : data.duration / (1000 * 60 * 60), // Hours for intensity
      sessions: data.sessions
    }))
  }, [sessions, metric])

  const getIntensityClass = (value: number) => {
    if (value === 0) return 'bg-gray-100'
    if (metric === 'count') {
      if (value <= 1) return 'bg-green-100'
      if (value <= 3) return 'bg-green-300'
      if (value <= 5) return 'bg-green-500'
      return 'bg-green-700'
    } else {
      // Duration in hours
      if (value <= 2) return 'bg-green-100'
      if (value <= 4) return 'bg-green-300'
      if (value <= 6) return 'bg-green-500'
      return 'bg-green-700'
    }
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.floor(minutes % 60)
    if (hours === 0) return `${remainingMinutes} minutes`
    if (remainingMinutes === 0) return `${hours} hours`
    return `${hours} hours ${remainingMinutes} minutes`
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === today.toISOString().split('T')[0]) return 'today'
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  return (
    <div className={cn("flex justify-end gap-1", className)}>
      <TooltipProvider>
        {gridData.map((day) => (
          <Tooltip key={day.date}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelectDate(selectedDate === day.date ? '' : day.date)}
                className={cn(
                  "w-14 h-14 rounded-md transition-all",
                  getIntensityClass(day.value),
                  selectedDate === day.date && "ring-2 ring-primary ring-offset-2"
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-medium">
                  {formatDate(day.date)}
                </p>
                {day.duration > 0 ? (
                  <p>
                    You spent <span className="text-green-500 font-medium">{formatDuration(day.duration)}</span> {metric === 'count' ? `across ${day.count} sessions` : ''}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No activity</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}
