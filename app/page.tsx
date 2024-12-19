"use client";

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Active Session Timer */}
      <AnimatePresence>
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-white p-6 rounded-lg shadow-lg border-2 border-indigo-500"
          >
            <div className="text-sm text-gray-600 mb-1">{activeSession.name}</div>
            <div className="text-2xl font-mono mb-2">{formatTime(elapsedTime)}</div>
            <button
              onClick={endSession}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              End Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layout
            className="border rounded-lg overflow-hidden shadow-lg"
          >
            <motion.div
              className="p-6 cursor-pointer"
              onClick={() => setExpandedProjectId(expandedProjectId === project.id ? null : project.id)}
            >
              <div className="flex items-start space-x-6">
                {project.header_img && (
                  <div className="relative w-48 h-32 flex-shrink-0">
                    <Image
                      src={project.header_img}
                      alt={project.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      initiateSession(project.id)
                    }}
                    disabled={!!activeSession}
                    className={`py-2 px-4 rounded-md ${activeSession
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                  >
                    Start Session
                  </button>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {expandedProjectId === project.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    opacity: { duration: 0.2 }
                  }}
                  style={{ overflow: 'hidden' }}
                  className="space-y-4"
                >
                  <div className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Recent Sessions</h4>
                    <div className="space-y-4">
                      {projectSessions[project.id]?.map((session) => (
                        <div key={session.id} className="bg-white p-4 rounded-lg shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{session.name}</div>
                              <div className="text-sm text-gray-500">
                                {formatDate(session.created_at)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono">
                                {formatTime(session.duration || 0)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {session.ended_at ? 'Completed' : 'In Progress'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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
