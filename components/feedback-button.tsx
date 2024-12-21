'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { FeedbackDialog } from './feedback-dialog'
import { motion } from 'framer-motion'
import { User } from '@supabase/supabase-js'

interface FeedbackButtonProps {
  currentUser: User | null
  onSignInClick: () => void
}

export function FeedbackButton({ currentUser, onSignInClick }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-shadow"
        >
          🤖
        </Button>
      </motion.div>
      <FeedbackDialog 
        open={isOpen} 
        onOpenChange={setIsOpen}
        currentUser={currentUser}
        onSignInClick={onSignInClick}
      />
    </>
  )
}
