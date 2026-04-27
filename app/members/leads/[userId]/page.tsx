import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/server/supabase'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  ArrowLeftIcon,
  UserIcon,
  FireIcon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  EnvelopeIcon,
  SignalIcon,
} from '@heroicons/react/24/outline'
import { calculateLeadScore } from '@/lib/leadScore'
import { detectSequenceAngle } from '@/lib/sequences'
import GenerateFollowUpButton from '@/components/GenerateFollowUpButton'
import ReplyStatusToggle from '@/components/ReplyStatusToggle'

export const dynamic = 'force-dynamic'

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

type OutreachRow = {
  id: string
  recipient_email: string
  subject: string
  body: string
  channel: string
  status: string
  created_at: string
  auto_generated: boolean | null
  outcome: string | null
  metadata: {
    sequence_step?: number
    angle?: string
  } | null
}

type SequenceRow = {
  id: string
  sequence_type: string
  status: string
  current_step: number
  started_at: string | null
  completed_at: string | null
  paused_at: string | null
  reply_paused: boolean | null
  reply_paused_at: string | null
  reply_pause_reason: string | null
  created_at: string
}

type SequenceStepRow = {
  id: string
  step_number: number
  step_type: string
  scheduled_for: string
  sent_at: string | null
  status: string
  subject: string | null
  body: string | null
  created_at: string
}

interface PageProps {
  params: {
    userId: string
  }
}

