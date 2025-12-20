'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getOrigin } from '@/lib/server/origin'

interface AuthActionResult {
  success: boolean
  message?: string
}

export async function signIn(email: string): Promise<AuthActionResult> {
  const origin = await getOrigin()
  const headersList = await headers()
  const forwardedHost = headersList.get("x-forwarded-host")
  const host = headersList.get("host")
  const isPreview = process.env.VERCEL_ENV === 'preview'
  const isDevOrPreview = process.env.NODE_ENV === 'development' || isPreview
  
  // Redirect URL is exactly ${origin}/auth/callback (no query string)
  const redirectUrl = `${origin}/auth/callback`

  // Canary proof: include canary info in return payload for dev/preview
  const canaryInfo = isDevOrPreview
    ? `canary=signIn_v2|origin=${origin}|redirectUrl=${redirectUrl}`
    : undefined

  // Check if we should use direct GoTrue call (preview only, behind env flag)
  const useGoTrueDirect = isPreview && process.env.USE_GOTRUE_DIRECT === 'true'

  if (useGoTrueDirect) {
    // Bypass SDK and call GoTrue directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    console.log('[signIn] Using direct GoTrue call', {
      origin,
      redirectUrl,
      supabaseUrl,
    })

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
        console.error('[signIn] Direct GoTrue call failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          redirectUrl,
          origin,
        })
        return {
          success: false,
          message: errorData.message || `GoTrue error: ${response.statusText}`,
        }
      }

      console.log('[signIn] Direct GoTrue call succeeded', {
        origin,
        redirectUrl,
        status: response.status,
      })

      return {
        success: true,
        message: canaryInfo,
      }
    } catch (error) {
      console.error('[signIn] Direct GoTrue call exception', {
        error: error instanceof Error ? error.message : String(error),
        redirectUrl,
        origin,
      })
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Default path: Use Supabase SDK
  // Create direct Supabase client with PKCE flow explicitly
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce'
      }
    }
  )

  // Log origin and redirect URL in dev/preview (not production)
  if (isDevOrPreview) {
    console.log('[signIn] Before signInWithOtp', {
      origin,
      redirectUrl,
      emailRedirectTo: redirectUrl,
      flowType: 'pkce',
      vercelEnv: process.env.VERCEL_ENV,
      xForwardedHost: forwardedHost,
      host: host,
    })
  }

  // Use correct v2 signature with emailRedirectTo
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectUrl }
  })

  // Log after signInWithOtp in dev/preview (for debugging)
  if (isDevOrPreview) {
    console.log('[signIn] After signInWithOtp', {
      origin,
      redirectUrl,
      hasData: !!data,
      dataKeys: data ? Object.keys(data).filter(k => k !== 'user' && !k.includes('token')) : null,
      error: error ? {
        message: error.message,
        code: error.code,
        status: error.status,
      } : null,
    })
  }

  if (error) {
    console.error('[signIn] Failed to send sign-in link', {
      error: error.message,
      code: error.code,
      status: error.status,
      redirectUrl,
      origin,
      emailRedirectTo: redirectUrl,
    })

    // Surface error to UI - includes redirect allowlist errors
    return { success: false, message: error.message }
  }

  return {
    success: true,
    message: canaryInfo,
  }
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

