import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/server/supabase'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendSlackMessage } from '@/lib/slack'
import { calculateLeadScore } from '@/lib/leadScore'
import { createHotLeadSequence } from '@/lib/sequences'

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
      .select('tier, display_name, first_name, last_name, contact_email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile lookup error:', profileError)
      return NextResponse.redirect(new URL('/members/billing', request.url))
    }

    const { data: pdf, error: pdfError } = await admin
      .from('pdf_resources')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single()

    if (pdfError || !pdf) {
      console.error('PDF lookup error:', pdfError)
      return NextResponse.redirect(new URL('/members/library', request.url))
    }

    const userTier = profile?.tier || 'free'
    const userTierValue = tierRank[userTier] ?? 0
    const requiredTierValue = tierRank[pdf.required_tier] ?? 999

    if (userTierValue >= requiredTierValue) {
      return NextResponse.redirect(
        new URL(`/api/pdfs/${pdf.slug}/download`, request.url)
      )
    }

    const displayName =
      profile?.display_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
      user.email ||
      user.id

    const metadata = {
      pdf_slug: pdf.slug,
      pdf_title: pdf.title,
      required_tier: pdf.required_tier,
      current_tier: userTier,
      interest_tag: pdf.interest_tag || 'unknown',
      source: 'members-library-locked-click',
    }

    const { error: signalError } = await admin.from('engagement_signals').insert({
      user_id: user.id,
      source_type: 'locked_pdf_click',
      source_id: pdf.id,
      signal_type: 'upsell_intent',
      signal_value: pdf.slug,
      metadata,
    })

    if (signalError) {
      console.warn('Locked click signal warning:', signalError)
    }

    try {
      await sendSlackMessage({
        text: '🔒 Locked PDF click detected',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*🔒 Locked PDF click detected*',
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Name:*\n${displayName}` },
              { type: 'mrkdwn', text: `*Email:*\n${profile?.contact_email || user.email || 'Not available'}` },
              { type: 'mrkdwn', text: `*PDF:*\n${pdf.title}` },
              { type: 'mrkdwn', text: `*Slug:*\n${pdf.slug}` },
              { type: 'mrkdwn', text: `*Current Tier:*\n${userTier}` },
              { type: 'mrkdwn', text: `*Required Tier:*\n${pdf.required_tier}` },
              { type: 'mrkdwn', text: `*Interest Tag:*\n${pdf.interest_tag || 'unknown'}` },
              { type: 'mrkdwn', text: `*Signal:*\nupsell_intent` },
            ],
          },
        ],
      })
    } catch (slackError) {
      console.warn('Locked click Slack warning:', slackError)
    }

    const { data: signalsForScore, error: scoreSignalsError } = await admin
      .from('engagement_signals')
      .select('*')
      .eq('user_id', user.id)

    if (scoreSignalsError) {
      console.warn('Lead score query warning:', scoreSignalsError)
    } else {
      const result = calculateLeadScore(signalsForScore || [])

      if (result.label === 'Hot') {
        const { data: existingHotAlert, error: hotAlertLookupError } = await admin
          .from('lead_alerts')
          .select('id')
          .eq('user_id', user.id)
          .eq('alert_type', 'hot_lead')
          .maybeSingle()

        if (hotAlertLookupError) {
          console.warn('Lead alert lookup warning:', hotAlertLookupError)
        }

        if (!existingHotAlert) {
          try {
            await sendSlackMessage({
              text: '🔥 HOT LEAD DETECTED',
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: '*🔥 HOT LEAD DETECTED*',
                  },
                },
                {
                  type: 'section',
                  fields: [
                    { type: 'mrkdwn', text: `*Name:*\n${displayName}` },
                    { type: 'mrkdwn', text: `*Email:*\n${profile?.contact_email || user.email || 'Not available'}` },
                    { type: 'mrkdwn', text: `*Score:*\n${result.score}` },
                    { type: 'mrkdwn', text: `*Lead Status:*\n${result.label}` },
                    { type: 'mrkdwn', text: `*Latest Action:*\n${pdf.title}` },
                    { type: 'mrkdwn', text: `*Interest:*\n${pdf.interest_tag || 'unknown'}` },
                    { type: 'mrkdwn', text: `*Tier:*\n${userTier}` },
                    { type: 'mrkdwn', text: `*User ID:*\n${user.id}` },
                  ],
                },
              ],
            })

            const { error: leadAlertInsertError } = await admin
              .from('lead_alerts')
              .insert({
                user_id: user.id,
                alert_type: 'hot_lead',
              })

            if (leadAlertInsertError) {
              console.warn('Lead alert insert warning:', leadAlertInsertError)
            }

            const sequenceResult = await createHotLeadSequence(user.id)
            if (!sequenceResult.created) {
              console.warn('Sequence creation skipped:', sequenceResult.reason)
            }
          } catch (hotLeadError) {
            console.warn('Hot lead Slack warning:', hotLeadError)
          }
        }
      }
    }

    return NextResponse.redirect(new URL('/members/billing', request.url))
  } catch (error) {
    console.error('Locked PDF route error:', error)
    return NextResponse.redirect(new URL('/members/billing', request.url))
  }
}