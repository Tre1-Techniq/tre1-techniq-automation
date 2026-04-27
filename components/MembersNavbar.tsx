'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  HomeIcon,
  DocumentTextIcon,
  CogIcon,
  CreditCardIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'

interface MembersNavbarProps {
  tier: string
  userName: string
}

export default function MembersNavbar({ tier, userName }: MembersNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const closeDropdown = () => setDropdownOpen(false)

  const navLinks = [
    { name: 'Dashboard', href: '/members', icon: HomeIcon },
    { name: 'Library', href: '/members/library', icon: DocumentTextIcon },
    { name: 'Community', href: '/members/community', icon: UserGroupIcon },
    { name: 'Billing', href: '/members/billing', icon: CreditCardIcon },
    { name: 'Settings', href: '/members/settings', icon: CogIcon },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`)
  const linkBase = 'rounded-md px-3 py-2 text-sm font-medium transition'

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
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

          <nav className="hidden md:flex items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`${linkBase} ${
                  isActive(link.href)
                    ? 'text-tre1-orange'
                    : 'text-gray-200 hover:text-tre1-orange'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end space-x-4">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-100 transition hover:bg-white/10 hover:text-tre1-orange"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-tre1-teal to-teal-600 flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-100">{userName}</p>
                  <p className="text-xs text-gray-400">{tier} member</p>
                </div>

                <ChevronDownIcon className="h-4 w-4 text-gray-300" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-800 bg-gray-900/95 py-2 shadow-lg backdrop-blur-md z-10">
                  <div className="border-b border-gray-800 px-4 py-2">
                    <p className="text-sm font-medium text-gray-100">{userName}</p>
                    <p className="text-xs text-gray-400">{tier} member</p>
                  </div>

                  <Link
                    href="/"
                    className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-tre1-orange"
                    onClick={closeDropdown}
                  >
                    <HomeIcon className="h-4 w-4 mr-3" />
                    Homepage
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-tre1-orange"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden border-t border-gray-800 py-3">
          <div className="flex justify-around">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center text-xs transition ${
                  isActive(link.href)
                    ? 'text-tre1-orange'
                    : 'text-gray-300 hover:text-tre1-orange'
                }`}
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