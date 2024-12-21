import type { User } from '@supabase/supabase-js'

interface UniverseFilterable {
  created_by: string | null
}

export function applyUniverseFilter<T extends UniverseFilterable>(
  items: T[], 
  currentUser: User | null, 
  showUniverseMode: boolean
): T[] {
  if (!currentUser) {
    // When signed out, only show items not created by current user (universe mode)
    return items.filter(item => item.created_by !== currentUser?.id)
  }
  
  if (!showUniverseMode) {
    // When universe mode is off, only show user's own items
    return items.filter(item => item.created_by === currentUser.id)
  }
  
  // When universe mode is on, show all items
  return items
}
