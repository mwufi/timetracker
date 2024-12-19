import type { Backend } from './types'
import { SupabaseBackend } from './supabase'
import { LocalStorageBackend } from './localstorage'

export type { Backend, Project, WorkSession } from './types'

export function createBackend(type: 'supabase' | 'localStorage' = 'supabase'): Backend {
  switch (type) {
    case 'supabase':
      return new SupabaseBackend()
    case 'localStorage':
      return new LocalStorageBackend()
    default:
      throw new Error(`Unknown backend type: ${type}`)
  }
}
