// app/auth/callback/route.ts - UPDATED VERSION
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // If there's an error, redirect to login with error
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  // If no code, redirect to login
  if (!code) {
    console.error('No code in auth callback')
    return NextResponse.redirect(`${requestUrl.origin}/login`)
  }

  try {
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
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError) {
      console.error('Exchange code error:', authError)
      throw authError
    }

    if (!session) {
      console.error('No session after exchange')
      throw new Error('No session created')
    }

    console.log('✅ Auth callback successful for user:', session.user.email)

    // IMPORTANT: Force cookie refresh by setting a dummy cookie
    // This helps with App Router session persistence
    const response = NextResponse.redirect(`${requestUrl.origin}/members`)
    
    // Set a session indicator cookie
    response.cookies.set('auth-confirmed', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60, // 1 minute
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=auth_callback_failed`
    )
  }
}