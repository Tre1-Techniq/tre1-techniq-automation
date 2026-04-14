import { NextResponse } from 'next/server'
import { createClient as createServerSupabaseClient } from '@/lib/server/supabase'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const safeNext = next && next.startsWith('/') ? next : '/members'

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Missing%20auth%20code`)
  }

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
    )
  }

  if (data?.user) {
    try {
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      )

      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        await supabaseAdmin.from('profiles').insert({
          id: data.user.id,
          tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    } catch (profileError) {
      console.warn('Profile creation error in callback:', profileError)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}${safeNext}`)
}