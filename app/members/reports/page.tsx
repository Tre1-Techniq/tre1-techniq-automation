// app/members/reports/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  ArrowDownTrayIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

import UpgradePrompt from '@/components/UpgradePrompt'

import {
  calculateAutomationReadiness,
  getScoreAwareRecommendations,
  addToolContextToRecommendations,
} from '@/lib/reports/automationReadiness'

import { calculateTimeSavings } from '@/lib/reports/timeSavings'

type ProfileData = {
  tier: string | null
  first_name: string | null
  last_name: string | null
  display_name: string | null
  contact_email: string | null
}

type AuditData = {
  id: string
  created_at: string | null
  submitted_at: string | null
  company_name: string | null
  industry: string | null
  company_size: string | null
  primary_pain: string | null
  time_wasters: string[] | null
  current_tools: string[] | null
  automation_goals: string | null
  integration_needs: string | null
  budget: string | null
  report_access_token: string | null
  report_access_granted: boolean | null
  status: string | null
}

type DisplayRecommendation = {
  title: string
  why: string
  nextStep: string
  toolContext?: string
  suggestedPath?: string
}

function formatDate(value: string | null) {
  if (!value) return 'Pending'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Pending' : date.toLocaleDateString()
}

function fallback(value: string | null | undefined) {
  return value?.trim() || '—'
}

