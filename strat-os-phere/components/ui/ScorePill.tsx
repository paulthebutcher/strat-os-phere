'use client'

import { Badge } from '@/components/ui/badge'
import type { ComputedScore } from '@/lib/scoring/types'
import { cn } from '@/lib/utils'

interface ScorePillProps {
  score: ComputedScore
  className?: string
  showTooltip?: boolean
}

/**
 * ScorePill component for displaying scores with proper states
 * 
 * Variants:
 * - scored high (>=8)
 * - scored medium (5–7.9)
 * - scored low (<5)
 * - unscored (neutral)
 */
export function ScorePill({ score, className, showTooltip = false }: ScorePillProps) {
  if (score.status === 'unscored') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant="secondary" className="text-xs">
          N/A
        </Badge>
        {showTooltip && (
          <span className="text-xs text-muted-foreground">
            Not enough evidence yet
          </span>
        )}
      </div>
    )
  }

  if (score.value === null) {
    return (
      <Badge variant="secondary" className="text-xs">
        N/A
      </Badge>
    )
  }

  const value = score.value
  let variant: 'default' | 'secondary' | 'outline' = 'secondary'

  if (value >= 8) {
    variant = 'default' // High score - use primary/default variant
  } else if (value >= 5) {
    variant = 'secondary' // Medium score - use secondary variant
  } else {
    variant = 'secondary' // Low score - use secondary variant (could be enhanced with custom styling)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge variant={variant} className="text-xs">
        {value.toFixed(1)}/10
      </Badge>
      {showTooltip && score.evidenceCount > 0 && (
        <span className="text-xs text-muted-foreground">
          {score.evidenceCount} citation{score.evidenceCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}

