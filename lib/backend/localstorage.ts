import type { Backend, Project, WorkSession } from './types'

export class LocalStorageBackend implements Backend {
  private getItem<T>(key: string): T[] {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : []
  }

  private setItem<T>(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  async getProjects(): Promise<Project[]> {
    return this.getItem<Project>('projects')
  }

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const projects = this.getItem<Project>('projects')
    const newProject = {
      ...project,
      id: Date.now()
    }
    projects.push(newProject)
    this.setItem('projects', projects)
    return newProject
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const projects = this.getItem<Project>('projects')
    const index = projects.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Project not found')

    const updatedProject = { ...projects[index], ...project }
    projects[index] = updatedProject
    this.setItem('projects', projects)
    return updatedProject
  }

  async deleteProject(id: number): Promise<void> {
    const projects = this.getItem<Project>('projects')
    const filtered = projects.filter(p => p.id !== id)
    this.setItem('projects', filtered)
  }

  async getSessions(projectId: number): Promise<WorkSession[]> {
    return this.getItem<WorkSession>(`sessions_${projectId}`)
  }

  async createSession(session: Omit<WorkSession, 'id'>): Promise<WorkSession> {
    const sessions = this.getItem<WorkSession>(`sessions_${session.project_id}`)
    const newSession = {
      ...session,
      id: Date.now()
    }
    sessions.push(newSession)
    this.setItem(`sessions_${session.project_id}`, sessions)
    return newSession
  }

  async updateSession(id: number, sessionUpdate: Partial<WorkSession>): Promise<WorkSession> {
    // First, find which project this session belongs to
    const projects = await this.getProjects()
    let session: WorkSession | null = null
    let projectId: number | null = null

    for (const project of projects) {
      const sessions = await this.getSessions(project.id)
      const found = sessions.find(s => s.id === id)
      if (found) {
        session = found
        projectId = project.id
        break
      }
    }

    if (!session || !projectId) throw new Error('Session not found')

    const sessions = this.getItem<WorkSession>(`sessions_${projectId}`)
    const index = sessions.findIndex(s => s.id === id)
    const updatedSession = { ...session, ...sessionUpdate }
    sessions[index] = updatedSession
    this.setItem(`sessions_${projectId}`, sessions)
    return updatedSession
  }

  async deleteSession(id: number): Promise<void> {
    const projects = await this.getProjects()
    for (const project of projects) {
      const sessions = this.getItem<WorkSession>(`sessions_${project.id}`)
      const filtered = sessions.filter(s => s.id !== id)
      if (filtered.length !== sessions.length) {
        this.setItem(`sessions_${project.id}`, filtered)
        break
      }
    }
  }

  async getActiveSession(): Promise<WorkSession | null> {
    const activeSessionId = localStorage.getItem('activeSessionId')
    if (!activeSessionId) return null

    const id = parseInt(activeSessionId)
    const projects = await this.getProjects()
    
    for (const project of projects) {
      const sessions = await this.getSessions(project.id)
      const session = sessions.find(s => s.id === id)
      if (session) return session
    }

    return null
  }

  async setActiveSession(sessionId: number | null): Promise<void> {
    if (sessionId) {
      localStorage.setItem('activeSessionId', sessionId.toString())
    } else {
      localStorage.removeItem('activeSessionId')
    }
  }
}
