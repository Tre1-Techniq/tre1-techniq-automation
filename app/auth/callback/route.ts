import { NextResponse } from 'next/server'
import { createClient as createServerSupabaseClient } from '@/lib/server/supabase'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

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

    try {
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

    const normalizedEmail = data.user.email?.trim().toLowerCase() || null
    if (normalizedEmail) {
      const { data: matchedAudit } = await supabaseAdmin
        .from('audit_requests')
        .select('id')
        .or(`contact_email.eq.${normalizedEmail},submitted_email.eq.${normalizedEmail}`)
        .limit(1)

      if (matchedAudit && matchedAudit.length > 0) {
        return NextResponse.redirect(`${requestUrl.origin}/members`)
      }
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/audit`)
}
