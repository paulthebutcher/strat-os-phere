import "server-only"
import { createClient } from './server'
import { AUTH_COOKIE_MAX_AGE_SECONDS } from '@/lib/constants'

/**
 * Dev-only utility to debug session status.
 * Returns session information including expiry times and cookie status.
 */
export async function getSessionDebugInfo() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!user || !session) {
    return {
      authenticated: false,
      message: 'No active session',
    }
  }

  const now = Math.floor(Date.now() / 1000)
  const expiresAt = session.expires_at || 0
  const expiresIn = expiresAt - now
  const expiresInDays = expiresIn / (60 * 60 * 24)
  const cookieMaxAgeDays = AUTH_COOKIE_MAX_AGE_SECONDS / (60 * 60 * 24)

  return {
    authenticated: true,
    userId: user.id,
    email: user.email,
    sessionExpiresAt: new Date(expiresAt * 1000).toISOString(),
    sessionExpiresIn: `${expiresInDays.toFixed(2)} days`,
    cookieMaxAge: `${cookieMaxAgeDays} days`,
    willRefresh: expiresIn < AUTH_COOKIE_MAX_AGE_SECONDS / 2, // Refresh when less than half time remaining
    lastRefresh: session.refresh_token ? 'Available' : 'N/A',
  }
}

