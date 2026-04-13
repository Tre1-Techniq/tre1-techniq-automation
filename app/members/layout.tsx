// app/members/layout.tsx - OPTIMIZED VERSION
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MembersNavbar from '@/components/MembersNavbar'

export const dynamic = 'force-dynamic'

export default async function MembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Get cookies
    const cookieStore = await cookies() // Add await if needed
    
    // Create Supabase client with @supabase/ssr
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
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      redirect('/login?error=session')
    }
    
    // Redirect to login if no session
    if (!session) {
      console.log('No session in members layout, redirecting to login')
      redirect('/login')
    }
    
    console.log('✅ Members layout - Session found for:', session.user.email)
    
    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tier, full_name, email')
      .eq('id', session.user.id)
      .single()
    
    // Create profile if doesn't exist
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Creating new profile for user:', session.user.id)
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          tier: 'free',
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || '',
          created_at: new Date().toISOString(),
        })
      
      if (insertError) {
        console.warn('Create profile warning (non-critical):', insertError)
      }
      
      // Set default profile
      const defaultProfile = {
        tier: 'free',
        full_name: session.user.user_metadata?.full_name || '',
        email: session.user.email || '',
      }
      
      return (
        <div className="min-h-screen bg-gray-50">
          <MembersNavbar 
            tier={defaultProfile.tier}
            userName={defaultProfile.full_name || defaultProfile.email?.split('@')[0] || 'Member'}
          />
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      )
    }
    
    // Determine display name
    let userName = 'Member'
    if (profile?.full_name) {
      userName = profile.full_name
    } else if (session.user.email) {
      userName = session.user.email.split('@')[0]
    }
    
    // Determine tier
    const tier = profile?.tier || 'free'
    
    return (
      <div className="min-h-screen bg-gray-50">
        <MembersNavbar 
          tier={tier}
          userName={userName}
        />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    )
  } catch (error) {
    console.error('Layout error:', error)
    redirect('/login?error=layout')
  }
}