'use client'

import { formatExactDuration } from "@/lib/utils"
import type { Project, WorkSession, User } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: Project & { sessions: WorkSession[] }
  currentUser: User | null
  isExpanded: boolean
  onToggle: () => void
  onNewSession: () => void
}

export function ProjectCard({
  project,
  currentUser,
  isExpanded,
  onToggle,
  onNewSession,
}: ProjectCardProps) {
  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "p-4 rounded-lg bg-card hover:bg-card/80 transition-colors cursor-pointer relative overflow-hidden",
          project.created_by === currentUser?.id && "pl-6"
        )}
        onClick={onToggle}
      >
        {project.created_by === currentUser?.id && (
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
        )}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-medium">{project.name}</h3>
            <p className="text-sm text-muted-foreground">
              {project.description || 'No description'}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNewSession()
            }}
            className="shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            New Session
          </button>
        </div>
      </div>
      {isExpanded && project.sessions.length > 0 && (
        <div className="pl-6 space-y-3">
          <h4 className="text-sm font-medium">Recent Sessions</h4>
          <div className="grid gap-2">
            {project.sessions.map(session => (
              <div 
                key={session.id}
                className="p-3 rounded-md bg-muted/50 flex items-center justify-between flex-wrap gap-2"
              >
                <div>
                  <p className="font-medium">{session.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-lg font-mono">
                  {formatExactDuration(session.duration)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
