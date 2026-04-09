'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LeadForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    businessType: '',
    painPoint: '',
  })

  const businessTypes = [
    { value: '', label: 'Select your industry' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'local_services', label: 'Local Services' },
    { value: 'clinics', label: 'Clinics & Medical' },
    { value: 'law_firms', label: 'Law Firms' },
    { value: 'other', label: 'Other' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/thank-you')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to submit'}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tre1-teal focus:ring-tre1-teal p-3 border"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tre1-teal focus:ring-tre1-teal p-3 border"
          placeholder="Your company name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tre1-teal focus:ring-tre1-teal p-3 border"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
          Business Type *
        </label>
        <select
          id="businessType"
          name="businessType"
          required
          value={formData.businessType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tre1-teal focus:ring-tre1-teal p-3 border"
        >
          {businessTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="painPoint" className="block text-sm font-medium text-gray-700">
          Do you have repetitive tasks that take too much of your time?
          <span className="text-gray-500 font-normal"> (Optional)</span>
        </label>
        <textarea
          id="painPoint"
          name="painPoint"
          rows={3}
          value={formData.painPoint}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tre1-teal focus:ring-tre1-teal p-3 border"
          placeholder="e.g., manually following up with leads, scheduling appointments, generating reports..."
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-tre1-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Book My Free Audit'}
        </button>
        <p className="mt-2 text-xs text-gray-500 text-center">
          By submitting, you agree to our 15-minute workflow audit call.
        </p>
      </div>
    </form>
  )
}