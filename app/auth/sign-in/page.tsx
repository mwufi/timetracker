'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const router = useRouter()
  const supabase = createClient()

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto">
      <Auth
        supabaseClient={supabase}
        view="sign_in"
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        showLinks={true}
        providers={['github']}
        redirectTo={`${location.origin}/auth/callback`}
      />
    </div>
  )
}
