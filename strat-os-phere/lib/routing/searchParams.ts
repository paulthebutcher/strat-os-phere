/**
 * Type-safe helpers for working with Next.js searchParams
 * 
 * Next.js App Router provides searchParams as Record<string, string | string[] | undefined>
 * This module provides utilities to safely extract and check query parameters.
 */

export type SearchParams = Record<string, string | string[] | undefined>

/**
 * Get a single string value from searchParams
 * 
 * @param sp - The searchParams object (may be undefined)
 * @param key - The parameter key to look up
 * @returns The string value, or undefined if not found
 * 
 * @example
 * const value = getParam(searchParams, 'tab')
 * // Returns 'overview' if ?tab=overview, undefined if not present
 */
export function getParam(
  sp: SearchParams | undefined,
  key: string
): string | undefined {
  if (!sp) return undefined
  const value = sp[key]
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

/**
 * Check if a search parameter is truthy
 * 
 * Returns true if the parameter value is "1", "true", or "yes" (case-insensitive)
 * 
 * @param sp - The searchParams object (may be undefined)
 * @param key - The parameter key to check
 * @returns true if the parameter is truthy, false otherwise
 * 
 * @example
 * const isGuided = isParamTruthy(searchParams, 'onboarding')
 * // Returns true if ?onboarding=1, ?onboarding=true, or ?onboarding=yes
 */
export function isParamTruthy(
  sp: SearchParams | undefined,
  key: string
): boolean {
  const value = getParam(sp, key)
  if (!value) return false
  const normalized = value.toLowerCase().trim()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

