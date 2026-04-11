// app/members/community/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MembersNavbar from '@/components/MembersNavbar'

export const dynamic = 'force-dynamic'

export default function CommunityPage() {
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

  const forumTopics = [
    { title: 'Getting Started with Automation', posts: 42, category: 'Beginner' },
    { title: 'Zapier vs Make.com - Which to Choose?', posts: 156, category: 'Tools' },
    { title: 'Automating Real Estate Lead Follow-ups', posts: 89, category: 'Real Estate' },
    { title: 'Legal Document Automation Success Stories', posts: 67, category: 'Legal' },
    { title: 'Medical Practice Workflow Optimization', posts: 54, category: 'Medical' },
    { title: 'Trade Service Scheduling Automation', posts: 32, category: 'Trade Services' },
  ]

  const recentDiscussions = [
    { user: 'Sarah M.', time: '2 hours ago', topic: 'Best CRM for small agencies?' },
    { user: 'Mike T.', time: '5 hours ago', topic: 'Automating invoice reminders' },
    { user: 'Jessica L.', time: '1 day ago', topic: 'Calendar sync issues with Google' },
    { user: 'David K.', time: '2 days ago', topic: 'Email template automation tips' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <MembersNavbar 
        tier="free"
        userName={user?.email?.split('@')[0] || 'Member'}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-2">Connect with other automation enthusiasts and share experiences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-tre1-teal to-teal-600 rounded-xl p-6 text-white mb-6">
              <h2 className="text-xl font-bold mb-2">Welcome to the Tre1 TechnIQ Community!</h2>
              <p>Share automation tips, ask questions, and learn from fellow members.</p>
            </div>

            {/* Forum Topics */}
            <div className="bg-white rounded-xl shadow mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Popular Forum Topics</h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {forumTopics.map((topic, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            {topic.category}
                          </span>
                          <span className="text-sm text-gray-500">{topic.posts} posts</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 hover:text-tre1-teal cursor-pointer">
                          {topic.title}
                        </h3>
                      </div>
                      <button className="px-4 py-2 bg-tre1-teal text-white text-sm rounded-lg hover:bg-teal-600 transition">
                        Join Discussion
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start New Discussion */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Start a New Discussion</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Discussion title"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <textarea
                  placeholder="What would you like to discuss?"
                  className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px]"
                />
                <div className="flex justify-between items-center">
                  <select className="p-2 border border-gray-300 rounded-lg">
                    <option>Select category</option>
                    <option>Beginner Questions</option>
                    <option>Tool Recommendations</option>
                    <option>Success Stories</option>
                    <option>Troubleshooting</option>
                  </select>
                  <button className="px-6 py-2 bg-tre1-orange text-white rounded-lg hover:bg-orange-600 transition">
                    Post Discussion
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Recent Discussions */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Discussions</h2>
              <div className="space-y-4">
                {recentDiscussions.map((discussion, index) => (
                  <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-8 w-8 bg-gradient-to-r from-tre1-teal to-teal-600 rounded-full flex items-center justify-center text-white text-sm">
                        {discussion.user.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{discussion.user}</p>
                        <p className="text-xs text-gray-500">{discussion.time}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 hover:text-tre1-teal cursor-pointer">
                      {discussion.topic}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Community Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Members</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Discussions</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Posts</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Replies</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-gradient-to-r from-tre1-orange to-orange-500 rounded-xl shadow p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Community Guidelines</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Be respectful and constructive</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Share automation success stories</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Ask specific, actionable questions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>No spam or self-promotion</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Keep discussions on-topic</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}