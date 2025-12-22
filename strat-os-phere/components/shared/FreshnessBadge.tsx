import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

interface FreshnessBadgeProps {
  /**
   * ISO timestamp string (e.g., from artifact.created_at or artifact.content.generated_at)
   */
  timestamp: string | null | undefined
  /**
   * Optional prefix text (e.g., "Updated")
   */
  prefix?: string
  /**
   * Custom className
   */
  className?: string
}

/**
 * Formats a timestamp into a human-readable "freshness" string
 * Examples: "Updated today", "Updated 2 days ago", "Updated 7 days ago"
 */
function formatFreshness(timestamp: string | null | undefined): string | null {
  if (!timestamp) return null

  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Same day - check if same hour
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        if (diffMinutes < 1) return 'Just now'
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
      }
      if (diffHours === 1) return '1 hour ago'
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return '1 day ago'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months !== 1 ? 's' : ''} ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} year${years !== 1 ? 's' : ''} ago`
    }
  } catch {
    return null
  }
}

/**
 * Badge component showing data freshness/recency
 * Used near section headers to indicate when data was last updated
 */
export function FreshnessBadge({
  timestamp,
  prefix = 'Updated',
  className,
}: FreshnessBadgeProps) {
  const freshness = formatFreshness(timestamp)

  if (!freshness) return null

  return (
    <Badge
      variant="secondary"
      className={`inline-flex items-center gap-1.5 text-xs ${className || ''}`}
    >
      <Clock className="h-3 w-3" />
      <span>
        {prefix} {freshness}
      </span>
    </Badge>
  )
}

