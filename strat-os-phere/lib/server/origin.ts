import "server-only"
import { headers } from "next/headers"

/**
 * Gets the origin URL for the current request, using x-forwarded-host and
 * x-forwarded-proto headers when available (e.g., on Vercel Preview/Production).
 * Falls back to localhost for local development only.
 * 
 * This function is request-derived only and does not rely on NEXT_PUBLIC_SITE_URL
 * in production or preview environments. Origin is always computed from request headers.
 * 
 * Handles www vs apex domain consistently - uses whatever domain the request came from.
 */
export async function getOrigin(): Promise<string> {
  const headersList = await headers()
  const forwardedHost = headersList.get("x-forwarded-host")
  const forwardedProto = headersList.get("x-forwarded-proto")
  const host = headersList.get("host")
  const isPreview = process.env.VERCEL_ENV === 'preview'
  const isVercel = !!process.env.VERCEL
  
  // Prefer forwarded headers (Vercel sets these for Preview and Production)
  // This ensures staging/preview URLs return to the same host
  if (forwardedHost && forwardedProto) {
    // forwardedHost can be a comma-separated list
    // Proxies can prepend values, so choose the best match
    const hosts = forwardedHost.split(',').map(h => h.trim()).filter(Boolean)
    
    let selectedHost: string
    
    if (isPreview && hosts.length > 1) {
      // For preview deployments, prefer .vercel.app domain if present
      const vercelAppHost = hosts.find(h => h.endsWith('.vercel.app'))
      if (vercelAppHost) {
        selectedHost = vercelAppHost
      } else {
        // Fallback to last entry if no .vercel.app found
        selectedHost = hosts[hosts.length - 1]
      }
    } else {
      // For production or single host, take the last entry
      selectedHost = hosts[hosts.length - 1]
    }
    
    return `${forwardedProto}://${selectedHost}`
  }
  
  // Fallback to host header if available (works in all environments)
  if (host) {
    // Protocol rules:
    // - If x-forwarded-proto exists, use it (already handled above)
    // - Else if running on Vercel, use https
    // - Else use http
    const protocol = isVercel ? 'https' : 'http'
    return `${protocol}://${host}`
  }
  
  // Development fallback only
  // Only if NODE_ENV === 'development' and no host headers exist
  if (process.env.NODE_ENV === 'development') {
    return "http://localhost:3000"
  }
  
  // In non-dev environments, if no host headers exist, throw an error
  console.error('[getOrigin] ERROR: No host headers found in non-dev environment', {
    hasForwardedHost: !!forwardedHost,
    hasForwardedProto: !!forwardedProto,
    hasHost: !!host,
    nodeEnv: process.env.NODE_ENV,
    vercel: isVercel,
    vercelEnv: process.env.VERCEL_ENV,
  })
  throw new Error('Unable to determine origin: no host headers available. This should not happen in production/preview environments.')
}

