'use client'

import { formatExactDuration } from "@/lib/utils"
import type { Project, WorkSession, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { SessionHistory } from "@/components/session-history"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { EditSessionDialog } from "@/components/edit-session-dialog"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ProjectCardProps {
  project: Project & { sessions: WorkSession[] }
  currentUser: User | null
  isExpanded: boolean
  onToggle: () => void
  onNewSession: () => void
  onEditSession?: (session: WorkSession) => void
  onDeleteSession?: (session: WorkSession) => void
}

export function ProjectCard({
  project,
  currentUser,
  isExpanded,
  onToggle,
  onNewSession,
  onEditSession,
  onDeleteSession,
}: ProjectCardProps) {
  const [selectedSession, setSelectedSession] = useState<WorkSession | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editName, setEditName] = useState('')
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')

  const handleEditSession = (session: WorkSession) => {
    setSelectedSession(session)
    setEditName(session.name)
    setEditStartTime(new Date(session.created_at).toISOString().slice(0, 16))
    setEditEndTime(session.ended_at ? new Date(session.ended_at).toISOString().slice(0, 16) : '')
    setShowEditDialog(true)
  }

  const handleDeleteSession = (session: WorkSession) => {
    setSelectedSession(session)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (selectedSession && onDeleteSession) {
      onDeleteSession(selectedSession)
      setShowDeleteDialog(false)
      setSelectedSession(null)
    }
  }

  const handleUpdateSession = () => {
    if (selectedSession && onEditSession) {
      onEditSession({
        ...selectedSession,
        name: editName,
        created_at: editStartTime,
        ended_at: editEndTime || null,
        duration: editEndTime
          ? Math.floor((new Date(editEndTime).getTime() - new Date(editStartTime).getTime()) / 1000)
          : selectedSession.duration
      })
      setShowEditDialog(false)
      setSelectedSession(null)
    }
  }

  const bgColor = project.created_by === currentUser?.id ? "bg-primary" : "bg-secondary"

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative p-4 rounded-xl bg-card hover:bg-accent/5 transition-all cursor-pointer overflow-hidden border shadow-sm hover:shadow-md",
          bgColor + "/5",
          project.created_by === currentUser?.id && "pl-6"
        )}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-medium text-lg text-foreground">{project.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || 'Ready to continue your progress? Start a new session!'}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNewSession()
            }}
            className={cn(
              "shrink-0 px-4 py-2.5 rounded-lg transition-colors font-medium",
              bgColor === "bg-primary" ? "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95" : "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/95"
            )}
          >
            New Session
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pl-6 space-y-3">
          <SessionHistory
            sessions={project.sessions}
            currentUser={currentUser}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      )}

      {/* Edit Session Dialog */}
      <EditSessionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        session={selectedSession}
        editName={editName}
        setEditName={setEditName}
        editStartTime={editStartTime}
        setEditStartTime={setEditStartTime}
        editEndTime={editEndTime}
        setEditEndTime={setEditEndTime}
        updateSession={handleUpdateSession}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSession?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
