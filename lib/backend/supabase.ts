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
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return []
    
    const { data, error } = await this.supabase
      .from('work_sessions')
      .select('*')
      .eq('project_id', projectId)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  async createSession(session: Omit<WorkSession, 'id'>): Promise<WorkSession> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      throw new Error('Must be logged in to create a session')
    }

    const { data, error } = await this.supabase
      .from('work_sessions')
      .insert([{
        ...session,
        created_by: user.id // Ensure we use the current user's ID
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

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
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await this.supabase
      .from('work_sessions')
      .select('*')
      .eq('created_by', user.id)
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

  async subscribeToActiveSessions(callback: (session: WorkSession | null) => void): Promise<() => void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        callback(null)
        // Return a no-op unsubscribe function
        return () => {}
      }

      const subscription = this.supabase
        .channel('active_sessions')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'work_sessions',
            filter: `created_by=eq.${user.id} AND ended_at=is.null`
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
    } catch (error) {
      console.error('Error subscribing to active sessions:', error)
      callback(null)
      return () => {}
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
