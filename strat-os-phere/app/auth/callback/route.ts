import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'
import { mergeAuthCookieOptions } from '@/lib/supabase/cookie-options'

/**
 * Helper to copy all cookies from one response to another.
 * Ensures cookies set by Supabase are preserved on redirect responses.
 */
function applyCookies(fromResponse: NextResponse, toResponse: NextResponse) {
  fromResponse.cookies.getAll().forEach((cookie) => {
    const existingOptions: any = {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
      domain: cookie.domain,
    }
    // Handle expires - convert number to Date if needed
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
    toResponse.cookies.set(cookie.name, cookie.value, mergedOptions)
  })
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const code = request.nextUrl.searchParams.get('code')
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type')
  const rawNext = request.nextUrl.searchParams.get('next')

  // Validate and sanitize next parameter - default to /dashboard
  let next = '/dashboard'
  if (rawNext) {
    // Only allow relative paths starting with / (no http, no //)
    if (rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('http')) {
      next = rawNext
    }
  }

  // Log request details (safe for prod - no secrets)
  const requestUrl = `${request.nextUrl.pathname}${request.nextUrl.search ? '?' + request.nextUrl.search.replace(/code=[^&]*/, 'code=***').replace(/token_hash=[^&]*/, 'token_hash=***') : ''}`
  
  // Debug: log incoming cookie names (preview/dev only)
  const isDevOrPreview = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'
  const incomingCookies = request.cookies.getAll()
  const incomingCookieNames = incomingCookies.map(c => c.name)
  const hasVerifierCookie = incomingCookieNames.some(name => 
    name.includes('code-verifier') || name.includes('pkce')
  )
  
  console.log('[auth/callback]', {
    requestId,
    url: requestUrl,
    hasCode: !!code,
    hasTokenHash: !!tokenHash,
    type: type || null,
    next,
    ...(isDevOrPreview && {
      incomingCookieNames,
      hasVerifierCookie,
    }),
  })

  // Create a temporary response to capture cookies from Supabase
  // We'll create the final redirect response after auth succeeds
  const tempResponse = NextResponse.next()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on temp response - we'll copy them to final redirect
          cookiesToSet.forEach(({ name, value, options }) => {
            // Pass cookie name to protect PKCE verifier cookies
            const mergedOptions = mergeAuthCookieOptions(options, name)
            tempResponse.cookies.set(name, value, mergedOptions)
          })
        },
      },
    }
  )

  // Handle PKCE flow (code parameter) - used by signInWithOtp with emailRedirectTo
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback]', {
        requestId,
        result: 'exchangeFailed',
        error: error.message,
        code: error.code,
        redirectTo: '/login',
      })
      const errorUrl = request.nextUrl.clone()
      errorUrl.pathname = '/login'
      errorUrl.searchParams.set('error', 'auth-code-exchange-failed')
      return NextResponse.redirect(errorUrl)
    }

    // Create final redirect response with cookies
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = next
    redirectUrl.search = ''
    const finalResponse = NextResponse.redirect(redirectUrl)
    
    // Copy all cookies from temp response (set by Supabase) to final redirect
    applyCookies(tempResponse, finalResponse)

    // One-line log: host and final redirect target
    const host = request.headers.get('host') || request.nextUrl.host
    console.log(`[auth/callback] ${host} -> ${next}`)

    console.log('[auth/callback]', {
      requestId,
      result: 'exchangeOk',
      userId: data.user?.id,
      redirectTo: next,
      cookieCount: finalResponse.cookies.getAll().length,
    })

    return finalResponse
  }

  // Handle token_hash flow (legacy OTP flow) - if present
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    })

    if (error) {
      console.error('[auth/callback]', {
        requestId,
        result: 'verifyFailed',
        error: error.message,
        code: error.code,
        redirectTo: '/login',
      })
      const errorUrl = request.nextUrl.clone()
      errorUrl.pathname = '/login'
      errorUrl.searchParams.set('error', 'auth-otp-verification-failed')
      return NextResponse.redirect(errorUrl)
    }

    // Create final redirect response with cookies
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = next
    redirectUrl.search = ''
    const finalResponse = NextResponse.redirect(redirectUrl)
    
    // Copy all cookies from temp response (set by Supabase) to final redirect
    applyCookies(tempResponse, finalResponse)

    // One-line log: host and final redirect target
    const host = request.headers.get('host') || request.nextUrl.host
    console.log(`[auth/callback] ${host} -> ${next}`)

    console.log('[auth/callback]', {
      requestId,
      result: 'verifyOk',
      userId: data.user?.id,
      redirectTo: next,
      cookieCount: finalResponse.cookies.getAll().length,
    })

    return finalResponse
  }

  // No valid auth parameters
  console.warn('[auth/callback]', {
    requestId,
    result: 'missingParams',
    hasCode: !!code,
    hasTokenHash: !!tokenHash,
    type: type || null,
    redirectTo: '/login',
  })

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.searchParams.set('error', 'missing_params')
  return NextResponse.redirect(loginUrl)
}


