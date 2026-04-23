import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { calculateLeadScore } from '@/lib/leadScore'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

const toneInstructionMap: Record<string, string> = {
  default: '',
  short: 'Make the email shorter and more concise.',
  direct: 'Make the email more direct and action-oriented.',
  technical: 'Make the email slightly more technical and specific to automation systems.',
  friendly: 'Make the tone more casual and conversational.',
}

export async function generateLeadFollowUpDraft(
  userId: string,
  tone: string = 'default'
) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      tier,
      display_name,
      first_name,
      last_name,
      contact_email,
      company,
      phone
    `)
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('Lead profile not found')
  }

  const { data: signals, error: signalsError } = await supabase
    .from('engagement_signals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (signalsError) {
    throw new Error('Failed to load lead signals')
  }

  const { data: audits, error: auditsError } = await supabase
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

  if (auditsError) {
    throw new Error('Failed to load audit history')
  }

  const signalRows = (signals || []) as SignalRow[]
  const scoreResult = calculateLeadScore(signalRows)

  const displayName =
    profile.display_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    profile.contact_email ||
    profile.id

  const latestSignals = signalRows.slice(0, 5).map((signal) => ({
    signal_type: signal.signal_type,
    signal_value: signal.signal_value,
    source_type: signal.source_type,
    created_at: signal.created_at,
    metadata: signal.metadata,
  }))

  const uniqueInterestTags = Array.from(
    new Set(
      signalRows
        .filter((signal) => signal.signal_type === 'interest_tag')
        .map((signal) => signal.signal_value)
        .filter(Boolean)
    )
  )

  const latestAudit = audits?.[0] || null
  const toneInstruction = toneInstructionMap[tone] || toneInstructionMap.default

  const prompt = `
You are generating a concise, human-sounding follow-up email for a business automation lead.

${toneInstruction}

Write:
1. A subject line
2. A short email body

Requirements:
- Sound professional, warm, and consultative
- Do not sound pushy or spammy
- Keep the email under 180 words
- Mention only details grounded in the provided lead data
- Focus on likely automation opportunities based on their behavior and audit data
- End with a soft CTA for a short conversation or reply
- Do NOT include a signature, sender name, placeholder name, footer, or sign-off like "Best" or "Sincerely"
- The body should contain only the message itself
- Output valid JSON only with keys: subject, body

Lead profile:
- Name: ${displayName}
- Contact email: ${profile.contact_email || 'Not available'}
- Company: ${profile.company || latestAudit?.company_name || 'Not provided'}
- Tier: ${profile.tier || 'free'}
- Lead score: ${scoreResult.score}
- Lead label: ${scoreResult.label}
- Interest tags: ${uniqueInterestTags.join(', ') || 'None'}
- Latest signals: ${JSON.stringify(latestSignals, null, 2)}

Latest audit:
${JSON.stringify(latestAudit, null, 2)}
`

  const response = await openai.responses.create({
    model: 'gpt-5.2',
    instructions:
      'You write crisp B2B follow-up emails for automation consulting leads. Output JSON only.',
    input: prompt,
  })

  const outputText = response.output_text

  let parsed: { subject: string; body: string }

  try {
    parsed = JSON.parse(outputText)
  } catch {
    throw new Error('Model returned invalid JSON')
  }

  parsed.body = parsed.body
    .replace(/\n?\s*(Best|Best regards|Sincerely|Thanks|Regards),?\s*\n?\s*\[.*?\]\s*$/i, '')
    .replace(/\n?\s*(Best|Best regards|Sincerely|Thanks|Regards),?\s*$/i, '')
    .trim()

  return {
    lead: {
      name: displayName,
      email: profile.contact_email,
      score: scoreResult.score,
      label: scoreResult.label,
    },
    email: parsed,
  }
}