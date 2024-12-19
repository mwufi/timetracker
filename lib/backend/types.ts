export interface Project {
  id: number
  name: string
  description: string
  header_img: string
}

export interface WorkSession {
  id: number
  project_id: number
  name: string
  category: string
  duration: number
  created_at: string
  ended_at: string | null
}

export interface Backend {
  // Project operations
  getProjects(): Promise<Project[]>
  createProject(project: Omit<Project, 'id'>): Promise<Project>
  updateProject(id: number, project: Partial<Project>): Promise<Project>
  deleteProject(id: number): Promise<void>

  // Session operations
  getSessions(projectId: number): Promise<WorkSession[]>
  createSession(session: Omit<WorkSession, 'id'>): Promise<WorkSession>
  updateSession(id: number, session: Partial<WorkSession>): Promise<WorkSession>
  deleteSession(id: number): Promise<void>
  
  // Active session operations
  getActiveSession(): Promise<WorkSession | null>
  setActiveSession(sessionId: number | null): Promise<void>
  subscribeToActiveSessions(callback: (session: WorkSession | null) => void): () => void
}
