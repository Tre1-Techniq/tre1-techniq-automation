import { createClient } from '@supabase/supabase-js'
import { generateLeadFollowUpDraft } from '@/lib/followUpGenerator'
import { sendLeadFollowUpEmail } from '@/lib/resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DAY_MS = 24 * 60 * 60 * 1000
const MIN_GLOBAL_SAMPLE_SIZE = 3

type SignalRow = {
  id: string
  user_id: string
  source_type: string
  source_id: string | null
  signal_type: string
  signal_value: string | null
  created_at: string
  metadata: Record<string, unknown> | null
}

type AuditRow = {
  id: string
  company_name: string | null
  status: string | null
  submitted_at: string | null
  submitted_email: string | null
  submitted_email_verified: boolean | null
  report_access_granted: boolean | null
  primary_pain: string | null
  automation_goals: string | null
  current_tools: string[] | null
  budget: string | null
}

type OutreachHistoryRow = {
  outcome: string | null
  metadata?: {
    angle?: string
    sequence_step?: number
  } | null
}

type AngleName = 'upgrade' | 'implementation' | 'audit' | 'general'

type AnglePerformance = {
  sent: number
  replied: number
  replyRate: number
}

const ALL_ANGLES: AngleName[] = [
  'upgrade',
  'implementation',
  'audit',
  'general',
]

