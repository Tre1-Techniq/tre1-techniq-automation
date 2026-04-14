// app/members/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import {
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  CreditCardIcon,
  UserGroupIcon,
  BellIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'

export default function MembersDashboard() {
  const router = useRouter()

  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const stats = [
    { label: 'Automation Score', value: '72%', icon: ChartBarIcon, color: 'bg-blue-500' },
    { label: 'PDFs Accessed', value: '3', icon: DocumentTextIcon, color: 'bg-green-500' },
    { label: 'Days Active', value: '1', icon: BellIcon, color: 'bg-purple-500' },
    { label: 'Current Tier', value: 'Free', icon: SparklesIcon, color: 'bg-orange-500' },
  ]

  const quickActions = [
    { title: 'Automation Library', desc: 'Browse automation templates', icon: DocumentTextIcon, href: '/members/library', color: 'bg-tre1-teal' },
    { title: 'Account Settings', desc: 'Update profile & preferences', icon: CogIcon, href: '/members/settings', color: 'bg-gray-600' },
    { title: 'Billing', desc: 'Manage subscription & payments', icon: CreditCardIcon, href: '/members/billing', color: 'bg-green-500' },
    { title: 'Community', desc: 'Connect with other members', icon: UserGroupIcon, href: '/members/community', color: 'bg-purple-500' },
  ]

  const recentActivity = [
    { action: 'Account created', time: 'Just now', icon: '🎉' },
    { action: 'Accessed PDF library', time: '5 min ago', icon: '📚' },
    { action: 'Completed profile setup', time: '10 min ago', icon: '✅' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-tre1-teal to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T1</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Member Portal</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Signed In</p>
              <p className="text-xs text-gray-500">Free Tier</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-tre1-teal to-teal-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to Tre1 TechnIQ!</h1>
              <p className="text-teal-100">Your automation journey starts here. Explore resources, tools, and community.</p>
            </div>
            <Link
              href="/audit"
              className="mt-4 md:mt-0 px-6 py-3 bg-white text-tre1-teal font-semibold rounded-lg hover:bg-gray-100 transition inline-flex items-center"
            >
              Upgrade Audit <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-tre1-teal transition">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{action.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{activity.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">📚 Explore the Library</h3>
                  <p className="text-sm text-blue-700 mt-1">Access automation guides and templates.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">🎯 Request an Audit</h3>
                  <p className="text-sm text-green-700 mt-1">Get personalized automation recommendations.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900">👥 Join Community</h3>
                  <p className="text-sm text-purple-700 mt-1">Connect with other automation enthusiasts.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-tre1-orange to-orange-500 rounded-xl shadow p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Upgrade Your Plan</h2>
              <p className="mb-4">Unlock advanced features and priority support.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><span className="mr-2">✓</span> Unlimited PDF access</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Priority audit scheduling</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Direct expert support</li>
              </ul>
              <button className="w-full py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition">
                View Plans
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}