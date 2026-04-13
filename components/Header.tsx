import Link from 'next/link'

export default function Header() {
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
            <Link href="/audit" className="text-gray-700 hover:text-tre1-teal">Free Audit</Link>
            <Link href="/about-lite" className="text-gray-700 hover:text-tre1-teal">About</Link>
            <Link href="/members" className="text-gray-700 hover:text-tre1-teal">Members</Link>
            <Link href="/signup" className="text-gray-700 hover:text-tre1-teal">Sign Up</Link>
            <a
              href="/audit"
              className="rounded-lg bg-tre1-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              Book an Audit
            </a>
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