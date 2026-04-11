// app/signup/page.tsx - WITH OAUTH BUTTONS (COMPLETE & SIMPLIFIED)
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeMethod, setActiveMethod] = useState<'email' | 'google' | 'github' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Google OAuth Signup
  const handleGoogleSignup = async () => {
    setActiveMethod('google')
    setLoading(true)
    setError('')
    setSuccess('')
    
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    
    if (oauthError) {
      setError(`Google signup failed: ${oauthError.message}`)
      setLoading(false)
      setActiveMethod(null)
    }
  }

  // GitHub OAuth Signup
  const handleGitHubSignup = async () => {
    setActiveMethod('github')
    setLoading(true)
    setError('')
    setSuccess('')
    
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    
    if (oauthError) {
      setError(`GitHub signup failed: ${oauthError.message}`)
      setLoading(false)
      setActiveMethod(null)
    }
  }

  // Email/Password Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setActiveMethod('email')
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const displayName = firstName && lastName 
        ? `${firstName} ${lastName}`
        : firstName || lastName || ''

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

      if (authData.user) {
        try {
          // Use admin client to bypass RLS policies
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: authData.user.id,
              tier: 'free',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.warn('Profile creation warning:', profileError)
          } else {
            console.log('Profile created successfully for user:', authData.user.id)
          }
        } catch (profileError) {
          console.warn('Profile creation error:', profileError)
        }
      }

      setSuccess('Account created! Please check your email to confirm your account.')
      
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signup failed')
      setActiveMethod(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
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
          <p className="mt-2 text-gray-600">Join Tre1 TechnIQ to access automation resources.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-center text-lg font-semibold text-gray-900 mb-4">Sign up with</h2>
          
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-gray-700">Continue with Google</span>
            </button>
            
            <button
              onClick={handleGitHubSignup}
              disabled={loading}
              className="w-full p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="font-medium">Continue with GitHub</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="John"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Smith"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Your Company"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="you@company.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Create a password"
                required
                minLength={6}
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-gradient-to-r from-tre1-teal to-teal-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading && activeMethod === 'email' ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-tre1-teal hover:text-teal-600">Terms</Link> and{' '}
            <Link href="/privacy" className="text-tre1-teal hover:text-teal-600">Privacy Policy</Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-tre1-teal hover:text-teal-600">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}