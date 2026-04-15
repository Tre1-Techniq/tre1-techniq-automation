<<<<<<< HEAD
// middleware.ts
=======
>>>>>>> dev
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
<<<<<<< HEAD
          // Update the request cookies
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Update the response cookies
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // Update the request cookies
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Update the response cookies
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
=======
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
>>>>>>> dev
        },
      },
    }
  )

<<<<<<< HEAD
  // Refresh session if expired
  await supabase.auth.getSession()

  // Protect /members routes
  if (request.nextUrl.pathname.startsWith('/members')) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Redirect to login with redirect URL
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
=======
  const path = request.nextUrl.pathname

  const { data, error } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims && !error

  if (path.startsWith('/members') && !isAuthenticated) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  if ((path === '/login') && isAuthenticated) {
    return NextResponse.redirect(new URL('/members', request.url))
>>>>>>> dev
  }

  return response
}

export const config = {
  matcher: [
<<<<<<< HEAD
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
=======
>>>>>>> dev
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}