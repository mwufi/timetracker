'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface NewSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionName: string
  setSessionName: (name: string) => void
  customStartTime: string
  setCustomStartTime: (time: string) => void
  customEndTime: string
  setCustomEndTime: (time: string) => void
  startSession: () => void
}

export function NewSessionDialog({
  open,
  onOpenChange,
  sessionName,
  setSessionName,
  customStartTime,
  setCustomStartTime,
  customEndTime,
  setCustomEndTime,
  startSession,
}: NewSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Session name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
          <div className="grid gap-2">
            <label>Custom Start Time (optional)</label>
            <Input
              type="datetime-local"
              value={customStartTime}
              onChange={(e) => setCustomStartTime(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label>Custom End Time (optional)</label>
            <Input
              type="datetime-local"
              value={customEndTime}
              onChange={(e) => setCustomEndTime(e.target.value)}
            />
          </div>
          <button
            onClick={startSession}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md"
          >
            Start Session
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
