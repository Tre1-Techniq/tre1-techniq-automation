import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/server/supabase'

export default async function Header() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthenticated = !!user
  const secondaryLink = isAuthenticated
    ? { href: '/members/settings', label: 'Settings' }
    : { href: '/login', label: 'Login' }
  const primaryCta = isAuthenticated
    ? { href: '/members', label: 'DASHBOARD' }
    : { href: '/audit', label: 'FREE AUDIT' }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-tre1-teal to-teal-600"></div>
              <span className="text-xl font-bold text-tre1-dark">Tre1 TechnIQ</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-tre1-teal">Home</Link>
            <Link href="/about-lite" className="text-gray-700 hover:text-tre1-teal">About</Link>
            <Link href={secondaryLink.href} className="text-gray-700 hover:text-tre1-teal">{secondaryLink.label}</Link>
            <Link
              href={primaryCta.href}
              className="rounded-lg bg-tre1-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              {primaryCta.label}
            </Link>
          </nav>
          
          <button className="md:hidden p-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
