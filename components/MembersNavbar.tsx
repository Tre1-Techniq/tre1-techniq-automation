// components/MembersNavbar.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  CogIcon,
  CreditCardIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface MembersNavbarProps {
  tier: string
  userName: string
}

export default function MembersNavbar({ tier, userName }: MembersNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { name: 'Dashboard', href: '/members', icon: HomeIcon },
    { name: 'Library', href: '/members/library', icon: DocumentTextIcon },
    { name: 'Community', href: '/members/community', icon: UserGroupIcon },
    { name: 'Billing', href: '/members/billing', icon: CreditCardIcon },
    { name: 'Settings', href: '/members/settings', icon: CogIcon },
  ]

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-tre1-teal to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T1</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden md:inline">Tre1 TechnIQ</span>
            </Link>
            <div className="hidden md:flex items-center space-x-1 ml-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-tre1-teal rounded-md transition"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Tier Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              tier === 'premium' 
                ? 'bg-gradient-to-r from-tre1-orange to-orange-500 text-white' 
                : tier === 'pro'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-tre1-teal to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{tier} member</p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{tier} member</p>
                  </div>
                  
                  <div className="md:hidden py-2 border-b border-gray-100">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <link.icon className="h-4 w-4 mr-3" />
                        {link.name}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <HomeIcon className="h-4 w-4 mr-3" />
                    Homepage
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-3 border-t border-gray-200">
          <div className="flex justify-around">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex flex-col items-center text-xs text-gray-600 hover:text-tre1-teal"
              >
                <link.icon className="h-5 w-5 mb-1" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}