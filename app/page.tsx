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
import styles from './page.module.css'

interface Project {
  id: number
  name: string
  description: string
  header_img: string
}

interface WorkSession {
  id: number
  project_id: number
  name: string
  category: string
  duration: number
  created_at: string
  ended_at: string | null
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null)
  const [projectSessions, setProjectSessions] = useState<Record<number, WorkSession[]>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [customStartTime, setCustomStartTime] = useState<string>('')
  const [customEndTime, setCustomEndTime] = useState<string>('')
  const [editingSession, setEditingSession] = useState<WorkSession | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')
  const [editName, setEditName] = useState('')
  const supabase = createClient()

  // Load active session from localStorage on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('activeSessionId')
    if (storedSessionId) {
      loadActiveSession(parseInt(storedSessionId))
    }
  }, [])

  // Load expanded project state from localStorage
  useEffect(() => {
    const savedExpandedId = localStorage.getItem('expandedProjectId')
    if (savedExpandedId) {
      setExpandedProjectId(parseInt(savedExpandedId))
    }
  }, [])

  // Timer effect for active session
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeSession && !activeSession.ended_at) {
      interval = setInterval(() => {
        const startTime = new Date(activeSession.created_at).getTime()
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeSession])

  // Load projects
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
      } else {
        setProjects(data || [])
      }
    }

    fetchProjects()
  }, [])

  // Load sessions for expanded project
  useEffect(() => {
    const fetchProjectSessions = async (projectId: number) => {
      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching sessions:', error)
      } else {
        setProjectSessions(prev => ({
          ...prev,
          [projectId]: data || []
        }))
      }
    }

    if (expandedProjectId) {
      fetchProjectSessions(expandedProjectId)
    }
  }, [expandedProjectId])

  const loadActiveSession = async (sessionId: number) => {
    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error('Error loading active session:', error)
      localStorage.removeItem('activeSessionId')
    } else if (data && !data.ended_at) {
      setActiveSession(data)
    }
  }

  const initiateSession = (projectId: number) => {
    if (activeSession) {
      alert('Please end the current session before starting a new one')
      return
    }
    setSelectedProjectId(projectId)
    setSessionName('')
    setIsDialogOpen(true)
  }

  const startSession = async () => {
    if (!selectedProjectId || !sessionName.trim()) return

    const startTime = customStartTime 
      ? new Date(customStartTime).toISOString()
      : new Date().toISOString()
    
    const endTime = customEndTime 
      ? new Date(customEndTime).toISOString()
      : null

    const duration = endTime 
      ? Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
      : 0

    const { data, error } = await supabase
      .from('work_sessions')
      .insert([
        {
          project_id: selectedProjectId,
          name: sessionName.trim(),
          category: 'work',
          duration: duration,
          created_at: startTime,
          ended_at: endTime,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error starting session:', error)
    } else {
      setActiveSession(data)
      localStorage.setItem('activeSessionId', data.id.toString())
      setElapsedTime(0)
      setIsDialogOpen(false)

      // Refresh sessions if the project is expanded
      if (expandedProjectId === selectedProjectId) {
        const { data: sessions } = await supabase
          .from('work_sessions')
          .select('*')
          .eq('project_id', selectedProjectId)
          .order('created_at', { ascending: false })
          .limit(5)

        if (sessions) {
          setProjectSessions(prev => ({
            ...prev,
            [selectedProjectId]: sessions
          }))
        }
      }
    }
  }

  const endSession = async () => {
    if (!activeSession) return

    console.log('Ending session:', activeSession)

    const now = new Date()
    const startTime = new Date(activeSession.created_at)
    const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000)

    const { error } = await supabase
      .from('work_sessions')
      .update({
        ended_at: now.toISOString(),
        duration: duration
      })
      .eq('id', activeSession.id)

    if (error) {
      console.error('Error ending session:', error)
    } else {
      console.log('Session ended successfully')
      setActiveSession(null)
      localStorage.removeItem('activeSessionId')
      setElapsedTime(0)

      // Refresh sessions if the project is expanded
      if (expandedProjectId === activeSession.project_id) {
        const { data: sessions } = await supabase
          .from('work_sessions')
          .select('*')
          .eq('project_id', activeSession.project_id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (sessions) {
          setProjectSessions(prev => ({
            ...prev,
            [activeSession.project_id]: sessions
          }))
        }
      }
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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

  const openStartSessionDialog = (projectId: number) => {
    initiateSession(projectId)
  }

  const updateSessionDuration = async (session: WorkSession, newDuration: number) => {
    const startTime = new Date(session.created_at)
    const newEndTime = new Date(startTime.getTime() + newDuration * 1000)

    const { error } = await supabase
      .from('work_sessions')
      .update({
        ended_at: newEndTime.toISOString(),
        duration: newDuration
      })
      .eq('id', session.id)

    if (error) {
      console.error('Error updating session:', error)
    } else {
      // Refresh sessions
      if (expandedProjectId === session.project_id) {
        const { data: sessions } = await supabase
          .from('work_sessions')
          .select('*')
          .eq('project_id', session.project_id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (sessions) {
          setProjectSessions(prev => ({
            ...prev,
            [session.project_id]: sessions
          }))
        }
      }
    }
  }

  const openEditDialog = (session: WorkSession) => {
    setEditingSession(session)
    setEditName(session.name)
    setEditStartTime(session.created_at.slice(0, 16)) // Format for datetime-local input
    setEditEndTime(session.ended_at?.slice(0, 16) || '')
    setIsEditDialogOpen(true)
  }

  const updateSession = async () => {
    if (!editingSession) return

    const startTime = new Date(editStartTime).toISOString()
    const endTime = editEndTime ? new Date(editEndTime).toISOString() : null
    const duration = endTime 
      ? Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
      : 0

    const { error } = await supabase
      .from('work_sessions')
      .update({
        name: editName.trim(),
        created_at: startTime,
        ended_at: endTime,
        duration: duration
      })
      .eq('id', editingSession.id)

    if (error) {
      console.error('Error updating session:', error)
    } else {
      setIsEditDialogOpen(false)
      // Refresh sessions if the project is expanded
      if (expandedProjectId === editingSession.project_id) {
        const { data: sessions } = await supabase
          .from('work_sessions')
          .select('*')
          .eq('project_id', editingSession.project_id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (sessions) {
          setProjectSessions(prev => ({
            ...prev,
            [editingSession.project_id]: sessions
          }))
        }
      }
      // Update active session if we're editing it
      if (activeSession?.id === editingSession.id) {
        loadActiveSession(editingSession.id)
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <NavBar />
      {/* Active Session Display */}
      {activeSession && (
        <div className={`mb-8 p-4 border rounded-lg shadow-sm ${styles.activeSession}`}>
          <h3 className="text-lg font-semibold mb-2">Current Session</h3>
          <p>{activeSession.name}</p>
          <p>Time: {formatTime(elapsedTime)}</p>
          <button
            onClick={endSession}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            End Session
          </button>
        </div>
      )}

      {/* Projects List */}
      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg p-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleProject(project.id)}
            >
              <div>
                <h2 className="text-xl font-semibold">{project.name}</h2>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  initiateSession(project.id)
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 py-2 rounded-md text-sm"
              >
                Start Session
              </button>
            </div>

            {/* Only show sessions when expanded */}
            {expandedProjectId === project.id && projectSessions[project.id]?.map((session) => (
              <div key={session.id} className="bg-card p-4 rounded-lg mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{session.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.created_at).toLocaleString()}
                      {session.ended_at && (
                        <> • {formatDuration(session.duration * 1000)}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session.ended_at && (
                      <button
                        onClick={() => openEditDialog(session)}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-8 px-3 py-2 rounded-md text-sm"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Session Name Dialog */}
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

    </div>
  )
}
