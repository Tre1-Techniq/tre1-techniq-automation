// app/login/page.tsx - COMPLETE ERROR-FREE VERSION
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('tre1.techniq@gmail.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [redirectAttempted, setRedirectAttempted] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const redirectTo = searchParams.get('redirectTo') || '/members'

  // Countdown timer
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [success])

  // Auto-redirect when countdown reaches 0
  useEffect(() => {
    if (success && countdown === 0 && !redirectAttempted) {
      performRedirect()
    }
  }, [success, countdown, redirectAttempted])

  const performRedirect = () => {
    if (redirectAttempted) return
    
    console.log('🔄 Performing redirect to:', redirectTo)
    setRedirectAttempted(true)
    window.location.replace(redirectTo)
  }

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    console.log('=== LOGIN START ===')
    
    setLoading(true)
    setError('')
    setSuccess(false)
    setRedirectAttempted(false)
    setCountdown(5)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        console.error('Auth error:', authError)
        setError(authError.message)
        setLoading(false)
        return
      }

      console.log('✅ Login successful!')
      console.log('User:', data.user?.email)
      
      setSuccess(true)
      setLoading(false)
      
      // Schedule redirect
      setTimeout(() => {
        if (!redirectAttempted) {
          performRedirect()
        }
      }, 3000)
      
    } catch (err: any) {
      console.error('Login error:', err)
      setError('Login failed: ' + err.message)
      setLoading(false)
    }
  }

  const manualRedirect = () => {
    console.log('Manual redirect triggered')
    performRedirect()
  }

  const resetForm = () => {
    setSuccess(false)
    setCountdown(5)
    setRedirectAttempted(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        {success ? (
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <div>
                <p className="text-green-800 font-semibold text-lg">Login Successful!</p>
                <p className="text-green-600 text-sm">Welcome back!</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-700">Redirecting in:</span>
                <span className="text-green-800 font-bold text-xl">{countdown}s</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={manualRedirect}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Go to Members Now
              </button>
              
              <button
                onClick={resetForm}
                className="w-full py-2 text-green-600 hover:text-green-800 text-sm"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Email"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Password"
                disabled={loading}
                required
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}