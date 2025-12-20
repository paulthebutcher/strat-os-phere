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
 * 
 * IMPORTANT: PKCE verifier cookies (code-verifier, pkce) are NOT overridden
 * with 7-day maxAge - they need to remain short-lived for security.
 */
export function mergeAuthCookieOptions(
  existingOptions?: CookieOptions,
  cookieName?: string
): CookieOptions {
  // Protect PKCE verifier cookies from 7-day maxAge override
  const isVerifierCookie = cookieName && (
    cookieName.includes('code-verifier') || 
    cookieName.includes('pkce')
  )
  
  if (isVerifierCookie) {
    // For verifier cookies, only apply secure/samesite/path, keep original maxAge
    const isProduction = process.env.NODE_ENV === 'production'
    return {
      ...existingOptions,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      // Do NOT override maxAge for verifier cookies
      maxAge: existingOptions?.maxAge,
    }
  }
  
  // For session cookies, apply full 7-day maxAge
  const authOptions = getAuthCookieOptions()
  
  return {
    ...existingOptions,
    ...authOptions,
    // Ensure maxAge is always set to our 7-day value for session cookies
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  }
}

