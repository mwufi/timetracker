'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { formatDuration } from "@/lib/utils"
import type { WorkSession } from "@/lib/types"

interface EditSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: WorkSession | null
  editName: string
  setEditName: (name: string) => void
  editStartTime: string
  setEditStartTime: (time: string) => void
  editEndTime: string
  setEditEndTime: (time: string) => void
  updateSession: () => void
}

export function EditSessionDialog({
  open,
  onOpenChange,
  session,
  editName,
  setEditName,
  editStartTime,
  setEditStartTime,
  editEndTime,
  setEditEndTime,
  updateSession,
}: EditSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Session name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div className="grid gap-2">
            <label>Start Time</label>
            <Input
              type="datetime-local"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label>End Time</label>
            <Input
              type="datetime-local"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
            />
          </div>
          {session && (
            <div className="space-y-2">
              <label>Duration</label>
              <Slider
                defaultValue={[session.duration]}
                max={24 * 60 * 60} // 24 hours in seconds
                step={60} // 1 minute
                onValueChange={([value]) => {
                  // Update end time based on slider
                  const startTime = new Date(editStartTime)
                  const newEndTime = new Date(startTime.getTime() + value * 1000)
                  setEditEndTime(newEndTime.toISOString().slice(0, 16))
                }}
              />
              <div className="text-sm text-muted-foreground">
                Duration: {formatDuration(session.duration * 1000)}
              </div>
            </div>
          )}
          <button
            onClick={updateSession}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md"
          >
            Update Session
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
