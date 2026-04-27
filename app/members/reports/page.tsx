// app/members/reports/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  ArrowDownTrayIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

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

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [audit, setAudit] = useState<AuditData | null>(null)
  const [authEmail, setAuthEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReportData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setAuthEmail(user.email || null)

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

      if (linkedAudit) {
        setAudit(linkedAudit as AuditData)
        setLoading(false)
        return
      }

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

        setAudit((emailAudit || null) as AuditData | null)
      }

      setLoading(false)
    }

    loadReportData()
  }, [supabase])

  const firstName = useMemo(() => {
    return (
      profile?.first_name?.trim() ||
      profile?.display_name?.trim()?.split(' ')[0] ||
      authEmail?.split('@')[0] ||
      'Member'
    )
  }, [profile, authEmail])

  const submittedDate = formatDate(audit?.submitted_at || audit?.created_at || null)

  const timeWasters = audit?.time_wasters || []
  const currentTools = audit?.current_tools || []

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

  const recommendations = [
    audit?.primary_pain
      ? `Start by clarifying the workflow connected to "${audit.primary_pain}" and identifying the first repeatable step.`
      : 'Start by identifying the highest-friction workflow in your business.',
    timeWasters[0]
      ? `Prioritize automation around "${timeWasters[0]}" because it appears to be a recurring operational drag.`
      : 'Prioritize one repetitive task that happens every week.',
    currentTools.length
      ? `Review how ${currentTools[0]} fits into your workflow and whether it should trigger or receive automation updates.`
      : 'Document the tools currently involved in your intake, follow-up, or reporting workflow.',
  ]

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-8 shadow">
        <p className="text-gray-600">Loading your report…</p>
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
            <p className="text-gray-700 leading-7">
              This Initial Audit identifies the primary workflow constraints, tool stack signals,
              and repetitive tasks you submitted. The goal is to turn those inputs into a clear
              automation roadmap without overstating outcomes.
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
        <div className="mb-5 flex items-center gap-3">
          <DocumentTextIcon className="h-6 w-6 text-tre1-teal" />
          <h2 className="text-xl font-bold text-gray-900">Executive Summary</h2>
        </div>
        <p className="text-gray-700 leading-7">
          Based on your Initial Audit, your current automation opportunity appears to center on{' '}
          <span className="font-semibold text-gray-900">{fallback(audit.primary_pain)}</span>.
          Your submitted tools and time-wasters help identify where a focused automation system can reduce repetitive work and improve follow-through.
        </p>
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

      <section id="time-savings" className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex items-center gap-3">
          <ClockIcon className="h-6 w-6 text-tre1-teal" />
          <h2 className="text-xl font-bold text-gray-900">Potential Time Savings</h2>
        </div>

        <p className="text-gray-700 leading-7">
          This estimate is based on repetitive workflow signals submitted in your Initial Audit.
          It is not a guarantee, but it highlights where automation may reduce manual effort.
        </p>

        <div className="mt-5 space-y-3">
          {timeWasters.slice(0, 3).map((item, index) => (
            <div key={item} className="flex gap-3 rounded-lg bg-gray-50 p-4 text-gray-700">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tre1-teal/10 text-xs font-semibold text-tre1-teal">
                {index + 1}
              </span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="recommendations" className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex items-center gap-3">
          <SparklesIcon className="h-6 w-6 text-tre1-teal" />
          <h2 className="text-xl font-bold text-gray-900">Recommendations</h2>
        </div>

        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <div key={recommendation} className="flex gap-3 rounded-lg border border-gray-200 p-4 text-gray-700">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tre1-teal/10 text-xs font-semibold text-tre1-teal">
                {index + 1}
              </span>
              <p>{recommendation}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="consultation" className="rounded-2xl bg-tre1-teal p-8 text-white">
        <h2 className="text-2xl font-bold">Ready to turn this into an implementation plan?</h2>
        <p className="mt-3 max-w-3xl text-teal-50">
          Schedule a focused recap session to review your audit, identify the highest-leverage automation opportunity, and map your next step.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/members/billing"
            className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-tre1-teal transition hover:bg-gray-100"
          >
            Schedule Consultation
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/members/library"
            className="inline-flex items-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
          >
            Browse Resources
          </Link>
        </div>
      </section>
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