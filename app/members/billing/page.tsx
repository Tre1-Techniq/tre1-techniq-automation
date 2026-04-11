// app/members/billing/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MembersNavbar from '@/components/MembersNavbar'

export const dynamic = 'force-dynamic'

export default function BillingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tre1-teal mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MembersNavbar 
        tier="free"
        userName={user?.email?.split('@')[0] || 'Member'}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and payment methods</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Current Plan</h2>
              
              <div className="p-4 bg-gradient-to-r from-tre1-teal to-teal-600 rounded-lg text-white mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">Free Tier</h3>
                    <p className="text-teal-100">Basic access to automation resources</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">$0<span className="text-lg">/month</span></p>
                    <p className="text-sm text-teal-100">No credit card required</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Plan Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span>
                    <span>Access to basic PDF library</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span>
                    <span>Community forum access</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span>
                    <span>Weekly automation tips</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <span className="mr-2">✗</span>
                    <span>Priority audit scheduling</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <span className="mr-2">✗</span>
                    <span>Unlimited PDF downloads</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <span className="mr-2">✗</span>
                    <span>Direct expert support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-8 bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h2>
              <p className="text-gray-600 mb-4">No payment methods on file for Free Tier.</p>
              <button className="px-4 py-2 bg-tre1-teal text-white rounded-lg hover:bg-teal-600 transition">
                Upgrade to add payment method
              </button>
            </div>
          </div>

          {/* Upgrade Options */}
          <div>
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upgrade Options</h2>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold text-gray-900">Starter Plan</h3>
                  <p className="text-2xl font-bold mt-2">$997<span className="text-lg">/month</span></p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Everything in Free</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Priority audit scheduling</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Unlimited PDF downloads</span>
                    </li>
                  </ul>
                  <button className="w-full mt-4 py-2 bg-tre1-orange text-white rounded-lg hover:bg-orange-600 transition">
                    Upgrade to Starter
                  </button>
                </div>

                <div className="p-4 border-2 border-tre1-teal rounded-lg bg-teal-50">
                  <h3 className="font-bold text-gray-900">Growth Plan</h3>
                  <p className="text-2xl font-bold mt-2">$2,497<span className="text-lg">/month</span></p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Everything in Starter</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Direct expert support</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Custom automation workflows</span>
                    </li>
                  </ul>
                  <button className="w-full mt-4 py-2 bg-tre1-teal text-white rounded-lg hover:bg-teal-600 transition">
                    Upgrade to Growth
                  </button>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div className="mt-8 bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Billing History</h2>
              <p className="text-gray-600">No billing history for Free Tier.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}