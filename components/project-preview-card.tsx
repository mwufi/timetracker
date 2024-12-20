'use client'

import Image from "next/image"
import type { Project } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProjectPreviewCardProps {
  project: Project
  onJoinProject: () => void
}

export function ProjectPreviewCard({
  project,
  onJoinProject,
}: ProjectPreviewCardProps) {
  return (
    <div className="group relative max-w-sm w-full mx-auto overflow-hidden bg-card hover:bg-accent/5 transition-all duration-300 rounded-xl border shadow-sm hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={project.header_img || "/analog_interior.webp"}
          alt={project.name}
          fill
          className="object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">{project.name}</h3>
          <p className="text-muted-foreground mt-2 line-clamp-2">
            {project.description || 'Start your journey with this exciting new project!'}
          </p>
        </div>
        <button
          onClick={onJoinProject}
          className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/95 transition-colors font-medium"
        >
          Join Project
        </button>
      </div>
    </div>
  )
}
