'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

interface Idea {
  id: string
  created_at: string
  idea: string
  reacts: Record<string, string[]>
  num_reacts: number
}

const REACTIONS = [
  { emoji: '❤️', key: 'heart' },
  { emoji: '👍', key: 'like' },
  { emoji: '😂', key: 'funny' }
]

interface IdeasListProps {
  currentUser: User | null
}

export function IdeasList({ currentUser }: IdeasListProps) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadIdeas()
    
    // Subscribe to changes
    const channel = supabase
      .channel('ideas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ideas'
        },
        () => {
          loadIdeas()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('num_reacts', { ascending: false })

      if (error) throw error
      setIdeas(data || [])
    } catch (error) {
      console.error('Error loading ideas:', error)
      toast({
        title: 'Error loading ideas',
        description: 'Please try again later',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleReaction = async (ideaId: string, reaction: string) => {
    if (!currentUser) return

    try {
      const idea = ideas.find(i => i.id === ideaId)
      if (!idea) return

      const currentReacts = idea.reacts || {}
      const currentReactors = currentReacts[reaction] || []
      const hasReacted = currentReactors.includes(currentUser.id)

      let newReacts = { ...currentReacts }
      if (hasReacted) {
        newReacts[reaction] = currentReactors.filter(id => id !== currentUser.id)
        if (newReacts[reaction].length === 0) {
          delete newReacts[reaction]
        }
      } else {
        newReacts[reaction] = [...currentReactors, currentUser.id]
      }

      // Calculate total reactions
      const totalReacts = Object.values(newReacts).reduce((sum, reactors) => sum + reactors.length, 0)

      const { error } = await supabase
        .from('ideas')
        .update({ 
          reacts: newReacts,
          num_reacts: totalReacts
        })
        .eq('id', ideaId)

      if (error) throw error

    } catch (error) {
      console.error('Error updating reaction:', error)
      toast({
        title: 'Error updating reaction',
        description: 'Please try again later',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return <div className="text-center">Loading ideas...</div>
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {ideas.map((idea) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 space-y-3">
              <p className="text-lg">{idea.idea}</p>
              <div className="flex gap-2">
                {REACTIONS.map(({ emoji, key }) => {
                  const reactors = idea.reacts?.[key] || []
                  const hasReacted = currentUser && reactors.includes(currentUser.id)
                  return (
                    <Button
                      key={key}
                      variant={hasReacted ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleReaction(idea.id, key)}
                      className="gap-1.5 transition-all duration-200 hover:scale-110"
                    >
                      <span className="text-base">{emoji}</span>
                      <span className="text-sm">
                        {reactors.length > 0 ? reactors.length : ''}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
