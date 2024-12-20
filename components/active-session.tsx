'use client'

import { useState, useRef, useEffect } from "react"
import { formatExactDuration } from "@/lib/utils"
import type { WorkSession } from "@/lib/types"
import { createClient } from '@/utils/supabase/client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { User } from '@supabase/supabase-js'

const REACTIONS = ['👍', '🎉', '❤️', '🚀', '💪', '🌟']

interface ActiveSessionProps {
  session: WorkSession
  onEnd: () => void
  onUpdate: (updates: Partial<WorkSession>) => Promise<void>
  variant?: 'compact' | 'full'
}

export function ActiveSession({ 
  session, 
  onEnd,
  onUpdate,
  variant = 'full' 
}: ActiveSessionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(session.name)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isReactionOpen, setIsReactionOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user }}) => {
      setCurrentUser(user)
    })
  }, [])

  const isOwnSession = currentUser?.id === session.created_by

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
    setIsEditing(true)
    setEditValue(session.name)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleSave = () => {
    if (editValue.trim() !== session.name) {
      onUpdate({ name: editValue.trim() })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(session.name)
  }

  const handleReaction = (emoji: string) => {
    console.log('Reacting with:', emoji, 'to session:', session.id)
    setIsReactionOpen(false)
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-md ${
        isOwnSession ? 'bg-primary/10' : 'bg-secondary/20'
      }`}>
        <div className="space-y-1">
          <p className="text-sm font-medium">
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
            ) : (
              <span 
                className="text-sm font-medium cursor-pointer" 
                onDoubleClick={handleDoubleClick}
              >
                {session.name}
              </span>
            )}
            {!isOwnSession && (
              <span className="ml-2 text-xs text-muted-foreground">
                (by another user)
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatExactDuration(elapsedTime)}
          </p>
        </div>
        {!isOwnSession ? (
          <Popover open={isReactionOpen} onOpenChange={setIsReactionOpen}>
            <PopoverTrigger asChild>
              <button className="px-3 py-1 text-sm rounded-md bg-secondary hover:bg-secondary/80">
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
        ) : (
          <button
            onClick={onEnd}
            className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            End Session
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg ${
      isOwnSession ? 'bg-primary/10' : 'bg-secondary/20'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-10 text-2xl font-semibold bg-primary-foreground/10 border-primary-foreground/20"
                />
                <button 
                  onClick={handleSave}
                  className="text-primary-foreground/80 hover:text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
                >
                  <Check size={20} />
                </button>
                <button 
                  onClick={handleCancel}
                  className="text-primary-foreground/80 hover:text-primary-foreground p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <span 
                className="text-2xl font-semibold cursor-pointer" 
                onDoubleClick={handleDoubleClick}
              >
                {session.name}
              </span>
            )}
            {!isOwnSession && (
              <span className="ml-2 text-sm text-muted-foreground">
                (by another user)
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            Started at {new Date(session.created_at).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {!isOwnSession ? (
            <Popover open={isReactionOpen} onOpenChange={setIsReactionOpen}>
              <PopoverTrigger asChild>
                <button className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80">
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
          ) : (
            <button
              onClick={onEnd}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              End Session
            </button>
          )}
        </div>
      </div>
      <div className="text-3xl font-bold">
        {formatExactDuration(elapsedTime)}
      </div>
      {isExpanded && (
        <div className="px-8 py-6 bg-primary-foreground/5 border-t border-primary-foreground/10">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-sm text-primary-foreground/70 mb-1">Started</div>
              <div className="font-medium">
                {new Date(session.created_at).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-primary-foreground/70 mb-1">Project</div>
              <div className="font-medium">Project {session.project_id}</div>
            </div>
            <div>
              <div className="text-sm text-primary-foreground/70 mb-1">Category</div>
              <div className="font-medium capitalize">{session.category}</div>
            </div>
            <div>
              <div className="text-sm text-primary-foreground/70 mb-1">Session ID</div>
              <div className="font-medium">{session.id}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
