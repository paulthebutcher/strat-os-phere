'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export type CoverageLevel = 'limited' | 'moderate' | 'strong'

interface CoverageIndicatorProps {
  level: CoverageLevel
  sourceCount?: number
  competitorCount?: number
  className?: string
}

/**
 * CoverageIndicator - Non-scoring indicator showing evidence coverage level
 * 
 * Shows: Limited / Moderate / Strong
 * Includes optional counts if available: "9 sources across 2 competitors"
 * Helper text: "Based on available public evidence"
 */
export function CoverageIndicator({
  level,
  sourceCount,
  competitorCount,
  className,
}: CoverageIndicatorProps) {
  const getLevelLabel = () => {
    switch (level) {
      case 'limited':
        return 'Limited'
      case 'moderate':
        return 'Moderate'
      case 'strong':
        return 'Strong'
    }
  }

  const getLevelVariant = (): 'warning' | 'info' | 'success' => {
    switch (level) {
      case 'limited':
        return 'warning'
      case 'moderate':
        return 'info'
      case 'strong':
        return 'success'
    }
  }

  const hasCounts = sourceCount !== undefined || competitorCount !== undefined

  const countText = React.useMemo(() => {
    if (!hasCounts) return null

    const parts: string[] = []
    if (sourceCount !== undefined) {
      parts.push(`${sourceCount} source${sourceCount !== 1 ? 's' : ''}`)
    }
    if (competitorCount !== undefined) {
      parts.push(`${competitorCount} competitor${competitorCount !== 1 ? 's' : ''}`)
    }

    if (parts.length === 0) return null

    if (parts.length === 1) {
      return parts[0]
    }

    // "9 sources across 2 competitors"
    if (sourceCount !== undefined && competitorCount !== undefined) {
      return `${sourceCount} source${sourceCount !== 1 ? 's' : ''} across ${competitorCount} competitor${competitorCount !== 1 ? 's' : ''}`
    }

    return parts.join(', ')
  }, [sourceCount, competitorCount, hasCounts])

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge variant={getLevelVariant()}>
        {getLevelLabel()}
      </Badge>
      <span className="text-sm text-muted-foreground">
        {countText ? (
          <>
            {countText} • Based on available public evidence
          </>
        ) : (
          'Based on available public evidence'
        )}
      </span>
    </div>
  )
}

