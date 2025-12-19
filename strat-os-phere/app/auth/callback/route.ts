import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'
import { mergeAuthCookieOptions } from '@/lib/supabase/cookie-options'

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const code = request.nextUrl.searchParams.get('code')
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type')
  const rawNext = request.nextUrl.searchParams.get('next') || '/dashboard'

  // Only allow relative redirects within this app to prevent open redirects.
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  console.log('[auth/callback]', {
    requestId,
    hasCode: !!code,
    hasTokenHash: !!tokenHash,
    type,
    next,
  })

  // Create response early so we can set cookies on it
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = next
  redirectUrl.search = ''
  let response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Merge with our auth cookie options to ensure 7-day maxAge
            const mergedOptions = mergeAuthCookieOptions(options)
            response.cookies.set(name, value, mergedOptions)
          })
        },
      },
    }
  )

  // Handle PKCE flow (code parameter) - used by signInWithOtp with emailRedirectTo
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] Code exchange failed', {
        requestId,
        error: error.message,
        code: error.code,
      })
      const errorUrl = request.nextUrl.clone()
      errorUrl.pathname = '/login'
      errorUrl.searchParams.set('error', 'auth-code-exchange-failed')
      return NextResponse.redirect(errorUrl)
    }

    console.log('[auth/callback] Code exchange succeeded', {
      requestId,
      userId: data.user?.id,
      redirectTo: next,
    })

    return response
  }

  // Handle token_hash flow (legacy OTP flow) - if present
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    })

    if (error) {
      console.error('[auth/callback] OTP verification failed', {
        requestId,
        error: error.message,
        code: error.code,
      })
      const errorUrl = request.nextUrl.clone()
      errorUrl.pathname = '/login'
      errorUrl.searchParams.set('error', 'auth-otp-verification-failed')
      return NextResponse.redirect(errorUrl)
    }

    console.log('[auth/callback] OTP verification succeeded', {
      requestId,
      userId: data.user?.id,
      redirectTo: next,
    })

    return response
  }

  // No valid auth parameters
  console.warn('[auth/callback] No valid auth parameters', {
    requestId,
    hasCode: !!code,
    hasTokenHash: !!tokenHash,
    type,
  })

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.searchParams.set('error', 'missing-auth-params')
  return NextResponse.redirect(loginUrl)
}


