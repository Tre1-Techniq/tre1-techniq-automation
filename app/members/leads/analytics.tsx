'use client'

import { useState, useEffect } from 'react'

const AnalyticsPage = () => {
  const [angleStats, setAngleStats] = useState<any>({})
  const [stepStats, setStepStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/leads/analytics')
        const data = await response.json()

        if (data.error) {
          setError(data.error)
          return
        }

        setAngleStats(data.angleStats)
        setStepStats(data.stepStats)
      } catch (err) {
        setError('Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const renderStats = (stats: any) => {
    return Object.keys(stats).map((key) => {
      const { sent, replied } = stats[key]
      const replyRate = sent > 0 ? ((replied / sent) * 100).toFixed(2) : '0.00%'
      return (

        <div key={key} className="mb-4">
          <h4>{key}</h4>
          <div>Sent: {sent}</div>
          <div>Replied: {replied}</div>
          <div>Reply Rate: {replyRate}%</div>
        </div>
      )
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Lead Outreach Analytics</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <h2 className="text-xl font-medium mb-4">Conversion by Angle</h2>
        {renderStats(angleStats)}
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Conversion by Step</h2>
        {renderStats(stepStats)}
      </div>
    </div>
  )
}

export default AnalyticsPage