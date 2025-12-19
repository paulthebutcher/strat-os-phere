import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { headers } from "next/headers"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets the origin URL for the current request, using x-forwarded-host and
 * x-forwarded-proto headers when available (e.g., on Vercel Preview/Production).
 * Falls back to localhost for local development.
 */
export async function getOrigin(): Promise<string> {
  const headersList = await headers()
  const forwardedHost = headersList.get("x-forwarded-host")
  const forwardedProto = headersList.get("x-forwarded-proto")
  
  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`
  }
  
  // Fallback for local development
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}

