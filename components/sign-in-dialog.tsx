'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface SignInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const router = useRouter()
  const supabase = createClient()

  // Get the origin using environment variables or fallback to localhost
  const origin = process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000'

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.refresh()
        onOpenChange(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, onOpenChange, supabase.auth])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] gap-0 p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left side with image and marketing copy */}
          <div className="relative bg-primary/5 p-8 hidden md:block">
            <div className="flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center">
                <Image
                  src="/clock.png"
                  alt="Flow Time Tracking"
                  width={240}
                  height={240}
                  className="mb-4"
                  priority
                />
              </div>
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="font-semibold text-xl text-primary mb-2">Track Your Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Join Flow to track your work sessions, analyze your productivity, and achieve more.
                  </p>
                </div>
                <div className="bg-background/10 rounded-lg p-4 text-sm">
                  <p className="font-medium text-primary mb-2">✨ What you'll get:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Track work sessions across projects</li>
                    <li>• Analyze your productivity patterns</li>
                    <li>• Beautiful, intuitive interface</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right side with auth UI */}
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl">Welcome to Flow</DialogTitle>
              <DialogDescription>
                Sign in to start tracking your productivity journey
              </DialogDescription>
            </DialogHeader>
            <Auth
              supabaseClient={supabase}
              view="sign_in"
              appearance={{ 
                theme: ThemeSupa,
                style: {
                  button: {
                    background: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    borderRadius: 'var(--radius)',
                    padding: '1.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.95rem',
                  },
                  anchor: {
                    color: 'hsl(var(--primary))',
                  },
                  container: {
                    margin: 0,
                  },
                  label: {
                    marginBottom: '0.5rem',
                  },
                  input: {
                    padding: '1.25rem 1rem',
                  },
                },
              }}
              theme="dark"
              showLinks={false}
              providers={['github']}
              redirectTo={`${origin}/auth/callback`}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
