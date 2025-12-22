/**
 * Formats a date string as a relative time (e.g., "2d ago", "3h ago").
 * Returns "—" if the date is invalid or missing.
 */
export function formatRelativeDate(dateString: string | null | undefined): string {
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

