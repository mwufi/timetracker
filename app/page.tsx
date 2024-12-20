"use client";

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NavBar } from "@/components/nav-bar"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { SessionList } from "@/components/session-list"
import { SignInDialog } from "@/components/sign-in-dialog"
import { ActiveSession } from "@/components/active-session"
import { formatDuration, formatExactDuration, toLocalISOString, fromLocalISOString } from "@/lib/utils"
import { createBackend } from '@/lib/backend'
import type { Project, WorkSession } from '@/lib/types'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null)
  const [projectSessions, setProjectSessions] = useState<Record<number, WorkSession[]>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [customStartTime, setCustomStartTime] = useState<string>('')
  const [customEndTime, setCustomEndTime] = useState<string>('')
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null)
  const [showUniverseMode, setShowUniverseMode] = useState(false)

  // For editing sessions
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<WorkSession | null>(null)
  const [editName, setEditName] = useState('')
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')

  const supabase = createClient()
  const backend = createBackend()

  useEffect(() => {
    const loadProjects = async () => {
      const projects = await backend.getProjects(showUniverseMode)
      setProjects(projects)
    }
    loadProjects()

    // Also refresh active session and project sessions when universe mode changes
    const loadActiveSession = async () => {
      const session = await backend.getActiveSession(showUniverseMode)
      setActiveSession(session)
    }
    loadActiveSession()

    if (expandedProjectId) {
      const loadSessions = async () => {
        const sessions = await backend.getSessions(expandedProjectId, showUniverseMode)
        setProjectSessions(prev => ({
          ...prev,
          [expandedProjectId]: sessions
        }))
      }
      loadSessions()
    }
  }, [showUniverseMode, expandedProjectId])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setup = async () => {
      unsubscribe = await backend.subscribeToActiveSessions((session) => {
        setActiveSession(session)
      }, showUniverseMode)
    }

    setup().catch(console.error)

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [showUniverseMode])

  useEffect(() => {
    const savedExpandedId = localStorage.getItem('expandedProjectId')
    if (savedExpandedId) {
      setExpandedProjectId(parseInt(savedExpandedId))
    }
  }, [])

  const startSession = async () => {
    if (!selectedProjectId || !sessionName.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsSignInDialogOpen(true)
      return
    }

    try {
      const startTime = customStartTime 
        ? fromLocalISOString(customStartTime)
        : new Date().toISOString()
      
      const endTime = customEndTime 
        ? fromLocalISOString(customEndTime)
        : null

      const duration = endTime 
        ? Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
        : 0

      const session = await backend.createSession({
        project_id: selectedProjectId,
        name: sessionName.trim(),
        category: 'work',
        duration: duration,
        created_at: startTime,
        ended_at: endTime,
        created_by: user.id
      }, showUniverseMode)

      if (!endTime) {
        await backend.setActiveSession(session.id, showUniverseMode)
        setActiveSession(session)
      }

      setIsDialogOpen(false)
      setSessionName('')
      setCustomStartTime('')
      setCustomEndTime('')

      // Refresh sessions if the project is expanded
      if (expandedProjectId === selectedProjectId) {
        const sessions = await backend.getSessions(selectedProjectId, showUniverseMode)
        setProjectSessions(prev => ({
          ...prev,
          [selectedProjectId]: sessions
        }))
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Must be logged in to create a session') {
        setIsSignInDialogOpen(true)
      } else {
        console.error('Error creating session:', error)
      }
    }
  }

  const endSession = async () => {
    if (!activeSession) return

    const endTime = new Date().toISOString()
    const duration = Math.floor((new Date(endTime).getTime() - new Date(activeSession.created_at).getTime()) / 1000)

    await backend.updateSession(activeSession.id, {
      ended_at: endTime,
      duration: duration
    }, showUniverseMode)
    await backend.setActiveSession(null, showUniverseMode)
    
    setActiveSession(null)

    // Refresh sessions if the project is expanded
    if (expandedProjectId === activeSession.project_id) {
      const sessions = await backend.getSessions(activeSession.project_id, showUniverseMode)
      setProjectSessions(prev => ({
        ...prev,
        [activeSession.project_id]: sessions
      }))
    }
  }

  const updateSession = async () => {
    if (!editingSession) return

    const startTime = fromLocalISOString(editStartTime)
    const endTime = editEndTime ? fromLocalISOString(editEndTime) : null
    const duration = endTime 
      ? Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
      : 0

    await backend.updateSession(editingSession.id, {
      name: editName.trim(),
      created_at: startTime,
      ended_at: endTime,
      duration: duration
    }, showUniverseMode)

    setIsEditDialogOpen(false)
    
    // Refresh sessions if the project is expanded
    if (expandedProjectId === editingSession.project_id) {
      const sessions = await backend.getSessions(editingSession.project_id, showUniverseMode)
      setProjectSessions(prev => ({
        ...prev,
        [editingSession.project_id]: sessions
      }))
    }
  }

  const initiateSession = async (projectId: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setIsSignInDialogOpen(true)
      return
    }

    if (activeSession) {
      alert('Please end the current session before starting a new one')
      return
    }

    setSelectedProjectId(projectId)
    setSessionName('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (session: WorkSession) => {
    setEditingSession(session)
    setEditName(session.name)
    setEditStartTime(toLocalISOString(new Date(session.created_at)))
    setEditEndTime(session.ended_at ? toLocalISOString(new Date(session.ended_at)) : '')
    setIsEditDialogOpen(true)
  }

  const toggleProject = (projectId: number) => {
    const newExpandedId = expandedProjectId === projectId ? null : projectId
    setExpandedProjectId(newExpandedId)
    if (newExpandedId) {
      localStorage.setItem('expandedProjectId', newExpandedId.toString())
    } else {
      localStorage.removeItem('expandedProjectId')
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <NavBar />
      
      {/* Active Session Display */}
      {activeSession && (
        <ActiveSession
          session={activeSession}
          onEnd={endSession}
          onUpdate={async (updates) => {
            const updatedSession = await backend.updateSession(activeSession.id, updates, showUniverseMode)
            setActiveSession(updatedSession)
          }}
          variant="full"
        />
      )}

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Projects</h1>
          <div className="flex items-center space-x-2">
            <Switch
              id="universe-mode"
              checked={showUniverseMode}
              onCheckedChange={setShowUniverseMode}
            />
            <Label htmlFor="universe-mode">Universe Mode</Label>
          </div>
        </div>
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary/20">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => toggleProject(project.id)}
            >
              <div>
                <h2 className="text-xl font-semibold">{project.name}</h2>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    initiateSession(project.id)
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm"
                >
                  Start Session
                </button>
              </div>
            </div>

            {/* Sessions List */}
            {expandedProjectId === project.id && (
              <div className="border-t p-6">
                <SessionList
                  sessions={projectSessions[project.id] || []}
                  onEditSession={openEditDialog}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Start Session Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
            {editingSession && (
              <div className="space-y-2">
                <label>Duration</label>
                <Slider
                  defaultValue={[editingSession.duration]}
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
                  Duration: {formatDuration(editingSession.duration * 1000)}
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

      <SignInDialog 
        open={isSignInDialogOpen} 
        onOpenChange={setIsSignInDialogOpen} 
      />
    </div>
  )
}
