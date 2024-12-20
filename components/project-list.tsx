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
        <div className="text-center space-y-3 py-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Flow</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your personal workspace for focused and productive work sessions. Join a project to get started!
          </p>
        </div>
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
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Your Projects</h1>
        <p className="text-muted-foreground">
          Track your progress and start new work sessions. Let's make today productive!
        </p>
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
