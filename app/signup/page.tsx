// app/signup/page.tsx - WITH FIRST/LAST NAME
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  BuildingOfficeIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Combine first and last name for display purposes only
      const displayName = firstName && lastName 
        ? `${firstName} ${lastName}`
        : firstName || lastName || ''

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            company: company,
            display_name: displayName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) throw authError

      // 2. Create profile in profiles table
      if (authData.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              tier: 'free'
              // We'll add first_name, last_name columns later
            })

          if (profileError) {
            console.warn('Profile creation warning (non-critical):', profileError)
          }
        } catch (profileError) {
          console.warn('Profile creation error (non-critical):', profileError)
        }
      }

      setSuccess('Account created! Please check your email to confirm your account.')
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (error) {
      console.error('Signup error:', error)
      setError(error instanceof Error ? error.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-10 w-10 bg-gradient-to-r from-tre1-teal to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T1</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Tre1 TechnIQ</span>
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">
            Join Tre1 TechnIQ to access automation resources and tools.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                    placeholder="John"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                    placeholder="Smith"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                  placeholder="Your Company"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Must be at least 6 characters
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-tre1-teal to-teal-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-tre1-teal hover:text-teal-600">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-tre1-teal hover:text-teal-600">
                Privacy Policy
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-tre1-teal hover:text-teal-600">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-tre1-teal font-bold text-lg">Free Tier</div>
            <div className="text-gray-600 text-sm">Access basic resources</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-tre1-teal font-bold text-lg">PDF Library</div>
            <div className="text-gray-600 text-sm">Automation guides & templates</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-tre1-teal font-bold text-lg">Community</div>
            <div className="text-gray-600 text-sm">Join automation experts</div>
          </div>
        </div>
      </div>
    </div>
  )
}