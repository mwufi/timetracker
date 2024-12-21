'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { IdeasList } from '@/components/ideas-list'

export default function IdeasPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="container mx-auto p-4 pb-24 flex min-h-screen flex-col items-center">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight">Ideas & Feedback</h1>
          <p className="text-muted-foreground">
            Help shape the future of TimeTracker! Share your ideas and vote on others.
          </p>
          <IdeasList currentUser={currentUser} />
        </div>
      </div>
    </div>
  )
}
