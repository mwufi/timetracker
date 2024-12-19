'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const router = useRouter()
  const supabase = createClient()

  // Get the origin using environment variables
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? // Set this for production
    process.env.NEXT_PUBLIC_NETLIFY_URL ?? // Netlify provides this automatically
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    'http://localhost:3000'

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto">
      <Auth
        supabaseClient={supabase}
        view="sign_in"
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        showLinks={true}
        providers={['github']}
        redirectTo={`${origin}/auth/callback`}
      />
    </div>
  )
}
