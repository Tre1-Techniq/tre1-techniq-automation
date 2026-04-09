import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// @ts-ignore: allow importing global CSS without type declarations
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tre1 TechnIQ Automation',
  description: 'AI-driven workflow automation for growing Orange County businesses.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}