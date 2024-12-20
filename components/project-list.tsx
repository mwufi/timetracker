'use client'

import Image from "next/image"
import type { Project, WorkSession, User } from "@/lib/types"
import { ProjectCard } from "./project-card"

interface ProjectListProps {
  projects: (Project & { sessions: WorkSession[] })[]
  currentUser: User | null
  expandedProjectId: number | null
  onToggleProject: (id: number) => void
  onNewSession: (id: number) => void
}

export function ProjectList({
  projects,
  currentUser,
  expandedProjectId,
  onToggleProject,
  onNewSession,
}: ProjectListProps) {
  if (!projects.length) {
    return (
      <div className="text-center py-12">
        <div className="relative w-64 h-64 mx-auto mb-6 rounded-lg overflow-hidden">
          <Image
            src="/analog_interior.webp"
            alt="No projects yet"
            fill
            className="object-cover"
          />
        </div>
        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
        <p className="text-muted-foreground">
          Create your first project to start tracking your work sessions
        </p>
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
          />
        ))}
      </div>
    </div>
  )
}
