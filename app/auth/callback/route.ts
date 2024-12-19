import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      console.log('Successfully exchanged code for session')
      return NextResponse.redirect(`${origin}/`)
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/sign-in?error=auth`)
    }
  }

  // If no code, redirect to sign in
  console.log('No code found, redirecting to sign-in')
  return NextResponse.redirect(`${origin}/auth/sign-in`)
}
