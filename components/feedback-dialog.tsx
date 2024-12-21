'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from '@/utils/supabase/client'
import { useToast } from "@/hooks/use-toast"
import { User } from '@supabase/supabase-js'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: User | null
  onSignInClick: () => void
}

export function FeedbackDialog({ 
  open, 
  onOpenChange, 
  currentUser,
  onSignInClick 
}: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const submitFeedback = async () => {
    if (!feedback.trim()) return

    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to submit feedback",
        variant: "destructive"
      })
      onOpenChange(false)
      onSignInClick()
      return
    }
    
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('ideas')
        .insert([{ 
          idea: feedback.trim(),
          submitted_by: currentUser.id
        }])

      if (error) throw error
      
      setIsSubmitted(true)
      setFeedback('')
      
      // Auto-close after showing thank you message
      setTimeout(() => {
        setIsSubmitted(false)
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: "Error submitting feedback",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSubmitted ? (
              <>
                Thank you! 🎉
              </>
            ) : (
              <>
                What&apos;re your thoughts? 🤖
              </>
            )}
          </DialogTitle>
          {!isSubmitted && (
            <DialogDescription>
              Share your ideas, feedback, or feature requests. We&apos;d love to hear from you!
            </DialogDescription>
          )}
        </DialogHeader>
        {isSubmitted ? (
          <p className="text-center text-muted-foreground">
            Your feedback has been received. We really appreciate it! 
          </p>
        ) : (
          <div className="space-y-4">
            <Textarea
              placeholder="I wish this app could..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={submitFeedback} 
                disabled={!feedback.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
