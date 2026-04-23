'use client'

import { useState } from 'react'

interface Props {
  userId: string
  initialHasReplied: boolean
}

export default function ReplyStatusToggle({ userId, initialHasReplied }: Props) {
  const [hasReplied, setHasReplied] = useState(initialHasReplied)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleToggle(nextValue: boolean) {
    try {
      setLoading(true)
      setError('')
      setMessage('')

      const res = await fetch(`/api/leads/${userId}/reply-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hasReplied: nextValue,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update reply status')
      }

      setHasReplied(nextValue)
      setMessage(data.message || 'Updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reply status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reply Status</h2>
          <p className="text-sm text-gray-600 mt-1">
            Mark this lead as replied to pause active follow-up sequences.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleToggle(true)}
            disabled={loading || hasReplied}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading && !hasReplied ? 'Saving...' : 'Mark Replied'}
          </button>

          <button
            onClick={() => handleToggle(false)}
            disabled={loading || !hasReplied}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {loading && hasReplied ? 'Saving...' : 'Clear Reply'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            hasReplied
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {hasReplied ? 'Reply marked' : 'No reply marked'}
        </span>
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