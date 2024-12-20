'use client'

import { ActiveSession } from "@/components/active-session"
import { CompactActiveSession } from "@/components/compact-active-session"
import type { WorkSession } from "@/lib/types"

const mockSession: WorkSession = {
  id: "mock-1",
  name: "Design System Development",
  created_at: "2024-12-20T10:54:56-06:00",
  created_by: "user-1",
  project_id: "project-1",
  category: "development"
}

export default function PlaygroundPage() {
  const handleReaction = (emoji: string) => {
    console.log('Reaction:', emoji)
  }

  const handleUpdate = (updates: Partial<WorkSession>) => {
    console.log('Update:', updates)
  }

  const handleEnd = () => {
    console.log('End session')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold">Component Playground</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              A development environment for testing and showcasing components.
            </p>
          </div>
        </header>

        <div className="space-y-16">
          <section>
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-8">
              <h2 className="text-2xl font-semibold">Active Session</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Display and manage active work sessions with various layouts and styles.
              </p>
            </div>
            
            <div className="grid gap-12">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">Default Variant</h3>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                    variant="full"
                  </div>
                </div>
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <ActiveSession 
                    session={mockSession}
                    onReaction={handleReaction}
                    onUpdate={handleUpdate}
                    onEnd={handleEnd}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">Universe Variant</h3>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                    variant="universe"
                  </div>
                </div>
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <ActiveSession 
                    session={mockSession}
                    onReaction={handleReaction}
                    onUpdate={handleUpdate}
                    onEnd={handleEnd}
                    variant="universe"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">Compact Variant</h3>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                    CompactActiveSession
                  </div>
                </div>
                <div className="h-48 relative bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <CompactActiveSession 
                    session={mockSession}
                    onUpdate={handleUpdate}
                    onEnd={handleEnd}
                    position="relative"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
