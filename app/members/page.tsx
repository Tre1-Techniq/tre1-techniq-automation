// app/members/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  CreditCardIcon,
  UserGroupIcon,
  BellIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

import {
  calculateAutomationReadiness,
  getScoreAwareRecommendations,
  addToolContextToRecommendations,
} from '@/lib/reports/automationReadiness'

import { calculateTimeSavings } from '@/lib/reports/timeSavings'

export const dynamic = 'force-dynamic'

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
  first_name: string | null
  last_name: string | null
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
}

export default function MembersDashboard() {
  const supabase = createClient()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [audit, setAudit] = useState<AuditData | null>(null)
  const [authEmail, setAuthEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
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
        'id, created_at, submitted_at, first_name, last_name, company_name, industry, company_size, primary_pain, time_wasters, current_tools, automation_goals, integration_needs, budget, report_access_token'

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

    loadDashboardData()
  }, [supabase])

  const tier = profile?.tier || 'free'
  const isPaid = tier === 'starter' || tier === 'growth' || tier === 'enterprise'

  const firstName = useMemo(() => {
    return (
      profile?.first_name?.trim() ||
      audit?.first_name?.trim() ||
      profile?.display_name?.trim()?.split(' ')[0] ||
      authEmail?.split('@')[0] ||
      'Member'
    )
  }, [profile, audit, authEmail])

  const memberSince = useMemo(() => {
    const rawDate = audit?.created_at || audit?.submitted_at
    if (!rawDate) return 'Pending'

    const date = new Date(rawDate)
    if (Number.isNaN(date.getTime())) return 'Pending'

    return date.toLocaleDateString()
  }, [audit])

  const messageCount = 0
  const hasNewMessages = false

  const quickActions = [
    {
      title: 'Automation Library',
      desc: 'Browse automation templates',
      icon: DocumentTextIcon,
      href: '/members/library',
      color: 'bg-tre1-teal',
    },
    {
      title: 'Account Settings',
      desc: 'Update profile & preferences',
      icon: CogIcon,
      href: '/members/settings',
      color: 'bg-gray-600',
    },
    {
      title: 'Billing',
      desc: 'Manage subscription & payments',
      icon: CreditCardIcon,
      href: '/members/billing',
      color: 'bg-green-500',
    },
    {
      title: 'Community',
      desc: 'Connect with other members',
      icon: UserGroupIcon,
      href: '/members/community',
      color: 'bg-purple-500',
    },
  ]

  const readiness = audit ? calculateAutomationReadiness(audit) : null

  const recentActivity = [
    { action: 'Account created', time: 'Just now', icon: '🎉' },
    { action: 'Accessed PDF library', time: '5 min ago', icon: '📚' },
    { action: 'Completed profile setup', time: '10 min ago', icon: '✅' },
  ]

  const scoreAwareRecommendations = readiness
  ? getScoreAwareRecommendations(readiness)
  : []

  const timeSavings = audit ? calculateTimeSavings(audit) : null

  const toolAwareRecommendations =
  scoreAwareRecommendations.length > 0
    ? addToolContextToRecommendations({
        recommendations: scoreAwareRecommendations,
        currentTools: audit?.current_tools,
      })
    : []

  const recommendations =
  toolAwareRecommendations.length > 0
    ? toolAwareRecommendations
    : [
        {
          title: 'Review your Initial Audit findings',
          why: 'Your audit inputs provide the foundation for your automation plan.',
          nextStep: 'Open your report and review the highest-friction workflow areas.',
        },
        {
          title: 'Prioritize your highest-friction workflow',
          why: 'Starting with the biggest bottleneck usually creates the clearest first win.',
          nextStep: 'Choose one workflow to improve before adding more automation ideas.',
        },
        {
          title: 'Match your tools to recommended resources',
          why: 'Tool alignment helps avoid building automation around disconnected systems.',
          nextStep: 'Review the library for resources that match your current workflow stack.',
        },
      ]

  const visibleRecommendations = isPaid ? recommendations : recommendations.slice(0, 1)

  const timeSavingTasks = [
    ...(audit?.time_wasters || []),
    audit?.primary_pain,
  ].filter(Boolean) as string[]

  const visibleTimeSavingTasks = isPaid ? (timeSavings?.tasks || []).slice(0, 2) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-8">
          <section className="rounded-2xl bg-gradient-to-r from-tre1-teal to-teal-600 p-8 text-white">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="w-full">
                <h1 className="mb-2 text-3xl font-bold">
                  Welcome {loading ? 'Member' : firstName}!
                </h1>

                <p className="text-teal-100">
                  Your automation journey starts here. Explore resources, tools, and community.
                </p>

                <div className="mt-6 border-t border-white/30 pt-5">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 font-semibold text-white">
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                    </span>

                    <Link
                      href="/members/reports"
                      className="inline-flex items-center rounded-full bg-white px-3 py-1 font-semibold text-tre1-teal transition hover:bg-gray-100"
                    >
                      Unlock Report
                    </Link>

                    <span className="hidden h-5 w-px bg-white/30 sm:inline-block" />

                    <span className="inline-flex items-center text-teal-50">
                      <CheckCircleIcon className="mr-2 h-4 w-4" />
                      Member Since: {memberSince}
                    </span>

                    <span className="hidden h-5 w-px bg-white/30 sm:inline-block" />

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 font-semibold text-white ${
                        hasNewMessages ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    >
                      {messageCount}
                    </span>

                    <Link
                      href="/members/messages"
                      className="inline-flex items-center font-semibold text-white transition hover:text-orange-200"
                    >
                      Messages
                      <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/members/reports"
                className="mt-2 inline-flex shrink-0 items-center rounded-lg bg-white px-6 py-3 font-semibold text-tre1-teal transition hover:bg-gray-100 md:mt-0"
              >
                Review Your Audit <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex h-full flex-col rounded-xl bg-white p-6 shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-tre1-teal">Automation Readiness</p>
                  <p className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
                    {readiness ? `${readiness.score}%` : '...'}
                  </p>
                </div>

                <ChartBarIcon className="h-10 w-10 text-tre1-teal" />
              </div>

              <div className="mt-5 pb-5 pt-4">
                {isPaid ? (
                  <p className="text-sm text-gray-600">
                    Based on your workflow inputs, tool usage, and automation readiness signals.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    🔒 Unlock full readiness assessment.
                  </p>
                )}
              </div>

              <Link
                href="/members/reports#consultation"
                className="mt-auto inline-flex items-center justify-center rounded-full bg-tre1-teal/10 px-4 py-2 text-sm font-semibold text-tre1-teal transition hover:bg-tre1-teal hover:text-white"
              >
                {isPaid ? 'Book a Consultation' : 'Unlock Details'}
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="flex h-full flex-col rounded-xl bg-white p-6 shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-tre1-teal">PDFs Accessed</p>

                  <div className="mt-3">
                    <p className="text-4xl font-bold tracking-tight text-gray-900">2/2</p>
                    <p className="text-xs text-gray-500">Free PDFs</p>
                  </div>

                  <div className="mt-4">
                    <p className="text-4xl font-bold tracking-tight text-gray-900">0/1</p>
                    <p className="text-xs text-gray-500">Premium PDFs</p>
                  </div>
                </div>

                <DocumentTextIcon className="h-10 w-10 text-tre1-teal" />
              </div>

              <Link
                href="/members/library"
                className="mt-auto inline-flex items-center justify-center rounded-full bg-tre1-teal/10 px-4 py-2 text-sm font-semibold text-tre1-teal transition hover:bg-tre1-teal hover:text-white"
              >
                Visit the Library
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="flex h-full flex-col rounded-xl bg-white p-6 shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-tre1-teal">Potential Time Saved</p>

                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      {timeSavings ? timeSavings.hoursPerWeek : '...'}
                    </span>
                    <span className="pb-1 text-sm font-semibold text-gray-700">hrs</span>
                    <span className="pb-1 text-sm text-gray-500">/week</span>
                  </div>
                </div>

                <ClockIcon className="h-10 w-10 text-tre1-teal" />
              </div>

              <div className="mt-5 pb-5 pt-4">
                <p className="mb-3 text-xs text-gray-500">
                  * based on task automation:
                </p>

                {isPaid ? (
                  <div className="space-y-2">
                    {visibleTimeSavingTasks.map((task, index) => (
                      <div
                        key={`${task}-${index}`}
                        className="flex items-start gap-3 text-sm text-gray-700"
                      >
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tre1-teal/10 text-xs font-semibold text-tre1-teal">
                          {index + 1}
                        </span>
                        <span className="line-clamp-2">{task}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    🔒 Unlock time-saving breakdown.
                  </p>
                )}
              </div>

              <Link
                href="/members/reports#time-savings"
                className="mt-auto inline-flex items-center justify-center rounded-full bg-tre1-teal/10 px-4 py-2 text-sm font-semibold text-tre1-teal transition hover:bg-tre1-teal hover:text-white"
              >
                {isPaid ? 'View Your Detailed Report' : 'Unlock Breakdown'}
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="flex h-full flex-col rounded-xl bg-white p-6 shadow">
              <div className="flex items-start justify-between">
                <p className="text-sm font-bold text-tre1-teal">Recommendations</p>
                <SparklesIcon className="h-10 w-10 text-tre1-teal" />
              </div>

              <div className="mt-5 mb-6 pt-4 space-y-2">
                {visibleRecommendations.map((recommendation, index) => (
                  <Link
                    key={`${recommendation.title}-${index}`}
                    href="/members/reports#recommendations"
                    className="flex items-center gap-3 rounded-lg text-sm text-gray-700 transition hover:text-tre1-teal"
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tre1-teal/10 text-xs font-semibold text-tre1-teal">
                      {index + 1}
                    </span>
                    <span className="line-clamp-1">{recommendation.title}</span>
                  </Link>
                ))}

                {!isPaid && (
                  <p className="pt-4 text-xs text-gray-500">
                    🔒 Unlock recommendations 2 and 3.
                  </p>
                )}
              </div>

              <Link
                href="/members/reports#recommendations"
                className="mt-auto inline-flex items-center justify-center rounded-full bg-tre1-teal/10 px-4 py-2 text-sm font-semibold text-tre1-teal transition hover:bg-tre1-teal hover:text-white"
              >
                {isPaid ? 'View Details' : 'Unlock Full List'}
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Quick Actions</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`${action.color} rounded-lg p-3`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 transition group-hover:text-tre1-teal">
                          {action.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">{action.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 rounded-xl bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Recent Activity</h2>

                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.action}
                      className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{activity.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="h-full rounded-xl bg-white p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Initial Audit Recap
                  </h2>

                  <DocumentTextIcon className="h-6 w-6 text-tre1-teal" />
                </div>

                <div className="space-y-6 text-sm text-gray-700">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Company
                    </p>
                    <p>{audit?.company_name || '—'}</p>
                  </div>

                  <div className="pb-5 border-b border-gray-100">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Major Pain Point
                    </p>
                    <p>{audit?.primary_pain || '—'}</p>
                  </div>

                  <div className="pb-5 border-b border-gray-100">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Time Wasters
                    </p>

                    {(audit?.time_wasters || []).slice(0, 3).map((item, index) => (
                        <div key={`${item}-${index}`} className="flex items-start gap-3 mt-1 mb-1">
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tre1-teal/10 text-xs font-semibold text-tre1-teal">
                            {index + 1}
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                  </div>

                  <div className="pb-5 border-b border-gray-100">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Current Tools
                    </p>

                    {(audit?.current_tools || []).slice(0, 3).map((tool, index) => (
                      <div key={`${tool}-${index}`} className="flex items-start gap-3 mt-1 mb-1">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tre1-teal/10 text-xs font-semibold text-tre1-teal">
                          {index + 1}
                        </span>
                        <span>{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/members/reports"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-tre1-teal/10 px-4 py-2 text-sm font-semibold text-tre1-teal transition hover:bg-tre1-teal hover:text-white"
                >
                  View Full Audit
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}