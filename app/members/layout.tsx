// app/members/layout.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MembersNavbar from '@/components/MembersNavbar'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default async function MembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

    // Server-safe auth check
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
    const isAuthenticated = !!claimsData?.claims && !claimsError

    if (!isAuthenticated) {
      console.log('No valid auth claims in members layout, redirecting to login')
      redirect('/login')
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user

    if (userError || !user) {
      console.error('User fetch error:', userError)
      redirect('/login?error=user')
    }

    console.log('✅ Members layout - User found for:', user.email)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tier, full_name, email')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      console.log('Creating new profile for user:', user.id)

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          tier: 'free',
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        console.warn('Create profile warning (non-critical):', insertError)
      }

      const defaultProfile = {
        tier: 'free',
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
      }

      return (
        <div className="min-h-screen bg-gray-50">
          <MembersNavbar
            tier={defaultProfile.tier}
            userName={defaultProfile.full_name || defaultProfile.email.split('@')[0] || 'Member'}
          />
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
          <Footer />
        </div>
      )
    }

    let userName = 'Member'
    if (profile?.full_name) {
      userName = profile.full_name
    } else if (user.email) {
      userName = user.email.split('@')[0]
    }

    const tier = profile?.tier || 'free'

    return (
      <div className="min-h-screen bg-gray-50">
        <MembersNavbar tier={tier} userName={userName} />
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Layout error:', error)
    redirect('/login?error=layout')
  }
}