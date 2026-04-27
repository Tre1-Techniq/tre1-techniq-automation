// components/NewsletterForm.tsx - FIXED VERSION
'use client'
import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()
      
      if (response.ok) {
        setStatus('success')
        setMessage(result.message || 'Subscribed successfully! Check your email.')
        setEmail('') // Clear form
      } else {
        setStatus('error')
        setMessage(result.error || 'Subscription failed')
      }
    } catch (error) {
      console.error('Newsletter error:', error)
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for automation insights"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
            required
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-gradient-to-r from-tre1-orange to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
              </span>
            ) : (
              'Join Our Newsletter'
            )}
          </button>
        </div>
        
        {/* Status Messages */}
        {status === 'success' && message && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}
        
        {status === 'error' && message && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{message}</p>
          </div>
        )}

        {/* Privacy Notice */}
        <p className="text-xs text-gray-500">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  )
}