export async function createHotLeadSequence(userId: string) {
  const { data: existing } = await supabase
    .from('lead_sequences')
    .select('id, status')
    .eq('user_id', userId)
    .eq('sequence_type', 'hot-lead')
    .in('status', ['active', 'completed', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)

  if (existing && existing.length > 0) {
    return { created: false, reason: 'Sequence already exists' }
  }

  const { data: sequence, error: sequenceError } = await supabase
    .from('lead_sequences')
    .insert({
      user_id: userId,
      sequence_type: 'hot-lead',
      status: 'active',
      current_step: 0,
    })
    .select('id')
    .single()

  if (sequenceError || !sequence) {
    throw new Error('Failed to create lead sequence')
  }

  const now = Date.now()

  const { error: stepsError } = await supabase
    .from('lead_sequence_steps')
    .insert([
      {
        sequence_id: sequence.id,
        step_number: 1,
        step_type: 'email',
        scheduled_for: new Date(now).toISOString(),
        status: 'pending',
      },
      {
        sequence_id: sequence.id,
        step_number: 2,
        step_type: 'email',
        scheduled_for: new Date(now + 2 * DAY_MS).toISOString(),
        status: 'pending',
      },
      {
        sequence_id: sequence.id,
        step_number: 3,
        step_type: 'email',
        scheduled_for: new Date(now + 5 * DAY_MS).toISOString(),
        status: 'pending',
      },
    ])

  if (stepsError) {
    throw new Error('Failed to create sequence steps')
  }

  return { created: true, sequenceId: sequence.id }
}

async function getLeadBehaviorProfile(userId: string) {
  const { data: signals } = await supabase
    .from('engagement_signals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const { data: audits } = await supabase
    .from('audit_requests')
    .select(`
      id,
      company_name,
      status,
      submitted_at,
      submitted_email,
      submitted_email_verified,
      report_access_granted,
      primary_pain,
      automation_goals,
      current_tools,
      budget
    `)
    .eq('submitted_by_user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)

  return {
    signals: (signals || []) as SignalRow[],
    latestAudit: ((audits || [])[0] || null) as AuditRow | null,
  }
}

function getEligibleAngles(
  signals: SignalRow[],
  latestAudit: AuditRow | null
): AngleName[] {
  const eligible = new Set<AngleName>(['general'])

  const hasUpsellIntent = signals.some((s) => s.signal_type === 'upsell_intent')
  const hasHighIntentDownload = signals.some(
    (s) => s.signal_type === 'high_intent_download'
  )
  const hasAuditContext = Boolean(latestAudit)

  if (hasUpsellIntent) {
    eligible.add('upgrade')
  }

  if (hasHighIntentDownload) {
    eligible.add('implementation')
  }

  if (hasAuditContext) {
    eligible.add('audit')
  }

  return Array.from(eligible)
}

async function getGlobalAnglePerformance(): Promise<
  Record<AngleName, AnglePerformance>
> {
  const { data, error } = await supabase
    .from('lead_outreach')
    .select('outcome, metadata')
    .not('metadata', 'is', null)

  if (error) {
    console.warn('Global angle performance lookup warning:', error)
  }

  const stats: Record<AngleName, AnglePerformance> = {
    upgrade: { sent: 0, replied: 0, replyRate: 0 },
    implementation: { sent: 0, replied: 0, replyRate: 0 },
    audit: { sent: 0, replied: 0, replyRate: 0 },
    general: { sent: 0, replied: 0, replyRate: 0 },
  }

  for (const row of data || []) {
    const angle = row.metadata?.angle as AngleName | undefined

    if (!angle || !ALL_ANGLES.includes(angle)) {
      continue
    }

    stats[angle].sent += 1

    if (row.outcome === 'replied') {
      stats[angle].replied += 1
    }
  }

  for (const angle of ALL_ANGLES) {
    if (stats[angle].sent > 0) {
      stats[angle].replyRate = stats[angle].replied / stats[angle].sent
    }
  }

  return stats
}

function getLeadAnglePenalties(
  outreachHistory: OutreachHistoryRow[]
): Record<AngleName, number> {
  const penalties: Record<AngleName, number> = {
    upgrade: 0,
    implementation: 0,
    audit: 0,
    general: 0,
  }

  for (const row of outreachHistory) {
    const angle = row.metadata?.angle as AngleName | undefined

    if (!angle || !ALL_ANGLES.includes(angle)) {
      continue
    }

    if (row.outcome === 'replied') {
      penalties[angle] += 1.5
    } else {
      penalties[angle] -= 0.5
    }
  }

  return penalties
}

export function detectSequenceAngle(
  signals: SignalRow[],
  latestAudit: AuditRow | null,
  outreachHistory: OutreachHistoryRow[] = [],
  globalPerformance?: Record<AngleName, AnglePerformance>
): AngleName {
  const eligibleAngles = getEligibleAngles(signals, latestAudit)
  const leadPenalties = getLeadAnglePenalties(outreachHistory)

  const fallbackPerformance: Record<AngleName, AnglePerformance> = {
    upgrade: { sent: 0, replied: 0, replyRate: 0 },
    implementation: { sent: 0, replied: 0, replyRate: 0 },
    audit: { sent: 0, replied: 0, replyRate: 0 },
    general: { sent: 0, replied: 0, replyRate: 0 },
  }

  const performance = globalPerformance || fallbackPerformance

  const scoredAngles = eligibleAngles.map((angle) => {
    const global = performance[angle]
    const hasEnoughGlobalData = global.sent >= MIN_GLOBAL_SAMPLE_SIZE

    // Start with a soft base priority so the system remains sensible even
    // with limited data.
    let score = 0

    if (angle === 'upgrade') score += 0.35
    if (angle === 'implementation') score += 0.3
    if (angle === 'audit') score += 0.25
    if (angle === 'general') score += 0.1

    if (hasEnoughGlobalData) {
      score += global.replyRate * 2
    }

    score += leadPenalties[angle]

    return {
      angle,
      score,
    }
  })

  scoredAngles.sort((a, b) => b.score - a.score)

  return scoredAngles[0]?.angle || 'general'
}

function getToneForStep(stepNumber: number, angle: AngleName) {
  if (angle === 'upgrade') {
    if (stepNumber === 1) return 'direct'
    if (stepNumber === 2) return 'friendly'
    return 'direct'
  }

  if (angle === 'implementation') {
    if (stepNumber === 1) return 'technical'
    if (stepNumber === 2) return 'friendly'
    return 'technical'
  }

  if (angle === 'audit') {
    if (stepNumber === 1) return 'direct'
    if (stepNumber === 2) return 'friendly'
    return 'technical'
  }

  if (stepNumber === 1) return 'direct'
  if (stepNumber === 2) return 'friendly'
  return 'technical'
}

function applyBranchingToSubject(
  subject: string,
  stepNumber: number,
  angle: AngleName
) {
  if (stepNumber === 1) return subject

  if (angle === 'upgrade') {
    if (stepNumber === 2) return `Quick follow-up on access options: ${subject}`
    return `Final note on unlocking the right resources`
  }

  if (angle === 'implementation') {
    if (stepNumber === 2) return `Following up on implementation ideas: ${subject}`
    return `One concrete automation example for your workflow`
  }

  if (angle === 'audit') {
    if (stepNumber === 2) return `Following up on your audit priorities: ${subject}`
    return `One more workflow recommendation based on your audit`
  }

  if (stepNumber === 2) return `Following up: ${subject}`
  return `One more thought on ${subject}`
}

function appendBranchingContext(
  body: string,
  stepNumber: number,
  angle: AngleName,
  latestAudit: AuditRow | null
) {
  if (angle === 'upgrade') {
    if (stepNumber === 2) {
      return `${body}

You’ve already shown interest in at least one resource beyond your current access level, so if helpful I can point you toward the most relevant next step without overcomplicating it.`
    }

    if (stepNumber === 3) {
      return `${body}

If the main blocker is deciding which level of support or access makes sense, I’m happy to help narrow that down quickly.`
    }
  }

  if (angle === 'implementation') {
    if (stepNumber === 2) {
      return `${body}

Based on the resources you explored, there may be a strong opportunity to turn this into a concrete implementation plan rather than just a high-level idea.`
    }

    if (stepNumber === 3) {
      return `${body}

If useful, I can also outline what a practical first automation rollout usually looks like from a systems perspective.`
    }
  }

  if (angle === 'audit') {
    const painPoint = latestAudit?.primary_pain || latestAudit?.automation_goals || null

    if (stepNumber === 2 && painPoint) {
      return `${body}

Given the workflow issue you mentioned — "${painPoint}" — it may be worth identifying the first process to tighten before trying to automate everything at once.`
    }

    if (stepNumber === 3) {
      return `${body}

If helpful, I can also help prioritize which workflow to improve first based on impact, complexity, and the tools you already use.`
    }
  }

  if (stepNumber === 2) {
    return `${body}

Just wanted to follow up in case this is a priority for your team right now.`
  }

  if (stepNumber === 3) {
    return `${body}

If helpful, I can also share a concrete example of how this kind of workflow is typically automated in practice.`
  }

  return body
}

export async function processPendingLeadSequences() {
  const now = new Date().toISOString()
  const globalPerformance = await getGlobalAnglePerformance()

  const { data: pendingSteps, error: stepsError } = await supabase
    .from('lead_sequence_steps')
    .select(`
      id,
      sequence_id,
      step_number,
      scheduled_for,
      status,
      lead_sequences!inner (
        id,
        user_id,
        status,
        sequence_type,
        reply_paused
      )
    `)
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .eq('lead_sequences.status', 'active')
    .order('scheduled_for', { ascending: true })

  if (stepsError) {
    throw new Error(`Failed to load pending sequence steps: ${stepsError.message}`)
  }

  const results: Array<{
    stepId: string
    sequenceId: string
    userId: string
    status: string
    detail?: string
    angle?: string
  }> = []

  for (const step of pendingSteps || []) {
    const sequence = Array.isArray(step.lead_sequences)
      ? step.lead_sequences[0]
      : step.lead_sequences

    const userId = sequence.user_id as string

    try {
      if (sequence.reply_paused) {
        results.push({
          stepId: step.id,
          sequenceId: step.sequence_id,
          userId,
          status: 'skipped',
          detail: 'Sequence paused due to reply status',
        })
        continue
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('contact_email, display_name, first_name, last_name, has_replied')
        .eq('id', userId)
        .single()

      if (profileError || !profile?.contact_email) {
        await supabase
          .from('lead_sequence_steps')
          .update({ status: 'failed' })
          .eq('id', step.id)

        results.push({
          stepId: step.id,
          sequenceId: step.sequence_id,
          userId,
          status: 'failed',
          detail: 'Missing verified contact email',
        })
        continue
      }

      if (profile.has_replied) {
        await supabase
          .from('lead_sequences')
          .update({
            status: 'paused',
            reply_paused: true,
            reply_paused_at: new Date().toISOString(),
            reply_pause_reason: 'profile_has_replied',
            paused_at: new Date().toISOString(),
          })
          .eq('id', step.sequence_id)

        results.push({
          stepId: step.id,
          sequenceId: step.sequence_id,
          userId,
          status: 'skipped',
          detail: 'Sequence paused because lead is marked replied',
        })
        continue
      }

      const { signals, latestAudit } = await getLeadBehaviorProfile(userId)

      const { data: outreachHistory } = await supabase
        .from('lead_outreach')
        .select('outcome, metadata')
        .eq('user_id', userId)

      const angle = detectSequenceAngle(
        signals,
        latestAudit,
        (outreachHistory || []) as OutreachHistoryRow[],
        globalPerformance
      )

      const draft = await generateLeadFollowUpDraft(
        userId,
        getToneForStep(step.step_number, angle)
      )

      const subject = applyBranchingToSubject(
        draft.email.subject,
        step.step_number,
        angle
      )

      const body = appendBranchingContext(
        draft.email.body,
        step.step_number,
        angle,
        latestAudit
      )

      const displayName =
        profile.display_name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
        profile.contact_email

      const sendResult = await sendLeadFollowUpEmail(
        profile.contact_email,
        displayName,
        subject,
        body
      )

      if (!sendResult.success) {
        await supabase
          .from('lead_sequence_steps')
          .update({ status: 'failed' })
          .eq('id', step.id)

        results.push({
          stepId: step.id,
          sequenceId: step.sequence_id,
          userId,
          status: 'failed',
          detail: 'Email send failed',
          angle,
        })
        continue
      }

      await supabase
        .from('lead_outreach')
        .insert({
          user_id: userId,
          recipient_email: profile.contact_email,
          subject,
          body,
          channel: 'email',
          status: 'sent',
          auto_generated: true,
          outcome: 'sent',
          metadata: {
            sequence_step: step.step_number,
            angle,
          },
        })

      await supabase
        .from('lead_sequence_steps')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          subject,
          body,
        })
        .eq('id', step.id)

      await supabase
        .from('lead_sequences')
        .update({
          current_step: step.step_number,
        })
        .eq('id', step.sequence_id)

      if (step.step_number === 3) {
        await supabase
          .from('lead_sequences')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            current_step: 3,
          })
          .eq('id', step.sequence_id)
      }

      results.push({
        stepId: step.id,
        sequenceId: step.sequence_id,
        userId,
        status: 'sent',
        angle,
      })
    } catch (error) {
      await supabase
        .from('lead_sequence_steps')
        .update({ status: 'failed' })
        .eq('id', step.id)

      results.push({
        stepId: step.id,
        sequenceId: step.sequence_id,
        userId,
        status: 'failed',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}