export default function ReportsPage() {
  const supabase = createClient()

  const [authEmail, setAuthEmail] = useState<string | null>(null)
  const [summaryChecked, setSummaryChecked] = useState(false)

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [audit, setAudit] = useState<AuditData | null>(null)

  const [aiSummary, setAiSummary] = useState<{
    executive_summary: string
    recommendations: string[]
    readiness_score?: number
    readiness_band?: string
    readiness_summary?: string
    readiness_factors?: {
      label: string
      points: number
      max: number
      detail: string
    }[]
    unlocked?: boolean
  } | null>(null)

  const [loading, setLoading] = useState(true)

  const aiSummaryRequested = useRef(false)


useEffect(() => {
  async function loadReportData() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('tier, first_name, last_name, display_name, contact_email')
      .eq('id', user.id)
      .maybeSingle()

    setProfile((profileData || null) as ProfileData | null)

    const auditSelect =
      'id, created_at, submitted_at, company_name, industry, company_size, primary_pain, time_wasters, current_tools, automation_goals, integration_needs, budget, report_access_token, report_access_granted, status'

    const { data: linkedAudit } = await supabase
      .from('audit_requests')
      .select(auditSelect)
      .eq('submitted_by_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let resolvedAudit = linkedAudit as AuditData | null

    if (!resolvedAudit) {
      const emailCandidates = Array.from(
        new Set(
          [user.email, profileData?.contact_email]
            .map((email) => email?.trim().toLowerCase())
            .filter(Boolean) as string[]
        )
      )

      if (emailCandidates.length > 0) {
        const orFilter = emailCandidates
          .flatMap((email) => [`contact_email.eq.${email}`, `submitted_email.eq.${email}`])
          .join(',')

        const { data: emailAudit } = await supabase
          .from('audit_requests')
          .select(auditSelect)
          .or(orFilter)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        resolvedAudit = emailAudit as AuditData | null
      }
    }

    const response = await fetch('/api/reports/ai-summary')

    if (resolvedAudit) {
      setAudit(resolvedAudit)

      try {
        if (aiSummaryRequested.current) return
        aiSummaryRequested.current = true

        if (response.ok) {
          const data = await response.json()

          setAiSummary({
            executive_summary: data.executive_summary,
            recommendations: data.recommendations || [],
            readiness_score: data.readiness_score,
            readiness_band: data.readiness_band,
            readiness_summary: data.readiness_summary,
            readiness_factors: data.readiness_factors || [],
            unlocked: data.unlocked === true,
          })

          console.log('AI summary payload:', data)
          
        }
      } catch (error) {
        console.warn('AI summary unavailable, using deterministic fallback:', error)
      }
    }

    setLoading(false)
  }

  loadReportData()
}, [supabase])

  const submittedDate = formatDate(audit?.submitted_at || audit?.created_at || null)
  const tier = profile?.tier || 'free'
  const isPaid = tier === 'starter' || tier === 'growth' || tier === 'enterprise'

  const isReportUnlocked = aiSummary?.unlocked === true
  const canViewPremiumReport = isPaid || isReportUnlocked

  const readiness = audit ? calculateAutomationReadiness(audit) : null

  const scoreAwareRecommendations = readiness
  ? getScoreAwareRecommendations(readiness)
  : []

  const timeWasters = audit?.time_wasters || []
  const currentTools = audit?.current_tools || []

  const toolAwareRecommendations =
  scoreAwareRecommendations.length > 0
    ? addToolContextToRecommendations({
        recommendations: scoreAwareRecommendations,
        currentTools,
      })
    : []

  const readinessScore = readiness?.score ?? 0
  const upgradeContext = getUpgradeContext(readinessScore)

  const findings = [
    audit?.primary_pain
      ? `Your primary workflow concern is centered on: ${audit.primary_pain}`
      : null,
    timeWasters.length
      ? `You identified ${timeWasters.length} recurring time-waster${timeWasters.length === 1 ? '' : 's'} that may be candidates for automation.`
      : null,
    currentTools.length
      ? `Your current stack includes ${currentTools.slice(0, 3).join(', ')}${currentTools.length > 3 ? ', and more' : ''}.`
      : null,
    audit?.integration_needs
      ? `Your integration needs suggest an opportunity to connect existing tools into a more reliable workflow.`
      : null,
  ].filter(Boolean) as string[]

  const recommendations: DisplayRecommendation[] = [
    {
      title: 'Review your Initial Audit findings',
      why: 'Your audit inputs identify the main workflow areas that may benefit from automation.',
      nextStep: 'Review your report sections and note the workflow with the clearest friction.',
    },
    {
      title: 'Prioritize your highest-friction workflow',
      why: 'Automation works best when it starts with a repeatable workflow problem.',
      nextStep: 'Choose one bottleneck to address first instead of trying to automate everything.',
    },
    {
      title: 'Match your current tools to recommended resources',
      why: 'Your tool stack helps determine which automation paths are practical.',
      nextStep: 'Compare your current tools against the suggested resource library.',
    },
  ]

const displayedRecommendations: DisplayRecommendation[] =
  toolAwareRecommendations.length > 0
    ? toolAwareRecommendations
    : aiSummary?.recommendations?.length
      ? aiSummary.recommendations.map((item) => ({
          title: item,
          why: 'This recommendation is based on your Initial Audit inputs.',
          nextStep: 'Review the related workflow and identify the first action you can take.',
          toolContext: 'Tool-aware guidance will appear here once your submitted stack is mapped.',
          suggestedPath: 'Start by identifying the workflow trigger, manual handoff, and desired result.',
        }))
      : recommendations

  const displayedExecutiveSummary =
  aiSummary?.executive_summary || 'Loading your saved report summary...'

  console.log('LIVE readiness:', readiness?.score)
  console.log('DB readiness:', aiSummary?.readiness_score)

  const timeSavings = audit ? calculateTimeSavings(audit) : null

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-8 shadow">
        <p className="text-gray-600">Loading your report...</p>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Initial Audit Report</h1>
        <p className="mt-3 text-gray-600">
          Your audit report is not available yet. Return to the dashboard or complete your Initial Audit.
        </p>
        <Link
          href="/members"
          className="mt-6 inline-flex items-center rounded-full bg-tre1-teal/10 px-4 py-2 text-sm font-semibold text-tre1-teal transition hover:bg-tre1-teal hover:text-white"
        >
          Back to Dashboard
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-8 shadow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-tre1-teal">
              Initial Audit Report
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {fallback(audit.company_name)}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Prepared for {fallback(audit.company_name)} · Submitted {submittedDate}
            </p>
          </div>

          <a
            href="/api/reports/pdf"
            className="inline-flex items-center justify-center rounded-full bg-tre1-teal/10 px-4 py-2 text-sm font-semibold text-tre1-teal transition hover:bg-tre1-teal hover:text-white"
          >
            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
            Download PDF
          </a>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Submitted</p>
            <p className="mt-1 font-semibold text-gray-900">{submittedDate}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Status</p>
            <p className="mt-1 font-semibold capitalize text-gray-900">{audit.status || 'submitted'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Access</p>
            <p className="mt-1 font-semibold text-gray-900">
              {audit.report_access_granted ? 'Granted' : 'Pending'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <ChartBarIcon className="h-6 w-6 text-tre1-teal" />
              <h2 className="text-xl font-bold text-gray-900">Automation Readiness</h2>
            </div>

            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold tracking-tight text-gray-900">
                {readiness ? `${readiness.score}%` : '...'}
              </span>
              <span className="pb-2 text-sm font-semibold text-tre1-teal">
                {readiness?.band || upgradeContext.label}
              </span>
            </div>

            <p className="mt-4 max-w-[100%] text-gray-700 leading-7">
              {readiness?.summary || upgradeContext.message}
            </p>
          </div>
        </div>

        {canViewPremiumReport ? (
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 md:grid-cols-2">
            {(readiness?.factors || []).map((factor) => (
              <div key={factor.label} className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-gray-900">{factor.label}</p>
                  <p className="text-sm font-bold text-tre1-teal">
                    {factor.points}/{factor.max}
                  </p>
                </div>
                <p className="mt-2 text-sm text-gray-600">{factor.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            {!canViewPremiumReport && (
              <UpgradePrompt
                title="Unlock Readiness Details"
                body="See the detailed factors behind your readiness score, including process clarity, tool stack strength, execution readiness, and where your system needs the most improvement."
                cta="Unlock Readiness Details"
              />
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex items-center gap-3">
          <DocumentTextIcon className="h-6 w-6 text-tre1-teal" />
          <h2 className="text-xl font-bold text-gray-900">Executive Summary</h2>
        </div>

        {!aiSummary ? (
          <div className="space-y-3">
            <div className="h-4 max-w-[75%] animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-10/12 animate-pulse rounded bg-gray-100" />
          </div>
        ) : (
          <div
            className="text-gray-700 leading-7 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: displayedExecutiveSummary }}
          />
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-5 flex items-center gap-3">
            <BriefcaseIcon className="h-6 w-6 text-tre1-teal" />
            <h2 className="text-xl font-bold text-gray-900">Company Context</h2>
          </div>
          <div className="space-y-4 text-sm">
            <ReportRow label="Company" value={audit.company_name} />
            <ReportRow label="Industry" value={audit.industry} />
            <ReportRow label="Company Size" value={audit.company_size} />
            <ReportRow label="Budget" value={audit.budget} />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-5 flex items-center gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-tre1-teal" />
            <h2 className="text-xl font-bold text-gray-900">Workflow Friction</h2>
          </div>
          <div className="space-y-4 text-sm">
            <ReportRow label="Major Pain Point" value={audit.primary_pain} />
            <ReportList label="Time Wasters" items={timeWasters} />
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex items-center gap-3">
          <CogIcon className="h-6 w-6 text-tre1-teal" />
          <h2 className="text-xl font-bold text-gray-900">Current Stack & Goals</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ReportList label="Current Tools" items={currentTools} />
          <ReportRow label="Automation Goals" value={audit.automation_goals} />
          <ReportRow label="Integration Needs" value={audit.integration_needs} />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex items-center gap-3">
          <ClipboardDocumentListIcon className="h-6 w-6 text-tre1-teal" />
          <h2 className="text-xl font-bold text-gray-900">Key Findings</h2>
        </div>

        <div className="space-y-3">
          {findings.map((finding, index) => (
            <div key={finding} className="flex gap-3 rounded-lg bg-gray-50 p-4 text-gray-700">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tre1-teal/10 text-xs font-semibold text-tre1-teal">
                {index + 1}
              </span>
              <p>{finding}</p>
            </div>
          ))}
        </div>
      </section>

      {canViewPremiumReport ? (
        <section id="time-savings" className="rounded-xl bg-white p-6 shadow">
          <div className="mb-5 flex items-center gap-3">
            <ClockIcon className="h-6 w-6 text-tre1-teal" />
            <h2 className="text-xl font-bold text-gray-900">Potential Time Savings</h2>
          </div>

          <p className="text-gray-700 leading-7">
            {timeSavings?.summary ||
              'This estimate is based on repetitive workflow signals submitted in your Initial Audit.'}
          </p>

          <div className="mt-5 space-y-3">
            {(timeSavings?.tasks || []).slice(0, 3).map((item, index) => (
              <div key={item} className="flex gap-3 rounded-lg bg-gray-50 p-4 text-gray-700">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tre1-teal/10 text-xs font-semibold text-tre1-teal">
                  {index + 1}
                </span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section id="time-savings" className="rounded-xl bg-white p-6 shadow">
          <div className="mb-5 flex items-center gap-3">
            <ClockIcon className="h-6 w-6 text-tre1-teal" />
            <h2 className="text-xl font-bold text-gray-900">Potential Time Savings</h2>
          </div>

          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold tracking-tight text-gray-900">
              {timeSavings ? timeSavings.hoursPerWeek : '...'}
            </span>
            <span className="pb-1 text-sm font-semibold text-gray-700">hrs</span>
            <span className="pb-1 text-sm text-gray-500">/week</span>
          </div>

          <p className="mt-4 max-w-3xl text-gray-700 leading-7">
            {timeSavings?.summary ||
              'Your audit identified repetitive workflow signals that may be good candidates for automation.'}
          </p>

          <div className="mt-6 rounded-lg bg-gray-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Locked Feature
            </p>

            <div className="mt-3">
              <UpgradePrompt
                title="Unlock your time-saving breakdown"
                body="See which workflows are costing the most time and where automation may have the highest impact."
                cta="Unlock Breakdown"
              />
            </div>
          </div>
        </section>
      )}

      <section id="recommendations" className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex items-center gap-3">
          <SparklesIcon className="h-6 w-6 text-tre1-teal" />
          <h2 className="text-xl font-bold text-gray-900">Recommendations</h2>
        </div>

        {(isPaid ? displayedRecommendations : displayedRecommendations.slice(0, 1)).map((recommendation, index) => (
          <div
            key={`${recommendation.title}-${index}`}
            className="rounded-lg border border-gray-200 p-5 text-gray-700"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tre1-teal/10 text-xs font-semibold text-tre1-teal">
                {index + 1}
              </span>

              <p className="font-semibold text-gray-900">
                {recommendation.title}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-tre1-teal">
                  Tool context
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {recommendation.toolContext || recommendation.why}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-tre1-teal">
                  Suggested path
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {recommendation.suggestedPath || recommendation.why}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-tre1-teal">
                  Next step
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {recommendation.nextStep}
                </p>
              </div>
            </div>
          </div>
        ))}

        {!canViewPremiumReport && (
          <UpgradePrompt
            title="Unlock your full recommendation set"
            body="You’re seeing the first recommendation. Unlock the full set to view the next actions based on your audit."
            cta="Unlock Recommendations"
          />
        )}
      </section>

      {canViewPremiumReport ? (
        <section id="automation-blueprint" className="rounded-xl bg-white p-6 shadow">
          <div className="mb-5 flex items-center gap-3">
            <ClipboardDocumentListIcon className="h-6 w-6 text-tre1-teal" />
            <h2 className="text-xl font-bold text-gray-900">Automation Blueprint</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              'Primary automation target',
              'Suggested workflow structure',
              'Tools and integrations',
              'Implementation phases',
            ].map((item, index) => (
              <div key={item} className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-semibold text-tre1-teal">Phase {index + 1}</p>
                <p className="mt-1 text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section id="automation-blueprint" className="rounded-xl bg-white p-6 shadow">
          <div className="mb-5 flex items-center gap-3">
            <ClipboardDocumentListIcon className="h-6 w-6 text-tre1-teal" />
            <h2 className="text-xl font-bold text-gray-900">Automation Blueprint</h2>
          </div>

          <p className="max-w-[75%] text-gray-700 leading-7">
            Your current stack includes{' '}
            <span className="font-semibold text-gray-900">
              {currentTools.length > 0 ? currentTools.slice(0, 3).join(', ') : 'tools that can be mapped into an automation workflow'}
            </span>
            . Based on your audit signals, there are likely opportunities to improve handoffs,
            reduce manual work, or clarify system responsibilities.
          </p>

          <div className="mt-6 rounded-lg bg-gray-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Locked Feature
            </p>

            <div className="mt-3">
              <UpgradePrompt
                title="Unlock your automation blueprint"
                body="Turn your audit into a structured plan with workflow targets, integrations, and implementation steps."
                cta="Unlock Blueprint"
              />
            </div>
          </div>
        </section>
      )}

      {!canViewPremiumReport && (
        <section className="rounded-xl bg-white p-8 shadow text-center">
          <div className="mb-5 flex items-center gap-3">
            <CogIcon className="h-6 w-6 text-tre1-teal" />
            <h2 className="text-xl font-bold text-gray-900">
              Ready to turn this audit into an automation plan?
            </h2>
          </div>
          <UpgradePrompt
            title="Unlock Your Full Report"
            body="Unlock the full implementation path, recommendations, time savings breakdown, and next-step guidance based on your audit."
            cta="Unlock Full Report"
          />
        </section>
      )}
    </div>
  )
}



function ReportRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-gray-800">{fallback(value)}</p>
    </div>
  )
}

function ReportList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-tre1-teal/10 px-3 py-1 text-xs font-medium text-tre1-teal"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-gray-800">—</p>
      )}
    </div>
  )
}

function getUpgradeContext(score: number) {
  if (score < 40) {
    return {
      label: 'Early Stage',
      message:
        'You’re at the early stage — unlocking your blueprint will clarify your first automation opportunity.',
    }
  }

  if (score < 60) {
    return {
      label: 'Emerging',
      message:
        'You’re close — the next recommendations can move you into a stronger automation position.',
    }
  }

  if (score < 80) {
    return {
      label: 'Ready',
      message:
        'You have enough clarity — unlock your blueprint to begin structured implementation.',
    }
  }

  return {
    label: 'High Readiness',
    message:
      'You’re ready to execute — unlock your roadmap to move quickly into implementation.',
  }
}