import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const rawNext = request.nextUrl.searchParams.get('next') || '/dashboard'

  // Only allow relative redirects within this app to prevent open redirects.
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = next
  redirectUrl.search = ''
  let response = NextResponse.redirect(redirectUrl)

  if (!code) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    return NextResponse.redirect(loginUrl)
  }

  const supabase = createServerClient<Database>(
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
    const errorUrl = request.nextUrl.clone()
    errorUrl.pathname = '/login'
    errorUrl.searchParams.set('error', 'auth-code-exchange-failed')
    return NextResponse.redirect(errorUrl)
  }

  return response
}


