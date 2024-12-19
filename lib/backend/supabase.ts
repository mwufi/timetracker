import { createClient } from '@/utils/supabase/client'
import type { Backend, Project, WorkSession } from './types'

export class SupabaseBackend implements Backend {
  private supabase = createClient()

  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert([project])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteProject(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getSessions(projectId: number): Promise<WorkSession[]> {
    const { data, error } = await this.supabase
      .from('work_sessions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createSession(session: Omit<WorkSession, 'id'>): Promise<WorkSession> {
    const { data, error } = await this.supabase
      .from('work_sessions')
      .insert([session])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateSession(id: number, session: Partial<WorkSession>): Promise<WorkSession> {
    const { data, error } = await this.supabase
      .from('work_sessions')
      .update(session)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteSession(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('work_sessions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getActiveSession(): Promise<WorkSession | null> {
    const { data, error } = await this.supabase
      .from('work_sessions')
      .select('*')
      .is('ended_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No active session found
        return null
      }
      throw error
    }

    return data
  }

  subscribeToActiveSessions(callback: (session: WorkSession | null) => void): () => void {
    const subscription = this.supabase
      .channel('active_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_sessions',
          filter: 'ended_at=is.null'
        },
        async (payload) => {
          // When a session is updated or inserted, fetch the latest active session
          const session = await this.getActiveSession()
          callback(session)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  async setActiveSession(sessionId: number | null): Promise<void> {
    if (sessionId) {
      localStorage.setItem('activeSessionId', sessionId.toString())
    } else {
      localStorage.removeItem('activeSessionId')
    }
  }
}
