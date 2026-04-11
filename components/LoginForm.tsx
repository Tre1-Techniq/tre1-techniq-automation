// components/LoginForm.tsx - COMPLETE MULTI-OPTION LOGIN
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface LoginFormProps {
  redirectTo: string
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeMethod, setActiveMethod] = useState<'email' | 'google' | 'github' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setActiveMethod('google')
    setLoading(true)
    setError('')
    setSuccess('')
    
    console.log('Starting Google OAuth...')
    
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (oauthError) {
      console.error('Google OAuth error:', oauthError)
      setError(`Google login failed: ${oauthError.message}`)
      setLoading(false)
      setActiveMethod(null)
    }
    // No need to setLoading(false) here - redirect happens automatically
  }

  // GitHub OAuth Login
  const handleGitHubLogin = async () => {
    setActiveMethod('github')
    setLoading(true)
    setError('')
    setSuccess('')
    
    console.log('Starting GitHub OAuth...')
    
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'read:user user:email', // Request user info and email
      }
    })
    
    if (oauthError) {
      console.error('GitHub OAuth error:', oauthError)
      setError(`GitHub login failed: ${oauthError.message}`)
      setLoading(false)
      setActiveMethod(null)
    }
    // No need to setLoading(false) here - redirect happens automatically
  }

  // Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setActiveMethod('email')
    setLoading(true)
    setError('')
    setSuccess('')
    
    console.log('Starting email/password login...', { email })
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      console.log('Email login response:', { data, error: authError })

      if (authError) {
        console.error('Email login error:', authError)
        setError(`Login failed: ${authError.message}`)
        setLoading(false)
        setActiveMethod(null)
        return
      }

      console.log('✅ Email login successful!')
      console.log('User:', data.user?.email)
      
      // Force redirect to members area
      window.location.href = redirectTo
      
    } catch (err: any) {
      console.error('Login exception:', err)
      setError(err.message || 'Login failed')
      setLoading(false)
      setActiveMethod(null)
    }
  }

  // Get loading text based on active method
  const getLoadingText = () => {
    if (!activeMethod) return 'Loading...'
    
    switch (activeMethod) {
      case 'google': return 'Redirecting to Google...'
      case 'github': return 'Redirecting to GitHub...'
      case 'email': return 'Logging in...'
      default: return 'Processing...'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your Tre1 TechnIQ account</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>
          
          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <span className="font-medium">Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tre1-teal focus:border-transparent transition"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
          
          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-gradient-to-r from-tre1-teal to-teal-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading && activeMethod === 'email' ? getLoadingText() : 'Sign in with Email'}
          </button>
        </form>

        {/* Loading Overlay */}
        {loading && activeMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tre1-teal mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">{getLoadingText()}</p>
              <p className="text-sm text-gray-500 mt-2">Please wait...</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Don't have an account? <a href="/signup" className="text-tre1-teal hover:underline font-medium">Sign up</a></p>
          <p className="mt-2 text-xs">By continuing, you agree to our Terms and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}