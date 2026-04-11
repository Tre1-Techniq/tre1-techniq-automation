// app/members/library/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  LockClosedIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon 
} from '@heroicons/react/24/outline'

export default async function LibraryPage() {
  const cookieStore = cookies()
  
  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, full_name')
    .eq('id', session.user.id)
    .single()
  
  const userTier = profile?.tier || 'free'
  
  // Mock PDF data - replace with actual database query
  const mockPDFs = [
    {
      id: '1',
      title: 'Automation-First Mindset Guide',
      description: 'Learn how to identify automation opportunities in your daily workflow',
      category: 'Getting Started',
      required_tier: 'free',
      download_count: 142,
      created_at: '2026-03-15'
    },
    {
      id: '2',
      title: 'Workflow Mapping Template',
      description: 'Step-by-step template to map and analyze your current workflows',
      category: 'Getting Started',
      required_tier: 'free',
      download_count: 89,
      created_at: '2026-03-20'
    },
    {
      id: '3',
      title: 'Real Estate Lead Automation Playbook',
      description: 'Complete guide to automating lead capture and follow-up for real estate',
      category: 'Industry Specific',
      required_tier: 'starter',
      download_count: 56,
      created_at: '2026-03-25'
    },
    {
      id: '4',
      title: 'Medical Office Patient Communication System',
      description: 'HIPAA-compliant automation for appointment reminders and patient follow-ups',
      category: 'Industry Specific',
      required_tier: 'starter',
      download_count: 42,
      created_at: '2026-04-01'
    },
    {
      id: '5',
      title: 'Zapier Advanced Flows Guide',
      description: 'Master complex multi-step automations with Zapier',
      category: 'Tool Guides',
      required_tier: 'growth',
      download_count: 31,
      created_at: '2026-04-05'
    },
    {
      id: '6',
      title: 'API Integration Fundamentals',
      description: 'Learn how to connect different systems using APIs',
      category: 'Advanced',
      required_tier: 'enterprise',
      download_count: 18,
      created_at: '2026-04-08'
    }
  ]
  
  // Filter PDFs based on user tier
  const tierOrder = ['free', 'starter', 'growth', 'enterprise']
  const userTierIndex = tierOrder.indexOf(userTier)
  
  const accessiblePDFs = mockPDFs.filter(pdf => {
    const requiredTierIndex = tierOrder.indexOf(pdf.required_tier)
    return userTierIndex >= requiredTierIndex
  })
  
  // Group by category
  const pdfsByCategory = accessiblePDFs.reduce((acc, pdf) => {
    if (!acc[pdf.category]) {
      acc[pdf.category] = []
    }
    acc[pdf.category].push(pdf)
    return acc
  }, {} as Record<string, typeof mockPDFs>)
  
  // Categories in order
  const categories = ['Getting Started', 'Industry Specific', 'Tool Guides', 'Case Studies', 'Advanced']
  
  // Tier display names
  const tierDisplay: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    growth: 'Growth',
    enterprise: 'Enterprise'
  }
  
  // Tier colors
  const tierColors: Record<string, { bg: string, text: string }> = {
    free: { bg: 'bg-gray-100', text: 'text-gray-800' },
    starter: { bg: 'bg-green-100', text: 'text-green-800' },
    growth: { bg: 'bg-blue-100', text: 'text-blue-800' },
    enterprise: { bg: 'bg-purple-100', text: 'text-purple-800' }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PDF Library</h1>
            <p className="text-gray-600 mt-2">
              Access automation guides, templates, and resources. Your access level:{" "}
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${tierColors[userTier].bg} ${tierColors[userTier].text}`}>
                {tierDisplay[userTier]} Tier
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Resources Available</p>
              <p className="text-2xl font-bold text-tre1-teal">{accessiblePDFs.length} / {mockPDFs.length}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-tre1-teal to-teal-600 flex items-center justify-center">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Upgrade Banner */}
      {userTier !== 'enterprise' && (
        <div className="bg-gradient-to-r from-tre1-teal to-teal-600 rounded-xl shadow p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Unlock More Resources</h3>
              <p className="mt-1 opacity-90">
                Upgrade to {userTier === 'free' ? 'Starter' : userTier === 'starter' ? 'Growth' : 'Enterprise'} Tier to access {mockPDFs.length - accessiblePDFs.length} additional guides
              </p>
            </div>
            <Link
              href="/members/billing"
              className="bg-white text-tre1-teal font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition whitespace-nowrap"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Downloads</p>
              <p className="text-2xl font-bold mt-1">
                {accessiblePDFs.reduce((sum, pdf) => sum + pdf.download_count, 0)}
              </p>
            </div>
            <ArrowDownTrayIcon className="h-8 w-8 text-tre1-teal" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold mt-1">
                {Object.keys(pdfsByCategory).length}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-tre1-orange" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Latest Addition</p>
              <p className="text-lg font-bold mt-1">
                {accessiblePDFs.length > 0 
                  ? new Date(accessiblePDFs[accessiblePDFs.length - 1].created_at).toLocaleDateString()
                  : 'None'
                }
              </p>
            </div>
            <CogIcon className="h-8 w-8 text-tre1-dark" />
          </div>
        </div>
      </div>
      
      {/* PDF Library by Category */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryPdfs = pdfsByCategory[category] || []
          
          if (categoryPdfs.length === 0) return null
          
          return (
            <div key={category} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="border-b px-6 py-4 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">{category}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {categoryPdfs.length} resource{categoryPdfs.length !== 1 ? 's' : ''} in this category
                </p>
              </div>
              
              <div className="divide-y">
                {categoryPdfs.map((pdf) => (
                  <div key={pdf.id} className="px-6 py-4 hover:bg-gray-50 transition group">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 bg-tre1-teal/10 rounded-lg group-hover:bg-tre1-teal/20 transition">
                          <DocumentTextIcon className="h-6 w-6 text-tre1-teal" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-gray-900">{pdf.title}</h3>
                            {pdf.required_tier !== 'free' && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${tierColors[pdf.required_tier].bg} ${tierColors[pdf.required_tier].text}`}>
                                {tierDisplay[pdf.required_tier]} Tier
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{pdf.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Added: {new Date(pdf.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{pdf.download_count.toLocaleString()} downloads</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            // Simulate download
                            alert(`Downloading: ${pdf.title}\n\nThis would trigger a real download in production.`)
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-tre1-teal text-white rounded-lg hover:bg-teal-600 transition"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Empty State */}
      {accessiblePDFs.length === 0 && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-xl font-medium text-gray-900">No Resources Available</h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            {userTier === 'free' 
              ? 'Upgrade to a paid tier to access our library of automation resources.'
              : 'Resources are being added to the library. Check back soon!'
            }
          </p>
          {userTier === 'free' && (
            <Link
              href="/members/billing"
              className="inline-block mt-4 px-6 py-3 bg-tre1-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition"
            >
              Upgrade to Access Resources
            </Link>
          )}
        </div>
      )}
      
      {/* Tier Explanation */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tier Access Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['free', 'starter', 'growth', 'enterprise'].map((tier) => (
            <div key={tier} className={`p-4 rounded-lg border ${userTier === tier ? 'border-tre1-teal' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${tierColors[tier].text}`}>
                  {tierDisplay[tier]}
                </span>
                {userTier === tier && (
                  <span className="text-xs bg-tre1-teal text-white px-2 py-1 rounded">Current</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Access to {mockPDFs.filter(p => tierOrder.indexOf(tier) >= tierOrder.indexOf(p.required_tier)).length} resources
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}