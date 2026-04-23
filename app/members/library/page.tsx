import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/server/supabase'
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'

const tierOrder = ['free', 'starter', 'growth', 'enterprise']

const tierDisplay: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
}

const tierColors: Record<string, { bg: string; text: string }> = {
  free: { bg: 'bg-gray-100', text: 'text-gray-800' },
  starter: { bg: 'bg-green-100', text: 'text-green-800' },
  growth: { bg: 'bg-blue-100', text: 'text-blue-800' },
  enterprise: { bg: 'bg-purple-100', text: 'text-purple-800' },
}

type PdfResource = {
  id: string
  slug: string
  title: string
  description: string | null
  category: string
  required_tier: string
  storage_path: string
  is_active: boolean
  created_at: string
  interest_tag?: string | null
  priority_level?: string | null
  followup_type?: string | null
}

export default async function LibraryPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  const userTier = profile?.tier || 'free'
  const userTierIndex = tierOrder.indexOf(userTier)

  const { data: pdfResources, error: pdfError } = await supabase
    .from('pdf_resources')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (pdfError) {
    console.error('PDF resource query error:', pdfError)
  }

  const allPDFs: PdfResource[] = pdfResources || []

  const accessiblePDFs = allPDFs.filter((pdf) => {
    const requiredTierIndex = tierOrder.indexOf(pdf.required_tier)
    return userTierIndex >= requiredTierIndex
  })

  const lockedPDFs = allPDFs.filter((pdf) => {
    const requiredTierIndex = tierOrder.indexOf(pdf.required_tier)
    return userTierIndex < requiredTierIndex
  })

  const pdfsByCategory = allPDFs.reduce((acc, pdf) => {
    if (!acc[pdf.category]) acc[pdf.category] = []
    acc[pdf.category].push(pdf)
    return acc
  }, {} as Record<string, PdfResource[]>)

  const categories = ['Getting Started', 'Industry Specific', 'Tool Guides', 'Case Studies', 'Advanced']

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PDF Library</h1>
            <p className="text-gray-600 mt-2">
              Access automation guides, templates, and resources. Your access level:{' '}
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${tierColors[userTier].bg} ${tierColors[userTier].text}`}
              >
                {tierDisplay[userTier]} Tier
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Resources Available</p>
              <p className="text-2xl font-bold text-tre1-teal">
                {accessiblePDFs.length} / {allPDFs.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-tre1-teal to-teal-600 flex items-center justify-center">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {userTier !== 'enterprise' && lockedPDFs.length > 0 && (
        <div className="bg-gradient-to-r from-tre1-teal to-teal-600 rounded-xl shadow p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Unlock More Resources</h3>
              <p className="mt-1 opacity-90">
                Upgrade to{' '}
                {userTier === 'free' ? 'Starter' : userTier === 'starter' ? 'Growth' : 'Enterprise'} Tier
                {' '}to access {lockedPDFs.length} additional guide{lockedPDFs.length !== 1 ? 's' : ''}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Accessible Resources</p>
              <p className="text-2xl font-bold mt-1">{accessiblePDFs.length}</p>
            </div>
            <ArrowDownTrayIcon className="h-8 w-8 text-tre1-teal" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold mt-1">{Object.keys(pdfsByCategory).length}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-tre1-orange" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Latest Addition</p>
              <p className="text-lg font-bold mt-1">
                {allPDFs.length > 0
                  ? new Date(allPDFs[allPDFs.length - 1].created_at).toLocaleDateString()
                  : 'None'}
              </p>
            </div>
            <CogIcon className="h-8 w-8 text-tre1-dark" />
          </div>
        </div>
      </div>

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
                {categoryPdfs.map((pdf) => {
                  const requiredTierIndex = tierOrder.indexOf(pdf.required_tier)
                  const isAccessible = userTierIndex >= requiredTierIndex

                  return (
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
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${tierColors[pdf.required_tier].bg} ${tierColors[pdf.required_tier].text}`}
                                >
                                  {tierDisplay[pdf.required_tier]} Tier
                                </span>
                              )}

                              {!isAccessible && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                  <LockClosedIcon className="h-3 w-3" />
                                  Locked
                                </span>
                              )}
                            </div>

                            <p className="text-gray-600 text-sm mt-1">
                              {pdf.description || 'No description available.'}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Added: {new Date(pdf.created_at).toLocaleDateString()}</span>
                              {pdf.interest_tag && (
                                <>
                                  <span>•</span>
                                  <span>Interest: {pdf.interest_tag}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          {isAccessible ? (
                            <Link
                              href={`/api/pdfs/${pdf.slug}/download`}
                              className="flex items-center space-x-2 px-4 py-2 bg-tre1-teal text-white rounded-lg hover:bg-teal-600 transition"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              <span>Download</span>
                            </Link>
                          ) : (
                            <Link
                              href={`/api/pdfs/${pdf.slug}/locked`}
                              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                            >
                              <LockClosedIcon className="h-4 w-4" />
                              <span>Upgrade</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {allPDFs.length === 0 && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-xl font-medium text-gray-900">No Resources Available</h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Resources are being added to the library. Check back soon.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tier Access Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['free', 'starter', 'growth', 'enterprise'].map((tier) => {
            const accessibleCount = allPDFs.filter(
              (p) => tierOrder.indexOf(tier) >= tierOrder.indexOf(p.required_tier)
            ).length

            return (
              <div
                key={tier}
                className={`p-4 rounded-lg border ${userTier === tier ? 'border-tre1-teal' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${tierColors[tier].text}`}>
                    {tierDisplay[tier]}
                  </span>
                  {userTier === tier && (
                    <span className="text-xs bg-tre1-teal text-white px-2 py-1 rounded">Current</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Access to {accessibleCount} resource{accessibleCount !== 1 ? 's' : ''}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}