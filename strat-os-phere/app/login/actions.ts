'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrigin } from '@/lib/server/origin'

interface AuthActionResult {
  success: boolean
  message?: string
}

export async function signIn(email: string): Promise<AuthActionResult> {
  const supabase = await createClient()
  const origin = await getOrigin()
  const redirectUrl = `${origin}/auth/callback?next=/dashboard`

  // Log origin and redirect URL in dev/preview (not production)
  const isDevOrPreview = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'
  if (isDevOrPreview) {
    console.log('[signIn] Before signInWithOtp', {
      origin,
      redirectUrl,
      emailRedirectTo: redirectUrl,
    })
  }

  // Ensure exact call signature with options.emailRedirectTo
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

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

