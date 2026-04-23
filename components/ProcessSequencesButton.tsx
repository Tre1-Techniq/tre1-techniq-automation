'use client'

import { useState } from 'react'

export default function ProcessSequencesButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleProcess() {
    try {
      setLoading(true)
      setMessage('')
      setError('')

      const res = await fetch('/api/sequences/process', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process sequences')
      }

      setMessage(`Processed ${data.processed} sequence step(s) successfully`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process sequences')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sequence Processing</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manually process pending sequence steps for testing and internal operations.
          </p>
        </div>

        <button
          onClick={handleProcess}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-tre1-teal text-white font-semibold hover:bg-teal-600 disabled:opacity-50 transition"
        >
          {loading ? 'Processing...' : 'Process Sequences'}
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}