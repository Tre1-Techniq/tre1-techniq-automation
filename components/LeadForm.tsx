// components/LoginForm.tsx - UPDATED WITH OAUTH
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface LoginFormProps {
  redirectTo: string
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const [email, setEmail] = useState('tre1.techniq@gmail.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // OAuth Login (Recommended with OAuth Server enabled)
  const handleOAuthLogin = async () => {
    console.log('Starting OAuth login...')
    
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google', // or use 'email' provider
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          // You can pass custom parameters if needed
        }
      }
    })
    
    if (oauthError) {
      console.error('OAuth error:', oauthError)
      setError(`OAuth error: ${oauthError.message}`)
    } else {
      console.log('OAuth redirect initiated:', data)
      // The redirect happens automatically
    }
  }

  // Fallback: Email/Password (might not work with OAuth Server)
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Email login attempt (may not work with OAuth Server)...')
    
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log('Email login response:', { data, error: authError })

      if (authError) {
        setError(`Email login failed: ${authError.message}`)
        setLoading(false)
        return
      }

      console.log('✅ Email login successful!')
      console.log('User:', data.user?.email)
      
      // Force redirect
      window.location.href = redirectTo
      
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            OAuth Server is enabled. Try OAuth login first.
          </p>
        </div>
        
        {/* OAuth Login Button */}
        <button
          onClick={handleOAuthLogin}
          disabled={loading}
          className="w-full mb-4 p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Continue with OAuth (Recommended)
        </button>
        
        <div className="text-center text-gray-500 my-4">OR</div>
        
        {/* Email/Password Form (Fallback) */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Email"
            disabled={loading}
            required
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Password"
            disabled={loading}
            required
          />
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login with Email'}
          </button>
        </form>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Client ID: {process.env.NEXT_PUBLIC_SUPABASE_OAUTH_CLIENT_ID ? 'Set' : 'Not set'}</p>
          <p>Open browser console (F12) for debug messages</p>
        </div>
      </div>
    </div>
  )
}