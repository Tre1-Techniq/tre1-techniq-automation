import { NextResponse } from 'next/server'
import { createClient as createServerSupabaseClient } from '@/lib/server/supabase'

export const dynamic = 'force-dynamic'

type AuditData = {
  id: string
}

export async function GET() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: audit, error: auditError } = await supabase
    .from('audit_requests')
    .select('id')
    .eq('submitted_by_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (auditError) {
    return NextResponse.json({ error: 'Audit lookup failed' }, { status: 500 })
  }

  if (!audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
  }

  const typedAudit = audit as AuditData

  const { data: existingReport, error: reportError } = await supabase
    .from('audit_reports')
    .select(
      'executive_summary, recommendations, readiness_score, readiness_band, readiness_summary, readiness_factors'
    )
    .eq('audit_request_id', typedAudit.id)
    .maybeSingle()

  if (reportError) {
    return NextResponse.json({ error: 'Saved report lookup failed' }, { status: 500 })
  }

  if (!existingReport) {
    return NextResponse.json({ error: 'Saved report not found' }, { status: 404 })
  }

  return NextResponse.json({
    executive_summary: existingReport.executive_summary,
    recommendations: existingReport.recommendations || [],
    readiness_score: existingReport.readiness_score,
    readiness_band: existingReport.readiness_band,
    readiness_summary: existingReport.readiness_summary,
    readiness_factors: existingReport.readiness_factors || [],
  })
}