'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { formatDuration } from "@/lib/utils"
import type { WorkSession } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef } from "react"

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
  const [durationMinutes, setDurationMinutes] = useState(0)
  const maxDuration = useRef(0)

  // Helper to create Date object in local timezone
  const parseLocalDateTime = (dateTimeStr: string) => {
    const [date, time] = dateTimeStr.split('T')
    const [year, month, day] = date.split('-').map(Number)
    const [hours, minutes] = time.split(':').map(Number)
    return new Date(year, month - 1, day, hours, minutes)
  }

  // Set initial max duration when dialog opens or times change
  useEffect(() => {
    if (open && editStartTime && editEndTime) {
      const start = parseLocalDateTime(editStartTime)
      const end = parseLocalDateTime(editEndTime)
      const initialDuration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
      maxDuration.current = initialDuration + 30 // Initial duration + 30 minutes
      setDurationMinutes(initialDuration)
    }
  }, [open, editStartTime, editEndTime])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSession()
  }

  const handleSliderChange = (minutes: number) => {
    setDurationMinutes(minutes)
    const startTime = parseLocalDateTime(editStartTime)
    const newEndTime = new Date(startTime.getTime() + minutes * 60 * 1000)
    
    // Format to local datetime string
    const pad = (n: number) => n.toString().padStart(2, '0')
    const newEndTimeStr = `${newEndTime.getFullYear()}-${pad(newEndTime.getMonth() + 1)}-${pad(newEndTime.getDate())}T${pad(newEndTime.getHours())}:${pad(newEndTime.getMinutes())}`
    
    setEditEndTime(newEndTimeStr)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name">Session Name</label>
              <Input
                id="name"
                placeholder="Session name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="startTime">Start Time</label>
              <Input
                id="startTime"
                type="datetime-local"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="endTime">End Time</label>
              <Input
                id="endTime"
                type="datetime-local"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
              />
            </div>
            {session && editStartTime && editEndTime && (
              <div className="space-y-2">
                <label>Duration</label>
                <div className="text-xs text-muted-foreground mb-2">
                  Duration: {formatDuration(durationMinutes * 60 * 1000)}
                </div>
                <Slider
                  value={[durationMinutes]}
                  min={0}
                  max={maxDuration.current}
                  step={1} // 1 minute steps
                  onValueChange={([value]) => handleSliderChange(value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
