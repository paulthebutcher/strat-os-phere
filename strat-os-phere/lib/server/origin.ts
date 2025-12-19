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
  const isPreview = process.env.VERCEL_ENV === 'preview'
  
  // Prefer forwarded headers (Vercel sets these for Preview and Production)
  // This ensures staging/preview URLs return to the same host
  if (forwardedHost && forwardedProto) {
    // forwardedHost can be a comma-separated list
    // Proxies can prepend values, so take the LAST entry (most recent/trusted)
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
  // Use https in production/preview, http in development
  if (host) {
    // VERCEL environment variable indicates Vercel deployment
    const isVercel = !!process.env.VERCEL
    const protocol = (process.env.NODE_ENV === 'production' || isVercel) ? 'https' : 'http'
    return `${protocol}://${host}`
  }
  
  // Final fallback for local development only
  // Never use hardcoded production domain - always use actual request host
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  }
  
  // Should never reach here if headers are set correctly
  // Log error and throw to prevent silent failures
  console.error('[getOrigin] ERROR: No host headers found', {
    hasForwardedHost: !!forwardedHost,
    hasForwardedProto: !!forwardedProto,
    hasHost: !!host,
    nodeEnv: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
  })
  throw new Error('Unable to determine origin: no host headers available')
}

