'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type StatBucket = {
  sent: number
  replied: number
  replyRate: number
}

type AnalyticsResponse = {
  totals: {
    sent: number
    replied: number
    replyRate: number
  }
  angleStats: Record<string, StatBucket>
  stepStats: Record<string, StatBucket>
}

export default function LeadAnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch('/api/leads/analytics')
        const json = await response.json()

        if (!response.ok) {
          throw new Error(json.error || 'Failed to load analytics')
        }

        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const angleChartData = useMemo(() => {
    if (!data) return []

    return Object.entries(data.angleStats).map(([angle, stat]) => ({
      name: angle,
      sent: stat.sent,
      replied: stat.replied,
      replyRate: stat.replyRate,
    }))
  }, [data])

  const stepChartData = useMemo(() => {
    if (!data) return []

    return Object.entries(data.stepStats)
      .sort((a, b) => {
        if (a[0] === 'unknown') return 1
        if (b[0] === 'unknown') return -1
        return Number(a[0]) - Number(b[0])
      })
      .map(([step, stat]) => ({
        rawStep: step,
        name: step === 'unknown' ? 'Unknown' : `Step ${step}`,
        sent: stat.sent,
        replied: stat.replied,
        replyRate: stat.replyRate,
      }))
  }, [data])

  const winningAngle = useMemo(() => {
    if (!angleChartData.length) return null

    const eligibleAngles = angleChartData.filter(
      (item) => item.name !== 'unknown' && item.sent > 0
    )

    if (!eligibleAngles.length) return null

    const ranked = [...eligibleAngles].sort((a, b) => {
      if (b.replyRate !== a.replyRate) {
        return b.replyRate - a.replyRate
      }

      if (b.replied !== a.replied) {
        return b.replied - a.replied
      }

      return b.sent - a.sent
    })

    return ranked[0]
  }, [angleChartData])

  const winningStep = useMemo(() => {
    if (!stepChartData.length) return null

    const eligibleSteps = stepChartData.filter(
      (item) => item.rawStep !== 'unknown' && item.sent > 0
    )

    if (!eligibleSteps.length) return null

    const ranked = [...eligibleSteps].sort((a, b) => {
      if (b.replyRate !== a.replyRate) {
        return b.replyRate - a.replyRate
      }

      if (b.replied !== a.replied) {
        return b.replied - a.replied
      }

      return b.sent - a.sent
    })

    return ranked[0]
  }, [stepChartData])

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Analytics</h1>
            <p className="text-gray-600 mt-2">
              Conversion performance across outreach angles and sequence steps.
            </p>
          </div>

          <Link
            href="/members/leads"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 transition"
          >
            Back to Leads
          </Link>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">
          Loading analytics...
        </div>
      )}

      {error && (
        <div className="bg-white rounded-xl shadow p-8 text-center text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {data.totals.sent}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">Total Replied</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {data.totals.replied}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">Overall Reply Rate</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {data.totals.replyRate}%
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">Winning Angle</p>
              {winningAngle ? (
                <>
                  <p className="text-2xl font-bold mt-2 text-gray-900 capitalize">
                    {winningAngle.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Reply Rate: {winningAngle.replyRate}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Replied: {winningAngle.replied} / {winningAngle.sent}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Not enough data yet
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">Winning Step</p>
              {winningStep ? (
                <>
                  <p className="text-2xl font-bold mt-2 text-gray-900">
                    {winningStep.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Reply Rate: {winningStep.replyRate}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Replied: {winningStep.replied} / {winningStep.sent}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Not enough data yet
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sends by Angle
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={angleChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="sent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Replies by Angle
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={angleChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="replied" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sends by Step
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stepChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="sent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Replies by Step
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stepChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="replied" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Angle Performance
              </h2>
              <div className="space-y-3">
                {angleChartData.map((item) => (
                  <div
                    key={item.name}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Sent: {item.sent} • Replied: {item.replied}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {item.replyRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Step Performance
              </h2>
              <div className="space-y-3">
                {stepChartData.map((item) => (
                  <div
                    key={item.name}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Sent: {item.sent} • Replied: {item.replied}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {item.replyRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}