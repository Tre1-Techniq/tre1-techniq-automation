// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const safeNext = next && next.startsWith('/') ? next : '/members'

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
        }
      }
    )

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Callback error:', error)
      // Redirect to login with error
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`)
    }
    
    // Create profile for OAuth users if needed
    if (data?.user) {
      try {
        // Create admin client to bypass RLS
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            }
          }
        )
        
        // Check if profile already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()
        
        // Create profile if it doesn't exist
        if (!existingProfile) {
          await supabaseAdmin
            .from('profiles')
            .insert({
              id: data.user.id,
              tier: 'free',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          console.log('Profile created for OAuth user:', data.user.id)
        }
      } catch (profileError) {
        console.warn('Profile creation error in callback:', profileError)
        // Continue anyway - profile creation is non-critical
      }
    }
  }

  // Success! Redirect to members area
  return NextResponse.redirect(`${requestUrl.origin}${safeNext}`)
}