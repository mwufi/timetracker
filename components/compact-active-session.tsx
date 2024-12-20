'use client'

import { useState, useRef, useEffect } from "react"
import { formatExactDuration } from "@/lib/utils"
import type { WorkSession } from "@/lib/types"
import { Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CompactActiveSessionProps {
  session: WorkSession
  onEnd?: () => void
  onUpdate?: (updates: Partial<WorkSession>) => void
  position?: 'fixed' | 'relative'
}

export function CompactActiveSession({
  session,
  onEnd,
  onUpdate,
  position = 'fixed'
}: CompactActiveSessionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(session.name)
  const [elapsedTime, setElapsedTime] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update elapsed time every second
  useEffect(() => {
    const updateElapsedTime = () => {
      const duration = Math.floor((Date.now() - new Date(session.created_at).getTime()) / 1000)
      setElapsedTime(duration)
    }

    // Initial update
    updateElapsedTime()

    // Update every second
    const interval = setInterval(updateElapsedTime, 1000)

    return () => clearInterval(interval)
  }, [session.created_at])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (onUpdate) {
      setIsEditing(true)
      setEditValue(session.name)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleSave = () => {
    if (editValue.trim() !== session.name && onUpdate) {
      onUpdate({ name: editValue.trim() })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(session.name)
  }

  return (
    <div className={cn(
      "bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg",
      position === 'fixed' ? "fixed bottom-4 right-4" : "absolute bottom-4 right-4"
    )}>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between space-x-4">
          <div className="text-2xl font-bold font-mono">
            {formatExactDuration(elapsedTime)}
          </div>
          {onEnd && (
            <button
              onClick={onEnd}
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-md transition-colors text-sm"
            >
              End
            </button>
          )}
        </div>

        <div
          className="text-sm font-medium cursor-pointer text-primary-foreground/70"
          onDoubleClick={handleDoubleClick}
        >
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-6 py-0 w-[200px] bg-primary-foreground/10 border-primary-foreground/20"
              />
              <button onClick={handleSave} className="text-primary-foreground/80 hover:text-primary-foreground">
                <Check size={14} />
              </button>
              <button onClick={handleCancel} className="text-primary-foreground/80 hover:text-primary-foreground">
                <X size={14} />
              </button>
            </div>
          ) : session.name}
        </div>
      </div>
    </div>
  )
}
