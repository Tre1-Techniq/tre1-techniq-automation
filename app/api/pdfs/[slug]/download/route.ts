import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/server/supabase'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const tierRank: Record<string, number> = {
  free: 1,
  starter: 2,
  growth: 3,
  enterprise: 4,
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile lookup error:', profileError)
      return NextResponse.json(
        { error: 'Failed to verify member profile' },
        { status: 500 }
      )
    }

    const { data: pdf, error: pdfError } = await admin
      .from('pdf_resources')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single()

    if (pdfError || !pdf) {
      console.error('PDF lookup error:', pdfError)
      return NextResponse.json(
        { error: 'PDF not found' },
        { status: 404 }
      )
    }

    const userTier = profile?.tier || 'free'
    const userTierValue = tierRank[userTier] ?? 0
    const requiredTierValue = tierRank[pdf.required_tier] ?? 999

    if (userTierValue < requiredTierValue) {
      return NextResponse.redirect(new URL('/members/billing', request.url))
    }

    const { error: logError } = await admin.from('download_events').insert({
      user_id: user.id,
      pdf_id: pdf.id,
      downloaded_at: new Date().toISOString(),
      user_agent: request.headers.get('user-agent'),
      source: 'members-library',
    })

    if (logError) {
      console.warn('Download logging warning:', logError)
    }

    const { data: signedUrlData, error: signedUrlError } = await admin.storage
      .from('pdf-library')
      .createSignedUrl(pdf.storage_path, 60)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Signed URL error:', signedUrlError)
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      )
    }

    return NextResponse.redirect(signedUrlData.signedUrl)
  } catch (error) {
    console.error('PDF download route error:', error)

    return NextResponse.json(
      { error: 'Failed to process PDF download' },
      { status: 500 }
    )
  }
}