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
  const supabase = createClient()

  // Load active session from localStorage on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('activeSessionId')
    if (storedSessionId) {
      loadActiveSession(parseInt(storedSessionId))
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

    const { data, error } = await supabase
      .from('work_sessions')
      .insert([
        {
          project_id: selectedProjectId,
          name: sessionName.trim(),
          category: 'work',
          duration: 0,
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

  const toggleProject = (projectId: number) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId)
  }

  const openStartSessionDialog = (projectId: number) => {
    initiateSession(projectId)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
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
      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border rounded-lg overflow-hidden"
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleProject(project.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{project.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openStartSessionDialog(project.id);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Start Session
                </button>
              </div>
              <p className="mt-2 text-gray-600">{project.description}</p>
            </div>

            <div className={expandedProjectId === project.id ? styles.expandSection : styles.collapseSection}>
              <div className="border-t p-6 space-y-4">
                <h4 className="text-lg font-semibold">Recent Sessions</h4>
                {projectSessions[project.id]?.length > 0 ? (
                  <div className="space-y-2">
                    {projectSessions[project.id].map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 bg-gray-50 rounded ${styles.fadeIn}`}
                      >
                        <p className="font-medium">{session.name}</p>
                        <p className="text-sm text-gray-600">
                          Duration: {formatTime(session.duration)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No sessions yet</p>
                )}
              </div>
            </div>
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
            <div className="space-y-2">
              <label htmlFor="session-name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Session Name
              </label>
              <input
                id="session-name"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="What are you working on?"
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={startSession}
              disabled={!sessionName.trim()}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Start
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
