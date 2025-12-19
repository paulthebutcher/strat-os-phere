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

  // Dev-only logging to debug redirect URL
  if (process.env.NODE_ENV === 'development') {
    console.log('[signIn]', {
      origin,
      redirectUrl,
    })
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  })

  if (error) {
    console.error('[signIn] Failed to send sign-in link', {
      error: error.message,
      code: error.code,
      redirectUrl,
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

