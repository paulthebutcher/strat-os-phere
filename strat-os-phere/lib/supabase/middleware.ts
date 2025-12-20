import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'
import { mergeAuthCookieOptions } from './cookie-options'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isDev = process.env.NODE_ENV === 'development'

  // Public routes that should always be allowed
  const publicRoutes = ['/', '/login', '/auth/callback']
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/')

  // Protected routes that require authentication
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/projects')

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies directly on the existing response to avoid dropping
          // previously-set cookies/headers. Do not recreate the response.
          cookiesToSet.forEach(({ name, value, options }) => {
            // Merge with our auth cookie options to ensure 7-day maxAge
            // Pass cookie name to protect PKCE verifier cookies
            const mergedOptions = mergeAuthCookieOptions(options, name)
            supabaseResponse.cookies.set(name, value, mergedOptions)
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser()

  const isAuthenticated = !!user

  // Get session only in dev for logging (not needed for production)
  let session = null
  if (isDev) {
    const {
      data: { session: sessionData },
    } = await supabase.auth.getSession()
    session = sessionData

    // Dev-only session debug info
    const authCookies = request.cookies.getAll().filter((cookie) =>
      cookie.name.startsWith('sb-') || cookie.name.includes('auth')
    )
    
    console.log('[middleware]', {
      path: pathname,
      authed: isAuthenticated,
      userId: user?.id,
      isPublicRoute,
      isProtectedRoute,
      sessionExpiry: session?.expires_at
        ? new Date(session.expires_at * 1000).toISOString()
        : null,
      cookieCount: authCookies.length,
      cookieNames: authCookies.map((c) => c.name),
    })

    if (getUserError) {
      console.warn('[middleware] getUser error:', getUserError.message)
    }
  }

  // Helper to copy cookies from supabaseResponse to a redirect response
  // Ensures cookies (including maxAge) are preserved on redirects
  const copyCookiesToResponse = (response: NextResponse) => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      // Get existing cookie options, but ensure maxAge is always set to our 7-day value
      // This ensures session cookies persist even through redirects
      const existingOptions: any = {
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        path: cookie.path,
        maxAge: cookie.maxAge,
        domain: cookie.domain,
      }
      // Handle expires - convert number to Date if needed, or omit if not present
      if (cookie.expires !== undefined) {
        existingOptions.expires = cookie.expires instanceof Date 
          ? cookie.expires 
          : typeof cookie.expires === 'number' 
            ? new Date(cookie.expires) 
            : cookie.expires
      }
      // Re-apply merged options to ensure maxAge is always 7 days
      // Pass cookie name to protect PKCE verifier cookies
      const mergedOptions = mergeAuthCookieOptions(existingOptions, cookie.name)
      response.cookies.set(cookie.name, cookie.value, mergedOptions)
    })
  }

  // Always allow public routes and auth callback (critical for magic link flow)
  if (isPublicRoute) {
    // If user is authenticated and on login or home page, redirect to dashboard
    if (isAuthenticated && (pathname === '/login' || pathname === '/')) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      dashboardUrl.search = ''
      // Copy cookies from supabaseResponse to preserve session cookies
      const redirectResponse = NextResponse.redirect(dashboardUrl)
      copyCookiesToResponse(redirectResponse)
      return redirectResponse
    }
    // Otherwise, allow access to public routes
    return supabaseResponse
  }

  // Protect routes that require authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    // Copy cookies from supabaseResponse to preserve any cookies that were set
    const redirectResponse = NextResponse.redirect(loginUrl)
    copyCookiesToResponse(redirectResponse)
    return redirectResponse
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}

