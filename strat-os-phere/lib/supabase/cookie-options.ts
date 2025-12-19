import { AUTH_COOKIE_MAX_AGE_SECONDS } from '@/lib/constants'
import type { CookieOptions } from '@supabase/ssr'

/**
 * Gets cookie options for Supabase auth cookies to ensure 7-day persistence.
 * Ensures cookies are httpOnly, secure in production, and have proper maxAge.
 */
export function getAuthCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  }
}

/**
 * Merges Supabase cookie options with our auth cookie options.
 * Ensures maxAge and other security settings are always applied.
 */
export function mergeAuthCookieOptions(
  existingOptions?: CookieOptions
): CookieOptions {
  const authOptions = getAuthCookieOptions()
  
  return {
    ...existingOptions,
    ...authOptions,
    // Ensure maxAge is always set to our 7-day value
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  }
}

