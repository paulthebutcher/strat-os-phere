/**
 * Date normalization and utility functions
 * Centralized date handling to prevent type inference issues
 */

/**
 * Convert various date-like values to a Date object
 * Accepts Date, ISO string, number (epoch ms), or null/undefined
 * Returns null if the value cannot be converted to a valid Date
 */
export function toDate(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null
  }

  if (value instanceof Date) {
    // Check if the date is valid
    return isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }

  // Handle objects with date properties (e.g., { date: ... })
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    if ('date' in obj) {
      return toDate(obj.date)
    }
    if ('extracted_at' in obj) {
      return toDate(obj.extracted_at)
    }
    if ('published_at' in obj) {
      return toDate(obj.published_at)
    }
    if ('source_date' in obj) {
      return toDate(obj.source_date)
    }
    if ('captured_at' in obj) {
      return toDate(obj.captured_at)
    }
    if ('created_at' in obj) {
      return toDate(obj.created_at)
    }
  }

  return null
}

/**
 * Find the newest (most recent) date from an array of date-like values
 * Returns null if no valid dates are found
 */
export function newestDate(values: unknown[]): Date | null {
  if (!Array.isArray(values) || values.length === 0) {
    return null
  }

  let newest: Date | null = null
  let newestTimestamp: number = -Infinity

  for (const value of values) {
    const date = toDate(value)
    if (date !== null) {
      const timestamp = date.getTime()
      if (timestamp > newestTimestamp) {
        newest = date
        newestTimestamp = timestamp
      }
    }
  }

  return newest
}

/**
 * Calculate days ago from a date
 * Returns null if the date is invalid
 */
export function daysAgo(date: Date | null): number | null {
  if (date === null) {
    return null
  }
  const diffMs = Date.now() - date.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

