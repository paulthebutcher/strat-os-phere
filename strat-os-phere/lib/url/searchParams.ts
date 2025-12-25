/**
 * Query parameter parsing utilities for Next.js searchParams
 * 
 * Next.js App Router provides searchParams as Record<string, string | string[] | undefined>
 * This module provides utilities to safely extract and parse query parameters.
 * 
 * @example
 * // Boolean parsing (supports true, "true", "1", "yes", "y", "on")
 * const justGenerated = getBool(searchParams?.justGenerated)
 * 
 * @example
 * // String extraction
 * const runId = getString(searchParams?.runId)
 * 
 * @example
 * // Get first value from array (handles string | string[] | undefined)
 * const value = getFirst(searchParams?.tab)
 */

export type SearchParamValue = string | string[] | undefined;

/**
 * Extract the first value from a search parameter
 * 
 * Handles arrays by returning the first element, strings as-is, and undefined for missing values.
 * 
 * @param value - The search parameter value (string | string[] | undefined)
 * @returns The first string value, or undefined if not present
 */
export function getFirst(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Parse a search parameter as a boolean
 * 
 * Returns true for: "true", "1", "yes", "y", "on" (case-insensitive)
 * Returns false for all other values (including undefined, empty string, "false", "0", etc.)
 * 
 * @param value - The search parameter value (string | string[] | undefined)
 * @returns true if the value represents a truthy boolean, false otherwise
 */
export function getBool(value: SearchParamValue): boolean {
  const v = (getFirst(value) ?? "").toLowerCase().trim();
  return v === "true" || v === "1" || v === "yes" || v === "y" || v === "on";
}

/**
 * Extract a string value from a search parameter
 * 
 * Returns the first value if it's an array, the string if it's a string,
 * or undefined if not present.
 * 
 * @param value - The search parameter value (string | string[] | undefined)
 * @returns The string value, or undefined if not present
 */
export function getString(value: SearchParamValue): string | undefined {
  const v = getFirst(value);
  return v === undefined ? undefined : v;
}