function formatLeadStatus(label: string) {
  if (label === 'Hot') {
    return {
      icon: FireIcon,
      className: 'bg-red-100 text-red-700',
    }
  }

  if (label === 'Warm') {
    return {
      icon: BoltIcon,
      className: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    icon: ChartBarIcon,
    className: 'bg-gray-100 text-gray-700',
  }
}

function formatSignalLabel(signal: SignalRow) {
  if (signal.signal_type === 'upsell_intent') return 'Locked PDF click'
  if (signal.signal_type === 'high_intent_download') return 'High-intent download'
  if (signal.signal_type === 'interest_tag') {
    return `Interest: ${signal.signal_value || 'unknown'}`
  }
  return signal.signal_type
}

function getSignalDetail(signal: SignalRow) {
  const metadata = signal.metadata || {}

  const pdfTitle =
    typeof metadata.pdf_title === 'string'
      ? metadata.pdf_title
      : null

  const pdfSlug =
    typeof metadata.pdf_slug === 'string'
      ? metadata.pdf_slug
      : signal.signal_value

  const requiredTier =
    typeof metadata.required_tier === 'string'
      ? metadata.required_tier
      : null

  const currentTier =
    typeof metadata.current_tier === 'string'
      ? metadata.current_tier
      : null

  if (signal.signal_type === 'upsell_intent') {
    return {
      title: pdfTitle || pdfSlug || 'Locked resource',
      subtitle:
        requiredTier && currentTier
          ? `Current tier: ${currentTier} • Required tier: ${requiredTier}`
          : 'Upgrade intent detected',
    }
  }

  if (signal.signal_type === 'high_intent_download') {
    return {
      title: pdfTitle || pdfSlug || 'High-priority resource',
      subtitle: 'Downloaded a high-priority resource',
    }
  }

  if (signal.signal_type === 'interest_tag') {
    return {
      title: pdfTitle || signal.signal_value || 'Interest signal',
      subtitle: `Source: ${signal.source_type}`,
    }
  }

  return {
    title: signal.signal_value || signal.signal_type,
    subtitle: `Source: ${signal.source_type}`,
  }
}

export default async function LeadDetailPage({ params }: PageProps) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select(`
      id,
      tier,
      display_name,
      first_name,
      last_name,
      contact_email,
      contact_email_verified_at,
      company,
      phone,
      has_replied,
      replied_at
    `)
    .eq('id', params.userId)
    .single()

  if (profileError || !profile) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Lead not found</h1>
          <p className="mt-2 text-gray-600">
            No profile was found for this user.
          </p>
          <div className="mt-6">
            <Link
              href="/members/leads"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 transition"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Leads
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { data: signals, error: signalsError } = await admin
    .from('engagement_signals')
    .select('*')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })

  if (signalsError) {
    console.error('Lead signals query error:', signalsError)
  }

  const { data: audits, error: auditsError } = await admin
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
    .eq('submitted_by_user_id', params.userId)
    .order('submitted_at', { ascending: false })

  if (auditsError) {
    console.error('Lead audits query error:', auditsError)
  }

  const { data: outreach, error: outreachError } = await admin
    .from('lead_outreach')
    .select(`
      id,
      recipient_email,
      subject,
      body,
      channel,
      status,
      created_at,
      auto_generated,
      outcome,
      metadata
    `)
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })

  if (outreachError) {
    console.error('Lead outreach query error:', outreachError)
  }

  const { data: sequence, error: sequenceError } = await admin
    .from('lead_sequences')
    .select(`
      id,
      sequence_type,
      status,
      current_step,
      started_at,
      completed_at,
      paused_at,
      reply_paused,
      reply_paused_at,
      reply_pause_reason,
      created_at
    `)
    .eq('user_id', params.userId)
    .eq('sequence_type', 'hot-lead')
    .order('created_at', { ascending: false })
    .maybeSingle()

  if (sequenceError) {
    console.error('Lead sequence query error:', sequenceError)
  }

  const { data: sequenceSteps, error: sequenceStepsError } = await admin
    .from('lead_sequence_steps')
    .select(`
      id,
      step_number,
      step_type,
      scheduled_for,
      sent_at,
      status,
      subject,
      body,
      created_at
    `)
    .eq('sequence_id', sequence?.id || '')
    .order('step_number', { ascending: true })

  if (sequenceStepsError && sequence?.id) {
    console.error('Lead sequence steps query error:', sequenceStepsError)
  }

  const signalRows = (signals || []) as SignalRow[]
  const scoreResult = calculateLeadScore(signalRows)
  const statusConfig = formatLeadStatus(scoreResult.label)
  const StatusIcon = statusConfig.icon

  const displayName =
    profile.display_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    profile.contact_email ||
    profile.id

  const latestSignal = signalRows[0]
  const latestSignalText = latestSignal ? formatSignalLabel(latestSignal) : 'No signals yet'

  const uniqueInterestTags = Array.from(
    new Set(
      signalRows
        .filter((signal) => signal.signal_type === 'interest_tag')
        .map((signal) => signal.signal_value)
        .filter(Boolean)
    )
  )

  const latestAudit = ((audits || [])[0] || null) as AuditRow | null
  const sequenceAngle = detectSequenceAngle(signalRows, latestAudit, outreach || [])

  const angleStyles: Record<string, string> = {
    upgrade: 'bg-purple-100 text-purple-700',
    implementation: 'bg-blue-100 text-blue-700',
    audit: 'bg-teal-100 text-teal-700',
    general: 'bg-gray-100 text-gray-700',
  }

  const sequenceRow = sequence as SequenceRow | null
  const sequenceStepRows = (sequenceSteps || []) as SequenceStepRow[]

  const nextPendingStep =
    sequenceStepRows.find((step) => step.status === 'pending') || null

  const sequenceStatusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-amber-100 text-amber-700',
    completed: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Link
              href="/members/leads"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Leads
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-gray-600 mt-2">
              Individual lead intelligence view with signal history, score, audit context, and sequence state.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.className}`}
            >
              <StatusIcon className="h-4 w-4 mr-2" />
              {scoreResult.label}
            </span>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-tre1-teal/10 text-tre1-teal">
              Score: {scoreResult.score}
            </span>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              Tier: {profile.tier || 'free'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Signals</p>
              <p className="text-2xl font-bold mt-1">{signalRows.length}</p>
            </div>
            <SignalIcon className="h-8 w-8 text-tre1-teal" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Latest Signal</p>
              <p className="text-sm font-semibold mt-1 text-gray-900">{latestSignalText}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-tre1-orange" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Contact Email</p>
              <p className="text-sm font-semibold mt-1 text-gray-900 break-all">
                {profile.contact_email || 'Not available'}
              </p>
            </div>
            <EnvelopeIcon className="h-8 w-8 text-tre1-dark" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Audits</p>
              <p className="text-2xl font-bold mt-1">{(audits || []).length}</p>
            </div>
            <UserIcon className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sequence Status</h2>

        {!sequenceRow ? (
          <p className="text-gray-500">No active or completed hot-lead sequence found.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sequenceStatusStyles[sequenceRow.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {sequenceRow.status}
              </span>

              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Current Step: {sequenceRow.current_step} / 3
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  angleStyles[sequenceAngle] || 'bg-gray-100 text-gray-700'
                }`}
              >
                Angle: {sequenceAngle}
              </span>

              {sequenceRow.reply_paused && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                  Paused on reply
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-gray-500">Started</p>
                <p className="font-medium text-gray-900 mt-1">
                  {sequenceRow.started_at
                    ? new Date(sequenceRow.started_at).toLocaleString()
                    : 'N/A'}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-gray-500">Next Send</p>
                <p className="font-medium text-gray-900 mt-1">
                  {nextPendingStep
                    ? new Date(nextPendingStep.scheduled_for).toLocaleString()
                    : 'No pending steps'}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-gray-500">Reply Pause Reason</p>
                <p className="font-medium text-gray-900 mt-1">
                  {sequenceRow.reply_pause_reason || 'None'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {sequenceStepRows.map((step) => (
                <div
                  key={step.id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      Step {step.step_number}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Status: {step.status}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Scheduled for: {new Date(step.scheduled_for).toLocaleString()}
                    </p>
                    {step.sent_at && (
                      <p className="text-sm text-gray-600 mt-1">
                        Sent at: {new Date(step.sent_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      step.status === 'sent'
                        ? 'bg-green-100 text-green-700'
                        : step.status === 'pending'
                        ? 'bg-gray-100 text-gray-700'
                        : step.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ReplyStatusToggle
        userId={params.userId}
        initialHasReplied={Boolean(profile.has_replied)}
      />

      <GenerateFollowUpButton userId={params.userId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lead Profile</h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium text-gray-900 mt-1">{displayName}</p>
            </div>

            <div>
              <p className="text-gray-500">Verified Contact Email</p>
              <p className="font-medium text-gray-900 mt-1 break-all">
                {profile.contact_email || 'Not available'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Contact Email Verified At</p>
              <p className="font-medium text-gray-900 mt-1">
                {profile.contact_email_verified_at
                  ? new Date(profile.contact_email_verified_at).toLocaleString()
                  : 'Not verified'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Reply Status</p>
              <p className="font-medium text-gray-900 mt-1">
                {profile.has_replied
                  ? `Marked replied${
                      profile.replied_at ? ` on ${new Date(profile.replied_at).toLocaleString()}` : ''
                    }`
                  : 'No reply marked'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Company</p>
              <p className="font-medium text-gray-900 mt-1">
                {profile.company || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium text-gray-900 mt-1">
                {profile.phone || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Tier</p>
              <p className="font-medium text-gray-900 mt-1">
                {profile.tier || 'free'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Interest Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {uniqueInterestTags.length > 0 ? (
                  uniqueInterestTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full text-xs font-medium bg-tre1-teal/10 text-tre1-teal"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No tags yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Signal Timeline</h2>

          {signalRows.length === 0 ? (
            <p className="text-gray-500">No signals recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {signalRows.map((signal) => {
                const detail = getSignalDetail(signal)

                return (
                  <div
                    key={signal.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatSignalLabel(signal)}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{detail.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{detail.subtitle}</p>
                      </div>

                      <div className="text-xs text-gray-500">
                        {new Date(signal.created_at).toLocaleString()}
                      </div>
                    </div>

                    {signal.metadata && Object.keys(signal.metadata).length > 0 && (
                      <div className="mt-3 rounded-md bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">Metadata</p>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                          {JSON.stringify(signal.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Audit History</h2>

        {(audits || []).length === 0 ? (
          <p className="text-gray-500">No audits found for this lead.</p>
        ) : (
          <div className="space-y-4">
            {(audits as AuditRow[]).map((audit) => (
              <div
                key={audit.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {audit.company_name || 'Unnamed company'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Status: {audit.status || 'unknown'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Submitted email: {audit.submitted_email || 'Not available'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Email verified: {audit.submitted_email_verified ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Report access granted: {audit.report_access_granted ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm text-gray-700 mt-3">
                      {audit.primary_pain || 'No primary pain point provided.'}
                    </p>
                  </div>

                  <div className="text-xs text-gray-500">
                    {audit.submitted_at
                      ? new Date(audit.submitted_at).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-4">Outreach History</h2>

  {(outreach || []).length === 0 ? (
    <p className="text-gray-500">No outreach sent yet.</p>
  ) : (
    <div className="space-y-4">
      {(outreach as OutreachRow[]).map((item) => {
        const angle = item.metadata?.angle || null
        const sequenceStep = item.metadata?.sequence_step || null

        const angleStyles: Record<string, string> = {
          upgrade: 'bg-purple-100 text-purple-700',
          implementation: 'bg-blue-100 text-blue-700',
          audit: 'bg-teal-100 text-teal-700',
          general: 'bg-gray-100 text-gray-700',
        }

        return (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900">{item.subject}</p>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.auto_generated
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.auto_generated ? 'Auto-generated' : 'Manual'}
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.outcome === 'replied'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {item.outcome || 'sent'}
                  </span>

                  {angle && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        angleStyles[angle] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Angle: {angle}
                    </span>
                  )}

                  {sequenceStep && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      Step {sequenceStep}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600">
                  To: {item.recipient_email}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <span>
                    Channel: {item.channel} • Status: {item.status}
                  </span>
                </div>

                <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-800 whitespace-pre-wrap">
                  {item.body}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </div>
          </div>
              )
            })}
          </div>
        )}
      </div>
  </div>
  )
}