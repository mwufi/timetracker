'use client'

import { useState } from "react"
import type { WorkSession } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Clock } from "@/components/session/clock"
import { YapButton } from "@/components/session/yap-button"
import { EndButton } from "@/components/session/end-button"
import { EditableTitle } from "@/components/session/editable-title"

interface ActiveSessionProps {
  session: WorkSession
  onEnd?: () => void
  onUpdate?: (updates: Partial<WorkSession>) => void
  onReaction?: (emoji: string) => void
  variant?: 'full' | 'universe'
}

export function ActiveSession({
  session,
  onEnd,
  onUpdate,
  onReaction,
  variant = 'full'
}: ActiveSessionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isUniverseVariant = variant === 'universe'

  return (
    <div className={cn(
      "mb-8 rounded-lg shadow-lg overflow-hidden relative",
      isUniverseVariant ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
    )}>
      <div className="px-8 py-6">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
          {/* Mobile: Time and Action Button */}
          <div className="flex items-center justify-between md:hidden">
            <Clock startTime={session.created_at} />
            {isUniverseVariant ? (
              <YapButton onReaction={onReaction} variant="secondary" size="sm" />
            ) : onEnd && (
              <EndButton onEnd={onEnd} size="sm" />
            )}
          </div>

          {/* Title Section */}
          <div className="flex items-center space-x-6">
            <EditableTitle 
              title={session.name}
              onUpdate={updates => onUpdate?.({ name: updates })}
              isUniverseVariant={isUniverseVariant}
            />
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

          {/* Desktop: Time and Action Button */}
          <div className="hidden md:flex items-center space-x-8">
            <Clock startTime={session.created_at} />
            <div className="flex items-center space-x-4">
              {isUniverseVariant ? (
                <YapButton onReaction={onReaction} variant="secondary" size="lg" />
              ) : onEnd && (
                <EndButton onEnd={onEnd} size="lg" />
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className={cn(
          "px-8 py-6 border-t",
          isUniverseVariant 
            ? "border-secondary-foreground/10 bg-secondary-foreground/5" 
            : "border-primary-foreground/10 bg-primary-foreground/5"
        )}>
          <div className="text-sm">
            Started {new Date(session.created_at).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}
