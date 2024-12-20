'use client'

import { useState, useRef, useEffect } from "react"
import { formatExactDuration } from "@/lib/utils"
import type { WorkSession } from "@/lib/types"
import { ChevronDown, ChevronUp, Check, X, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const REACTIONS = ['👍', '🎉', '❤️', '🚀', '💪', '🌟']

interface ActiveSessionProps {
  session: WorkSession
  onEnd?: () => void
  onUpdate?: (updates: Partial<WorkSession>) => void
  onReaction?: (emoji: string) => void
  variant?: 'compact' | 'full' | 'universe'
}

export function ActiveSession({ 
  session, 
  onEnd,
  onUpdate,
  onReaction,
  variant = 'full' 
}: ActiveSessionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(session.name)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isReactionOpen, setIsReactionOpen] = useState(false)
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

  const handleReaction = (emoji: string) => {
    if (onReaction) {
      onReaction(emoji)
    }
    setIsReactionOpen(false)
  }

  if (variant === 'compact') {
    return (
      <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4">
        <div>
          <div 
            className="text-sm font-medium mb-1 cursor-pointer" 
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
          <div className="text-2xl font-bold font-mono">{formatExactDuration(elapsedTime)}</div>
        </div>
        {onEnd && (
          <button
            onClick={onEnd}
            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-md transition-colors"
          >
            End Session
          </button>
        )}
      </div>
    )
  }

  const isUniverseVariant = variant === 'universe'

  return (
    <div className={cn(
      "mb-8 rounded-lg shadow-lg overflow-hidden relative",
      isUniverseVariant ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
    )}>
      {/* Left color bar for own sessions */}
      {!isUniverseVariant && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
      )}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "h-10 text-2xl font-semibold",
                    isUniverseVariant 
                      ? "bg-secondary-foreground/10 border-secondary-foreground/20" 
                      : "bg-primary-foreground/10 border-primary-foreground/20"
                  )}
                />
                <button 
                  onClick={handleSave}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isUniverseVariant
                      ? "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                      : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  )}
                >
                  <Check size={20} />
                </button>
                <button 
                  onClick={handleCancel}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isUniverseVariant
                      ? "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                      : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  )}
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {isUniverseVariant && <Globe size={20} className={cn(
                  isUniverseVariant ? "text-secondary-foreground/70" : "text-primary-foreground/70"
                )} />}
                <h2 
                  className={cn(
                    "text-2xl font-semibold cursor-pointer transition-colors",
                    isUniverseVariant
                      ? "hover:text-secondary-foreground/90"
                      : "hover:text-primary-foreground/90"
                  )}
                  onDoubleClick={handleDoubleClick}
                >
                  {session.name}
                </h2>
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "transition-colors",
                isUniverseVariant
                  ? "text-secondary-foreground/80 hover:text-secondary-foreground"
                  : "text-primary-foreground/80 hover:text-primary-foreground"
              )}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          <div className="flex items-center space-x-8">
            <div className="text-4xl font-bold font-mono tracking-tight">
              {formatExactDuration(elapsedTime)}
            </div>
            <div className="flex items-center space-x-4">
              {isUniverseVariant && onReaction && (
                <Popover open={isReactionOpen} onOpenChange={setIsReactionOpen}>
                  <PopoverTrigger asChild>
                    <button className={cn(
                      "px-4 py-2 rounded-md transition-colors text-sm font-medium",
                      "bg-secondary-foreground/10 hover:bg-secondary-foreground/20"
                    )}>
                      Yap!
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit p-2">
                    <div className="flex gap-2">
                      {REACTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(emoji)}
                          className="text-xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              {onEnd && (
                <button
                  onClick={onEnd}
                  className={cn(
                    "px-6 py-3 rounded-md transition-colors text-lg",
                    isUniverseVariant
                      ? "bg-secondary-foreground/10 hover:bg-secondary-foreground/20"
                      : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                  )}
                >
                  End Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className={cn(
          "px-8 py-6 border-t",
          isUniverseVariant
            ? "bg-secondary-foreground/5 border-secondary-foreground/10"
            : "bg-primary-foreground/5 border-primary-foreground/10"
        )}>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className={cn(
                "text-sm mb-1",
                isUniverseVariant ? "text-secondary-foreground/70" : "text-primary-foreground/70"
              )}>Started</div>
              <div className="font-medium">
                {new Date(session.created_at).toLocaleString()}
              </div>
            </div>
            <div>
              <div className={cn(
                "text-sm mb-1",
                isUniverseVariant ? "text-secondary-foreground/70" : "text-primary-foreground/70"
              )}>Project</div>
              <div className="font-medium">Project {session.project_id}</div>
            </div>
            <div>
              <div className={cn(
                "text-sm mb-1",
                isUniverseVariant ? "text-secondary-foreground/70" : "text-primary-foreground/70"
              )}>Category</div>
              <div className="font-medium capitalize">{session.category}</div>
            </div>
            <div>
              <div className={cn(
                "text-sm mb-1",
                isUniverseVariant ? "text-secondary-foreground/70" : "text-primary-foreground/70"
              )}>Session ID</div>
              <div className="font-medium">{session.id}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
