'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrigin } from '@/lib/utils'

interface AuthActionResult {
  success: boolean
  message?: string
}

export async function signIn(email: string): Promise<AuthActionResult> {
  const supabase = await createClient()
  const origin = await getOrigin()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    // Temporary logging to aid Supabase debugging
    console.error('Failed to send sign-in link', error)

    return { success: false, message: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

