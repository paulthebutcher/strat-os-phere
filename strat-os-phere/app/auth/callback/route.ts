import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const rawNext = url.searchParams.get('next') || '/dashboard'

  // Only allow relative redirects within this app to prevent open redirects.
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  let response = NextResponse.redirect(new URL(next, url.origin))

  if (!code) {
    const redirectUrl = new URL('/login', url.origin)
    return NextResponse.redirect(redirectUrl)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const errorUrl = new URL('/login', url.origin)
    errorUrl.searchParams.set('error', 'auth-code-exchange-failed')
    return NextResponse.redirect(errorUrl)
  }

  return response
}


