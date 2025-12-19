import "server-only"
import { headers } from "next/headers"

/**
 * Gets the origin URL for the current request, using x-forwarded-host and
 * x-forwarded-proto headers when available (e.g., on Vercel Preview/Production).
 * Falls back to localhost for local development.
 * 
 * Handles www vs apex domain consistently - uses whatever domain the request came from.
 */
export async function getOrigin(): Promise<string> {
  const headersList = await headers()
  const forwardedHost = headersList.get("x-forwarded-host")
  const forwardedProto = headersList.get("x-forwarded-proto")
  const host = headersList.get("host")
  
  // Prefer forwarded headers (Vercel sets these)
  if (forwardedHost && forwardedProto) {
    // forwardedHost can be a comma-separated list, take the first one
    const host = forwardedHost.split(',')[0].trim()
    return `${forwardedProto}://${host}`
  }
  
  // Fallback to host header if available
  if (host) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    return `${protocol}://${host}`
  }
  
  // Final fallback for local development only
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  }
  
  // Production fallback - should not happen if headers are set correctly
  // But if it does, log a warning
  console.warn('[getOrigin] No host headers found, using fallback')
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.myplinth.com"
}

