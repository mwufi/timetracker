'use client'

import { useState, useRef, useEffect } from "react"
import { formatExactDuration } from "@/lib/utils"
import type { WorkSession } from "@/lib/types"
import { ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ActiveSessionProps {
  session: WorkSession
  elapsedTime: number
  onEnd: () => void
  onUpdate: (updates: Partial<WorkSession>) => void
  variant?: 'compact' | 'full'
}

export function ActiveSession({ 
  session, 
  elapsedTime, 
  onEnd,
  onUpdate,
  variant = 'full' 
}: ActiveSessionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(session.name)
  const inputRef = useRef<HTMLInputElement>(null)

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
        <button
          onClick={onEnd}
          className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-md transition-colors"
        >
          End Session
        </button>
      </div>
    )
  }

  return (
    <div className="mb-8 bg-primary text-primary-foreground rounded-lg shadow-lg overflow-hidden">
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
              <h2 
                className="text-2xl font-semibold cursor-pointer hover:text-primary-foreground/90 transition-colors" 
                onDoubleClick={handleDoubleClick}
              >
                {session.name}
              </h2>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          <div className="flex items-center space-x-8">
            <div className="text-4xl font-bold font-mono tracking-tight">
              {formatExactDuration(elapsedTime)}
            </div>
            <button
              onClick={onEnd}
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 px-6 py-3 rounded-md transition-colors text-lg"
            >
              End Session
            </button>
          </div>
        </div>
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
