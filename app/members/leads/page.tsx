import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/server/supabase'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  FireIcon,
  ChartBarIcon,
  BoltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { calculateLeadScore } from '@/lib/leadScore'
import { detectSequenceAngle } from '@/lib/sequences'
import ProcessSequencesButton from '@/components/ProcessSequencesButton'

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

type ProfileRow = {
  id: string
  tier: string | null
  display_name: string | null
  first_name: string | null
  last_name: string | null
  contact_email: string | null
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
  submitted_by_user_id: string | null
}

type LeadRow = {
  userId: string
  name: string
  email: string
  tier: string
  score: number
  label: string
  latestSignal: string
  latestSource: string
  latestAt: string
  angle: string
}

function getActivityStatus(date?: string) {
  if (!date) return { label: 'No activity', color: 'gray' }

  const diff = Date.now() - new Date(date).getTime()
  const days = diff / (1000 * 60 * 60 * 24)

  if (days < 1) return { label: 'Active', color: 'green' }
  if (days < 3) return { label: 'Recent', color: 'yellow' }
  return { label: 'Cold', color: 'gray' }
}

export default async function LeadsPage() {
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

  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, tier, display_name, first_name, last_name, contact_email')

  const { data: signals, error: signalsError } = await admin
    .from('engagement_signals')
    .select('id, user_id, source_type, source_id, signal_type, signal_value, created_at, metadata')
    .order('created_at', { ascending: false })

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
      budget,
      submitted_by_user_id
    `)
    .order('submitted_at', { ascending: false })

  if (profilesError) {
    console.error('Profiles query error:', profilesError)
  }

  if (signalsError) {
    console.error('Signals query error:', signalsError)
  }

  if (auditsError) {
    console.error('Audits query error:', auditsError)
  }

  const profileMap = new Map<string, ProfileRow>()
  ;(profiles || []).forEach((profile) => {
    profileMap.set(profile.id, profile as ProfileRow)
  })

  const groupedSignals = new Map<string, SignalRow[]>()
  ;((signals || []) as SignalRow[]).forEach((signal) => {
    const existing = groupedSignals.get(signal.user_id) || []
    existing.push(signal)
    groupedSignals.set(signal.user_id, existing)
  })

  const auditMap = new Map<string, AuditRow>()
  ;((audits || []) as AuditRow[]).forEach((audit) => {
    if (audit.submitted_by_user_id && !auditMap.has(audit.submitted_by_user_id)) {
      auditMap.set(audit.submitted_by_user_id, audit)
    }
  })

  const leads: LeadRow[] = Array.from(groupedSignals.entries()).map(
    ([userId, userSignals]) => {
      const profile = profileMap.get(userId)
      const latestAudit = auditMap.get(userId) || null

      const scoreResult = calculateLeadScore(userSignals)
      const latest = userSignals[0]
      const angle = detectSequenceAngle(userSignals, latestAudit)

      const name =
        profile?.display_name ||
        [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
        profile?.contact_email ||
        userId

      return {
        userId,
        name,
        email: profile?.contact_email || 'Not available',
        tier: profile?.tier || 'free',
        score: scoreResult.score,
        label: scoreResult.label,
        latestSignal: latest?.signal_type || 'unknown',
        latestSource: latest?.source_type || 'unknown',
        latestAt: latest?.created_at || '',
        angle,
      }
    }
  )

  leads.sort((a, b) => b.score - a.score)

  const hotLeads = leads.filter((lead) => lead.label === 'Hot')
  const warmLeads = leads.filter((lead) => lead.label === 'Warm')
  const coldLeads = leads.filter((lead) => lead.label === 'Cold')

  const labelStyles: Record<string, string> = {
    Hot: 'bg-red-100 text-red-700',
    Warm: 'bg-amber-100 text-amber-700',
    Cold: 'bg-gray-100 text-gray-700',
  }

  const tierStyles: Record<string, string> = {
    free: 'bg-gray-100 text-gray-800',
    starter: 'bg-green-100 text-green-800',
    growth: 'bg-blue-100 text-blue-800',
    enterprise: 'bg-purple-100 text-purple-800',
  }

  const angleStyles: Record<string, string> = {
    upgrade: 'bg-purple-100 text-purple-700',
    implementation: 'bg-blue-100 text-blue-700',
    audit: 'bg-teal-100 text-teal-700',
    general: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Intelligence</h1>
            <p className="text-gray-600 mt-2">
              Internal view of scored leads based on downloads, locked clicks, and intent signals.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/members/leads/analytics"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-tre1-teal text-white hover:bg-teal-600 transition"
            >
              View Analytics
            </Link>

            <Link
              href="/members/library"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 transition"
            >
              Back to Library
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-2xl font-bold mt-1">{leads.length}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-tre1-dark" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hot Leads</p>
              <p className="text-2xl font-bold mt-1">{hotLeads.length}</p>
            </div>
            <FireIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Warm Leads</p>
              <p className="text-2xl font-bold mt-1">{warmLeads.length}</p>
            </div>
            <BoltIcon className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cold Leads</p>
              <p className="text-2xl font-bold mt-1">{coldLeads.length}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      <ProcessSequencesButton/>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="border-b px-6 py-4 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Lead Table</h2>
          <p className="text-sm text-gray-600 mt-1">
            Sorted by highest score first.
          </p>
        </div>

        {leads.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No lead signals yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-6 py-4 font-medium">Lead</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Tier</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Angle</th>
                  <th className="px-6 py-4 font-medium">Latest Signal</th>
                  <th className="px-6 py-4 font-medium">Source</th>
                  <th className="px-6 py-4 font-medium">Activity</th>
                  <th className="px-6 py-4 font-medium">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead) => (
                  <tr key={lead.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/members/leads/${lead.userId}`} className="block">
                        <div className="font-medium text-tre1-teal hover:underline">
                          {lead.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{lead.userId}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {lead.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tierStyles[lead.tier] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {lead.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {lead.score}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          labelStyles[lead.label] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lead.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          angleStyles[lead.angle] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lead.angle}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {lead.latestSignal}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {lead.latestSource}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const status = getActivityStatus(lead.latestAt)

                        return (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status.color === 'green'
                                ? 'bg-green-100 text-green-700'
                                : status.color === 'yellow'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {status.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {lead.latestAt
                        ? new Date(lead.latestAt).toLocaleString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}