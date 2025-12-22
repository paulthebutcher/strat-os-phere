'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface MergeBadgeProps {
  mergedCount: number
  mergedTitles: string[]
  className?: string
}

/**
 * Merge Badge
 * 
 * Shows "Merged (N)" when an opportunity was merged from duplicates.
 * Tooltip shows the list of merged titles.
 */
export function MergeBadge({
  mergedCount,
  mergedTitles,
  className,
}: MergeBadgeProps) {
  if (mergedCount <= 1) {
    return null
  }

  const [showTooltip, setShowTooltip] = useState(false)

  // Truncate titles for display
  const displayTitles = mergedTitles.slice(0, 3)
  const hasMore = mergedTitles.length > 3

  return (
    <div className={cn('relative inline-block', className)}>
      <Badge
        variant="secondary"
        className="text-xs cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        Merged ({mergedCount})
      </Badge>
      {showTooltip && mergedTitles.length > 0 && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 p-2 bg-popover border border-border rounded-md shadow-lg text-xs">
          <div className="font-semibold text-foreground mb-1">Merged from:</div>
          <ul className="space-y-1 text-muted-foreground">
            {displayTitles.map((title, index) => (
              <li key={index} className="truncate">
                • {title}
              </li>
            ))}
            {hasMore && (
              <li className="text-muted-foreground italic">
                +{mergedTitles.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

