import Link from 'next/link'
import Image from 'next/image'
import { createClient as createServerClient } from '@/lib/server/supabase'

const linkBase = 'rounded-md px-3 py-2 text-sm font-medium transition'

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
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Tre1 TechnIQ"
              width={175}
              height={53}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center justify-center space-x-8">
            <Link href="/" className={`${linkBase} text-gray-200 hover:text-tre1-orange`}>Home</Link>
            <Link href="/about-lite" className={`${linkBase} text-gray-200 hover:text-tre1-orange`}>About</Link>
            <Link href={secondaryLink.href} className={`${linkBase} text-gray-200 hover:text-tre1-orange`}>
              {secondaryLink.label}
            </Link>
          </nav>

          <Link
            href={primaryCta.href}
            className="hidden md:inline-flex bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            {primaryCta.label}
          </Link>
        </div>
      </div>
    </header>
  )
}
