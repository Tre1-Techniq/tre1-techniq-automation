// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Callback error:', error)
      // Redirect to login with error
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  // Success! Redirect to members area
  return NextResponse.redirect(`${requestUrl.origin}/members`)
}