// app/members/library/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MembersNavbar from '@/components/MembersNavbar'

export const dynamic = 'force-dynamic'

export default function LibraryPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState('free')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)
      
      // Get user tier from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', session.user.id)
        .single()
      
      setTier(profile?.tier || 'free')
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

  const pdfResources = [
    { 
      title: 'Automation Starter Guide', 
      description: 'Beginner\'s guide to workflow automation basics',
      category: 'Beginner',
      pages: 12,
      tier: 'free',
      downloadUrl: '#'
    },
    { 
      title: 'Zapier Quick Start', 
      description: 'Step-by-step Zapier setup for common business tasks',
      category: 'Tools',
      pages: 18,
      tier: 'free',
      downloadUrl: '#'
    },
    { 
      title: 'Real Estate Automation Playbook', 
      description: 'Complete automation system for real estate agencies',
      category: 'Real Estate',
      pages: 42,
      tier: 'starter',
      downloadUrl: '#'
    },
    { 
      title: 'Legal Document Automation', 
      description: 'Automating legal document creation and management',
      category: 'Legal',
      pages: 36,
      tier: 'starter',
      downloadUrl: '#'
    },
    { 
      title: 'Medical Practice Optimization', 
      description: 'Workflow automation for medical and dental offices',
      category: 'Medical',
      pages: 48,
      tier: 'growth',
      downloadUrl: '#'
    },
    { 
      title: 'Advanced Make.com Workflows', 
      description: 'Complex automation scenarios with Make.com',
      category: 'Advanced',
      pages: 64,
      tier: 'growth',
      downloadUrl: '#'
    },
  ]

  const categories = ['All', 'Beginner', 'Tools', 'Real Estate', 'Legal', 'Medical', 'Advanced']

  return (
    <div className="min-h-screen bg-gray-50">
      <MembersNavbar 
        tier={tier}
        userName={user?.email?.split('@')[0] || 'Member'}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Automation Library</h1>
              <p className="text-gray-600 mt-2">Access guides, templates, and resources for workflow automation</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              tier === 'growth' 
                ? 'bg-gradient-to-r from-tre1-orange to-orange-500 text-white' 
                : tier === 'starter'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier Access
            </div>
          </div>
        </div>

        {/* Tier Notice */}
        {tier === 'free' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-tre1-teal to-teal-600 rounded-lg text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="font-bold text-lg">Upgrade for Full Access</h3>
                <p className="text-teal-100">Free tier includes basic guides. Upgrade for premium content.</p>
              </div>
              <button 
                onClick={() => router.push('/members/billing')}
                className="mt-2 md:mt-0 px-4 py-2 bg-white text-tre1-teal font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                View Upgrade Options
              </button>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* PDF Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfResources.map((pdf, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow p-6 ${
                pdf.tier !== 'free' && tier === 'free' ? 'opacity-75' : ''
              }`}
            >
              {/* Tier Badge */}
              {pdf.tier !== 'free' && (
                <div className="mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    pdf.tier === 'starter' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {pdf.tier.charAt(0).toUpperCase() + pdf.tier.slice(1)} Tier
                  </span>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{pdf.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{pdf.description}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-tre1-teal to-teal-600 rounded-lg flex items-center justify-center text-white">
                  <span className="font-bold">PDF</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="px-2 py-1 bg-gray-100 rounded">{pdf.category}</span>
                <span>{pdf.pages} pages</span>
              </div>
              
              {pdf.tier !== 'free' && tier === 'free' ? (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    Upgrade to {pdf.tier} tier to access
                  </p>
                </div>
              ) : (
                <button className="w-full py-2 bg-tre1-teal text-white rounded-lg hover:bg-teal-600 transition">
                  Download PDF
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Library Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-2">Your Access Level</h3>
            <p className="text-2xl font-bold text-tre1-teal">
              {tier === 'free' ? 'Basic' : tier === 'starter' ? 'Standard' : 'Premium'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {tier === 'free' ? '2 PDFs available' : tier === 'starter' ? '4 PDFs available' : 'All PDFs available'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-2">Total Resources</h3>
            <p className="text-2xl font-bold text-tre1-teal">6</p>
            <p className="text-sm text-gray-600 mt-1">PDF guides and templates</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-2">Recently Viewed</h3>
            <p className="text-2xl font-bold text-tre1-teal">0</p>
            <p className="text-sm text-gray-600 mt-1">No recent downloads</p>
          </div>
        </div>
      </main>
    </div>
  )
}