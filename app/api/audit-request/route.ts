import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/server/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendSlackMessage } from '@/lib/slack'
import { sendWelcomeEmail, sendTeamAuditNotification } from '@/lib/resend'

export async function POST(request: NextRequest) {
  console.log('🔍 API Route called at:', new Date().toISOString())

  try {
    const data = await request.json()
    console.log('📥 Received request body:', JSON.stringify(data, null, 2))

    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.warn('⚠️ Auth lookup warning:', authError)
    }

    const normalizedSubmittedEmail =
      typeof data.contactEmail === 'string'
        ? data.contactEmail.trim().toLowerCase()
        : null

    const normalizedAuthEmail =
      typeof user?.email === 'string'
        ? user.email.trim().toLowerCase()
        : null

    const emailMismatchFlag =
      !!normalizedSubmittedEmail &&
      !!normalizedAuthEmail &&
      normalizedSubmittedEmail !== normalizedAuthEmail

    const submittedEmailVerified =
      !!normalizedSubmittedEmail &&
      !!normalizedAuthEmail &&
      normalizedSubmittedEmail === normalizedAuthEmail

    const reportAccessToken = crypto.randomUUID()
    const reportAccessTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString()

    const insertData = {
      company_name: data.companyName || null,
      industry: data.industry || null,
      company_size: data.companySize || null,
      zip_code: data.zipcode || data.zip_code || null,
      primary_pain: data.primaryPain || null,
      time_wasters: Array.isArray(data.timeWasters) ? data.timeWasters : [],
      current_tools: Array.isArray(data.currentTools) ? data.currentTools : [],
      uses_crm: data.toolDetails?.usesCrm === 'yes',
      crm_platforms: Array.isArray(data.toolDetails?.crmPlatforms)
        ? data.toolDetails.crmPlatforms
        : [],

      uses_project_management: data.toolDetails?.usesProjectManagement === 'yes',
      project_management_platforms: Array.isArray(data.toolDetails?.projectManagementPlatforms)
        ? data.toolDetails.projectManagementPlatforms
        : [],

      uses_ecommerce_platform: data.toolDetails?.usesEcommercePlatform === 'yes',
      ecommerce_platforms: Array.isArray(data.toolDetails?.ecommercePlatforms)
        ? data.toolDetails.ecommercePlatforms
        : [],

      uses_social_channels: data.toolDetails?.usesSocialChannels === 'yes',
      social_channels: Array.isArray(data.toolDetails?.socialChannels)
        ? data.toolDetails.socialChannels
        : [],
      automation_goals: data.automationGoals || null,
      integration_needs: data.integrationNeeds || null,
      budget: data.budget || null,
      contact_name:
        data.contactName ||
        [data.first_name, data.last_name].filter(Boolean).join(' ') ||
        data.display_name ||
        'Unknown Contact',
      contact_email: normalizedSubmittedEmail,
      contact_phone: data.contactPhone || null,
      preferred_contact:
      typeof data.preferredContact === 'string' && data.preferredContact.length > 0
        ? data.preferredContact
        : 'email',
      submitted_at: data.submittedAt || new Date().toISOString(),
      source: data.source || 'multi-step-audit-form',
      status: 'pending',

      // New audit identity / verification fields
      submitted_email: normalizedSubmittedEmail,
      submitted_email_verified: submittedEmailVerified,
      submitted_email_verified_at: submittedEmailVerified
        ? new Date().toISOString()
        : null,
      submitted_by_user_id: user?.id || null,
      email_mismatch_flag: emailMismatchFlag,
      report_access_granted: false,
      report_access_token: reportAccessToken,
      report_access_token_expires_at: reportAccessTokenExpiresAt,
    }

    console.log('📝 Insert data prepared:', JSON.stringify(insertData, null, 2))

    const { data: insertedData, error: supabaseError } = await supabaseAdmin
      .from('audit_requests')
      .insert(insertData)
      .select('*')
      .single()

    if (supabaseError) {
  console.error('❌ Supabase FULL error:', JSON.stringify(supabaseError, null, 2))

  return NextResponse.json(
    {
          success: false,
          error: 'Database insertion failed',
          supabase: {
            message: supabaseError.message,
            details: supabaseError.details,
            hint: supabaseError.hint,
            code: supabaseError.code,
          },
        },
        { status: 500 }
      )
    }

    console.log(
      '✅ Database insertion successful. Inserted data:',
      JSON.stringify(insertedData, null, 2)
    )

    const slackData = insertedData || insertData

    await sendSlackMessage({
      text: `🎯 New Workflow Audit Request from ${slackData.contact_name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎯 New Workflow Audit Request',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Name:*\n${slackData.contact_name || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Company:*\n${slackData.company_name || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Submitted Email:*\n${slackData.contact_email || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*OAuth Email:*\n${normalizedAuthEmail || 'Not logged in / unavailable'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Email Match:*\n${emailMismatchFlag ? 'No' : 'Yes'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Industry:*\n${slackData.industry || 'Not provided'}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Primary Pain Point:*\n${slackData.primary_pain || 'Not specified'}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Budget:*\n${slackData.budget || 'Not specified'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Company Size:*\n${slackData.company_size || 'Not specified'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Zip Code:*\n${slackData.zip_code || 'Not specified'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Preferred Contact:*\n${slackData.preferred_contact || 'Email'}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Time Wasters:*\n${
              Array.isArray(slackData.time_wasters)
                ? slackData.time_wasters.join(', ')
                : 'Not specified'
            }`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Current Tools:*\n${
              Array.isArray(slackData.current_tools)
                ? slackData.current_tools.join(', ')
                : 'Not specified'
            }`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in Dashboard',
              },
              url: `https://app.supabase.com/project/oxkjtscvufysbztemoby/editor/audit_requests`,
            },
          ],
        },
      ],
    })

    await sendTeamAuditNotification(insertedData)

    console.log('✅ Slack notification sent')
    console.log('📧 Sending welcome email to:', insertedData.contact_email)

    try {
      const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  request.nextUrl.origin

      const accessUrl = `${baseUrl}/audit/access/${insertedData.report_access_token}`

      const emailResult = await sendWelcomeEmail(
        insertedData.contact_email,
        insertedData.contact_name,
        insertedData.company_name || 'your company',
        accessUrl
      )

      if (emailResult.success) {
        console.log('✅ Welcome email sent successfully')
      } else {
        console.warn('⚠️ Welcome email failed:', emailResult.error)
      }
    } catch (emailError) {
      console.warn('⚠️ Email sending error (non-critical):', emailError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Audit request submitted successfully',
        auditRequestId: insertedData.id,
        submittedEmail: insertedData.submitted_email,
        submittedEmailVerified: insertedData.submitted_email_verified,
        emailMismatchFlag: insertedData.email_mismatch_flag,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit audit request' },
      { status: 500 }
    )
  }
}