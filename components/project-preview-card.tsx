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
    <div className="max-w-sm w-full mx-auto rounded-lg overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all">
      <div className="relative h-48 w-full">
        <Image
          src={project.header_img || "/analog_interior.webp"}
          alt={project.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-semibold">{project.name}</h3>
          <p className="text-muted-foreground mt-2">
            {project.description || 'No description'}
          </p>
        </div>
        <button
          onClick={onJoinProject}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Join Project
        </button>
      </div>
    </div>
  )
}
