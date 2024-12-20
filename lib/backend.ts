import { createClient } from '@/utils/supabase/client'
import type { Project, WorkSession } from './types'

export function createBackend() {
  const supabase = createClient()

  return {
    async getProjects(showUniverseMode: boolean = false): Promise<Project[]> {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (!showUniverseMode && user) {
        query = query.eq('created_by', user.id)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },

    async getSessions(projectId: number, showUniverseMode: boolean = false): Promise<WorkSession[]> {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase
        .from('work_sessions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (!showUniverseMode && user) {
        query = query.eq('created_by', user.id)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },

    async createSession(
      session: Omit<WorkSession, 'id'>, 
      showUniverseMode: boolean = false
    ): Promise<WorkSession> {
      const { data, error } = await supabase
        .from('work_sessions')
        .insert([session])
        .select()
        .single()

      if (error) throw error
      return data
    },

    async updateSession(
      sessionId: number, 
      updates: Partial<WorkSession>,
      showUniverseMode: boolean = false
    ): Promise<WorkSession> {
      const { data, error } = await supabase
        .from('work_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async getActiveSession(showUniverseMode: boolean = false): Promise<WorkSession | null> {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase
        .from('work_sessions')
        .select('*')
        .is('ended_at', null)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!showUniverseMode && user) {
        query = query.eq('created_by', user.id)
      }

      const { data, error } = await query
      if (error) throw error
      return data?.[0] || null
    },

    async setActiveSession(
      sessionId: number | null,
      showUniverseMode: boolean = false
    ): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // To set a session as active, we just make sure it has no end time
      if (sessionId !== null) {
        const { error } = await supabase
          .from('work_sessions')
          .update({ ended_at: null })
          .eq('id', sessionId)
        if (error) throw error
      }
    },

    async subscribeToActiveSessions(
      callback: (session: WorkSession | null) => void,
      showUniverseMode: boolean = false
    ): Promise<() => void> {
      const { data: { user } } = await supabase.auth.getUser()
      
      let channel = supabase
        .channel('work_sessions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'work_sessions',
            filter: 'ended_at=null'
          },
          async () => {
            // On any change to active sessions, fetch the latest
            const session = await this.getActiveSession(showUniverseMode)
            callback(session)
          }
        )

      await channel.subscribe()

      return () => {
        channel.unsubscribe()
      }
    }
  }
}
