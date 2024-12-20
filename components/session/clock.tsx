'use client'

import { useEffect, useState } from "react"
import { formatExactDuration } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface ClockProps {
  startTime: string | Date
  className?: string
}

export function Clock({ startTime, className }: ClockProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const updateElapsedTime = () => {
      const duration = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
      setElapsedTime(duration)
    }

    updateElapsedTime()
    const interval = setInterval(updateElapsedTime, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return (
    <div className={cn("text-4xl font-bold font-mono tracking-tight", className)}>
      {formatExactDuration(elapsedTime)}
    </div>
  )
}
