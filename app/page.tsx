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
import { NavBar } from '@/components/nav-bar'
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { SessionList } from "@/components/session-list"
import { SignInDialog } from "@/components/sign-in-dialog"
import { ActiveSession } from "@/components/active-session"
import { formatDuration, formatExactDuration, toLocalISOString, fromLocalISOString } from "@/lib/utils"
import { createBackend } from '@/lib/backend'
import type { Project, WorkSession, User } from '@/lib/types'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from '@/lib/utils'
import { Globe } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { BottomNav } from '@/components/bottom-nav'

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectSessions, setProjectSessions] = useState<Record<number, WorkSession[]>>({})
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null)
  const [activeSessions, setActiveSessions] = useState<WorkSession[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [customStartTime, setCustomStartTime] = useState<string>('')
  const [customEndTime, setCustomEndTime] = useState<string>('')
  const [showUniverseMode, setShowUniverseMode] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // For editing sessions
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<WorkSession | null>(null)
  const [editName, setEditName] = useState('')
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')

  const supabase = createClient()
  const backend = createBackend()
  const { toast } = useToast()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    loadUser()
  }, [])

  useEffect(() => {
    const loadProjects = async () => {
      const projects = await backend.getProjects(showUniverseMode)
      setProjects(projects)
    }
    loadProjects()

    // Also refresh active session and project sessions when universe mode changes
    const loadActiveSessions = async () => {
      const sessions = await backend.getActiveSession(showUniverseMode)
      setActiveSessions(sessions)
    }
    loadActiveSessions()

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
      unsubscribe = await backend.subscribeToActiveSessions((sessions) => {
        setActiveSessions(sessions)
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

    if (!currentUser) {
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
        duration,
        created_at: startTime,
        ended_at: endTime,
        created_by: currentUser.id
      }, showUniverseMode)

      if (!endTime) {
        setActiveSessions(prev => [...prev, session])
      }

      setSessionName('')
      setCustomStartTime('')
      setCustomEndTime('')
      setIsDialogOpen(false)

      // Refresh sessions if the project is expanded
      if (expandedProjectId === selectedProjectId) {
        const sessions = await backend.getSessions(selectedProjectId, showUniverseMode)
        setProjectSessions(prev => ({
          ...prev,
          [selectedProjectId]: sessions
        }))
      }
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const endSession = async (session: WorkSession) => {
    const endTime = new Date().toISOString()
    const duration = Math.floor((new Date(endTime).getTime() - new Date(session.created_at).getTime()) / 1000)

    await backend.updateSession(session.id, {
      ended_at: endTime,
      duration: duration
    }, showUniverseMode)
    
    setActiveSessions(prev => prev.filter(s => s.id !== session.id))

    // Refresh sessions if the project is expanded
    if (expandedProjectId === session.project_id) {
      const sessions = await backend.getSessions(session.project_id, showUniverseMode)
      setProjectSessions(prev => ({
        ...prev,
        [session.project_id]: sessions
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
    if (!currentUser) {
      setIsSignInDialogOpen(true)
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

  const handleNewSession = (projectId: number) => {
    if (activeSessions.some(s => s.created_by === currentUser?.id)) {
      toast({
        variant: "destructive",
        title: "Cannot start new session",
        description: "You already have an active session!"
      })
      return
    }
    initiateSession(projectId)
  }

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      <div className="container max-w-5xl mx-auto px-4 py-6 space-y-8">
        <NavBar />
        
        {/* Active Sessions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold">Your Active Session</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="universe-mode"
                checked={showUniverseMode}
                onCheckedChange={setShowUniverseMode}
              />
              <Label htmlFor="universe-mode" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Universe Mode</span>
              </Label>
            </div>
          </div>

          {activeSessions.filter(s => s.created_by === currentUser?.id).length > 0 && (
            <div className="space-y-4">
              {activeSessions
                .filter(s => s.created_by === currentUser?.id)
                .map(session => (
                  <ActiveSession
                    key={session.id}
                    session={session}
                    onEnd={() => endSession(session)}
                    onUpdate={async (updates) => {
                      const updatedSession = await backend.updateSession(session.id, updates, showUniverseMode)
                      setActiveSessions(prev => prev.map(s => 
                        s.id === updatedSession.id ? updatedSession : s
                      ))
                    }}
                    variant="full"
                  />
                ))}
            </div>
          )}

          {/* Other Active Sessions (Universe Mode) */}
          {showUniverseMode && activeSessions.filter(s => s.created_by !== currentUser?.id).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Active Sessions Around the Universe</h2>
              {activeSessions
                .filter(s => s.created_by !== currentUser?.id)
                .map(session => (
                  <ActiveSession
                    key={session.id}
                    session={session}
                    variant="universe"
                  />
                ))}
            </div>
          )}
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Projects</h2>
          </div>
          <div className="grid gap-4 sm:gap-6">
            {projects.map(project => (
              <div key={project.id} className="space-y-4">
                <div 
                  className={cn(
                    "p-4 rounded-lg bg-card hover:bg-card/80 transition-colors cursor-pointer relative overflow-hidden",
                    project.created_by === currentUser?.id && "pl-6"
                  )}
                  onClick={() => toggleProject(project.id)}
                >
                  {project.created_by === currentUser?.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
                  )}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNewSession(project.id)
                      }}
                      className="shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      New Session
                    </button>
                  </div>
                </div>
                {expandedProjectId === project.id && (
                  <div className="pl-6 space-y-3">
                    <h4 className="text-sm font-medium">Recent Sessions</h4>
                    <div className="grid gap-2">
                      {projectSessions[project.id]?.map(session => (
                        <div 
                          key={session.id}
                          className="p-3 rounded-md bg-muted/50 flex items-center justify-between flex-wrap gap-2"
                        >
                          <div>
                            <p className="font-medium">{session.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-lg font-mono">
                            {formatExactDuration(session.duration)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
      <BottomNav />
    </div>
  )
}
