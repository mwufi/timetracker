'use client'

import type { Project, WorkSession, User } from "@/lib/types"
import { ProjectCard } from "./project-card"
import { ProjectPreviewCard } from "./project-preview-card"

interface ProjectListProps {
  projects: (Project & { sessions: WorkSession[] })[]
  currentUser: User | null
  expandedProjectId: number | null
  onToggleProject: (id: number) => void
  onNewSession: (id: number) => void
  onEditSession?: (session: WorkSession) => void
  onDeleteSession?: (session: WorkSession) => void
}

export function ProjectList({
  projects,
  currentUser,
  expandedProjectId,
  onToggleProject,
  onNewSession,
  onEditSession,
  onDeleteSession,
}: ProjectListProps) {
  if (!projects.length) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No projects yet</p>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectPreviewCard
              key={project.id}
              project={project}
              onJoinProject={() => onNewSession(project.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
      </div>
      <div className="grid gap-4 sm:gap-6">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            currentUser={currentUser}
            isExpanded={expandedProjectId === project.id}
            onToggle={() => onToggleProject(project.id)}
            onNewSession={() => onNewSession(project.id)}
            onEditSession={onEditSession}
            onDeleteSession={onDeleteSession}
          />
        ))}
      </div>
    </div>
  )
}
