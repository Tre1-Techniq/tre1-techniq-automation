import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAuditCompletedEmail } from '@/lib/resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { auditId, notes } = body

    if (!auditId) {
      return NextResponse.json(
        { error: 'Missing auditId' },
        { status: 400 }
      )
    }

    const { data: auditRequest, error: auditLookupError } = await supabase
      .from('audit_requests')
      .select(`
        id,
        company_name,
        contact_name,
        contact_email,
        submitted_email,
        submitted_by_user_id,
        report_access_token
      `)
      .eq('id', auditId)
      .single()

    if (auditLookupError || !auditRequest) {
      console.error('Audit lookup error:', auditLookupError)
      return NextResponse.json(
        { error: 'Audit request not found' },
        { status: 404 }
      )
    }

    const { error: updateError } = await supabase
      .from('audit_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        notes,
      })
      .eq('id', auditId)

    if (updateError) {
      throw updateError
    }

    let profileContactEmail: string | null = null

    if (auditRequest.submitted_by_user_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('contact_email')
        .eq('id', auditRequest.submitted_by_user_id)
        .single()

      if (profileError) {
        console.warn('Profile lookup warning:', profileError)
      } else {
        profileContactEmail = profile?.contact_email || null
      }
    }

    let authEmail: string | null = null

    if (auditRequest.submitted_by_user_id) {
      const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(
        auditRequest.submitted_by_user_id
      )

      if (authUserError) {
        console.warn('Auth user lookup warning:', authUserError)
      } else {
        authEmail = authUser?.user?.email || null
      }
    }

    const recipientEmail =
      profileContactEmail ||
      authEmail ||
      auditRequest.submitted_email ||
      auditRequest.contact_email ||
      null

    if (recipientEmail) {
      try {
        await sendAuditCompletedEmail(
          recipientEmail,
          auditRequest.contact_name || 'there',
          auditRequest.company_name || 'your company',
          auditRequest.report_access_token
        )
      } catch (emailError) {
        console.warn('Audit completed email warning:', emailError)
      }
    } else {
      console.warn('No recipient email found for completed audit:', auditId)
    }

    return NextResponse.json({
      success: true,
      message: 'Audit marked as completed',
      recipientEmail,
    })
  } catch (error) {
    console.error('Error completing audit:', error)
    return NextResponse.json(
      { error: 'Failed to complete audit' },
      { status: 500 }
    )
  }
}