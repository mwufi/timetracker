'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '@/components/nav-bar'
import { ActiveSession } from '@/components/active-session'
import { NewSessionDialog } from '@/components/new-session-dialog'
import { EditSessionDialog } from '@/components/edit-session-dialog'
import { SignInDialog } from '@/components/sign-in-dialog'
import { ProjectList } from '@/components/project-list'
import { formatExactDuration } from '@/lib/utils'
import { Globe } from 'lucide-react'
import type { Project, WorkSession, User } from '@/lib/types'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from '@/lib/utils'
import { useToast } from "@/hooks/use-toast"
import { BottomNav } from '@/components/bottom-nav'
import { createClient } from '@/utils/supabase/client'
import { createBackend } from '@/lib/backend'

export default function Home() {
  // State for projects with their sessions included
  const [projects, setProjects] = useState<(Project & { sessions: WorkSession[] })[]>([])
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null)
  const [activeSessions, setActiveSessions] = useState<WorkSession[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showUniverseMode, setShowUniverseMode] = useState(false)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [customStartTime, setCustomStartTime] = useState<string>('')
  const [customEndTime, setCustomEndTime] = useState<string>('')
  const [editingSession, setEditingSession] = useState<WorkSession | null>(null)
  const [editName, setEditName] = useState('')
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')
  const { toast } = useToast()

  const supabase = createClient()
  const backend = createBackend()

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        // Get all projects with their recent sessions in a single query
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            sessions:work_sessions(
              *,
              created_by,
              project_id
            )
          `)
          .order('created_at', { ascending: false })

        if (projectsError) throw projectsError

        // Sort sessions by date and limit to most recent
        const projectsWithSessions = projectsData.map(project => ({
          ...project,
          sessions: (project.sessions as WorkSession[])
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        }))

        setProjects(projectsWithSessions)

        // Get active sessions
        const { data: activeSessions, error: activeError } = await supabase
          .from('work_sessions')
          .select('*')
          .is('ended_at', null)
          .order('created_at', { ascending: false })

        if (activeError) throw activeError
        setActiveSessions(activeSessions)
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Please try refreshing the page"
        })
      }
    }

    loadInitialData()
  }, [])

  // Subscribe to session updates
  useEffect(() => {
    const channel = supabase
      .channel('work_sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'work_sessions'
      }, payload => {
        const session = payload.new as WorkSession

        if (payload.eventType === 'INSERT') {
          // Only add if not already in activeSessions
          setActiveSessions(prev => {
            if (prev.some(s => s.id === session.id)) return prev
            return [session, ...prev]
          })
          // Update project sessions
          setProjects(prev => prev.map(project => 
            project.id === session.project_id
              ? {
                  ...project,
                  sessions: [session, ...project.sessions.filter(s => s.id !== session.id).slice(0, 4)]
                }
              : project
          ))
        } else if (payload.eventType === 'UPDATE') {
          setActiveSessions(prev => {
            // If session is ended, remove it from active sessions
            if (session.ended_at) {
              return prev.filter(s => s.id !== session.id)
            }
            // Otherwise update it
            return prev.map(s => s.id === session.id ? session : s)
          })
          // Update project sessions
          setProjects(prev => prev.map(project => 
            project.id === session.project_id
              ? {
                  ...project,
                  sessions: project.sessions.map(s => s.id === session.id ? session : s)
                }
              : project
          ))
        } else if (payload.eventType === 'DELETE') {
          setActiveSessions(prev => prev.filter(s => s.id !== session.id))
          // Update project sessions
          setProjects(prev => prev.map(project => 
            project.id === session.project_id
              ? {
                  ...project,
                  sessions: project.sessions.filter(s => s.id !== session.id)
                }
              : project
          ))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const toggleProject = (id: number) => {
    setExpandedProjectId(prev => prev === id ? null : id)
  }

  const handleNewSession = (projectId: number) => {
    if (!currentUser) {
      setIsSignInDialogOpen(true)
      return
    }

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

  const initiateSession = async (projectId: number) => {
    setSelectedProjectId(projectId)
    setSessionName('')
    setIsDialogOpen(true)
  }

  const startSession = async () => {
    if (!selectedProjectId || !sessionName.trim()) return

    try {
      const startTime = customStartTime 
        ? new Date(customStartTime).toISOString()
        : new Date().toISOString()
      const endTime = customEndTime
        ? new Date(customEndTime).toISOString()
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
        setProjects(prev => prev.map(project => 
          project.id === selectedProjectId
            ? { ...project, sessions: sessions }
            : project
        ))
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
      setProjects(prev => prev.map(project => 
        project.id === session.project_id
          ? { ...project, sessions: sessions }
          : project
      ))
    }
  }

  const updateSession = async () => {
    if (!editingSession) return

    const startTime = new Date(editStartTime).toISOString()
    const endTime = editEndTime ? new Date(editEndTime).toISOString() : null
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
      setProjects(prev => prev.map(project => 
        project.id === editingSession.project_id
          ? { ...project, sessions: sessions }
          : project
      ))
    }
  }

  const openEditDialog = (session: WorkSession) => {
    setEditingSession(session)
    setEditName(session.name)
    setEditStartTime(session.created_at)
    setEditEndTime(session.ended_at || '')
    setIsEditDialogOpen(true)
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
        <ProjectList
          projects={projects}
          currentUser={currentUser}
          expandedProjectId={expandedProjectId}
          onToggleProject={toggleProject}
          onNewSession={handleNewSession}
        />

        {/* Dialogs */}
        <NewSessionDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          sessionName={sessionName}
          setSessionName={setSessionName}
          customStartTime={customStartTime}
          setCustomStartTime={setCustomStartTime}
          customEndTime={customEndTime}
          setCustomEndTime={setCustomEndTime}
          startSession={startSession}
        />
        <EditSessionDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          session={editingSession}
          editName={editName}
          setEditName={setEditName}
          editStartTime={editStartTime}
          setEditStartTime={setEditStartTime}
          editEndTime={editEndTime}
          setEditEndTime={setEditEndTime}
          updateSession={updateSession}
        />
        <SignInDialog 
          open={isSignInDialogOpen} 
          onOpenChange={setIsSignInDialogOpen} 
        />
      </div>
      <BottomNav />
    </div>
  )
}
