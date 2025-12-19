import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Debug endpoint to check authentication state.
 * Returns { authed: boolean, userId?: string }
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return NextResponse.json({
    authed: !!user,
    userId: user?.id,
  })
}

