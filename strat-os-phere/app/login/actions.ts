'use server'

import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server'
import { getOrigin } from '@/lib/server/origin'
import type { Database } from '@/lib/supabase/database.types'
import { logger } from '@/lib/logger'

interface AuthActionResult {
  success: boolean
  message?: string
}

export async function signIn(email: string): Promise<AuthActionResult> {
  const origin = await getOrigin()
  const redirectUrl = `${origin}/auth/callback`

  // Check if we should use direct GoTrue call (preview only, behind env flag)
  const useGoTrueDirect = process.env.VERCEL_ENV === 'preview' && process.env.USE_GOTRUE_DIRECT === 'true'

  if (useGoTrueDirect) {
    // Bypass SDK and call GoTrue directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    logger.auth.debug('Using direct GoTrue call', { origin, redirectUrl })

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/otp`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          redirect_to: redirectUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        logger.error('Direct GoTrue call failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        return {
          success: false,
          message: errorData.message || `GoTrue error: ${response.statusText}`,
        }
      }

      logger.auth.debug('Direct GoTrue call succeeded', { status: response.status })

      return { success: true }
    } catch (error) {
      logger.error('Direct GoTrue call exception', {
        error: error instanceof Error ? error.message : String(error),
      })
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Default path: Use Supabase SDK with SSR cookie support for PKCE
  // Create SSR client with cookie write support so PKCE verifier cookie is set
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // the user's session.
          }
        },
      },
    }
  )

  logger.auth.debug('Signing in with OTP', { origin, redirectUrl })

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectUrl }
  })

  if (error) {
    logger.error('Failed to send sign-in link', {
      error: error.message,
      code: error.code,
      status: error.status,
    })

    return { success: false, message: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

