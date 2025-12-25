/**
 * Time Labels - Consistent relative time formatting
 * 
 * Provides utilities for formatting relative time labels used consistently
 * across the UI (e.g., "1h ago", "2d ago", "No runs yet").
 */

/**
 * Format a date string as a relative time label (e.g., "1h ago", "2d ago").
 * Returns "—" if the date is invalid or missing.
 */
export function formatTimeLabel(dateString: string | null | undefined): string {
  if (!dateString) {
    return '—'
  }

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '—'
    }

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffSeconds < 60) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else if (diffWeeks < 4) {
      return `${diffWeeks}w ago`
    } else if (diffMonths < 12) {
      return `${diffMonths}mo ago`
    } else {
      return `${diffYears}y ago`
    }
  } catch {
    return '—'
  }
}

/**
 * Format "No runs yet" helper text for projects that have never been run
 */
export function formatNoRunsLabel(): string {
  return 'No runs yet'
}

