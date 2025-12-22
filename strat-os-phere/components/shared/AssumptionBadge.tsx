'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type AssumptionLevel = 'high_confidence' | 'some_assumptions' | 'exploratory' | null

interface AssumptionBadgeProps {
  /**
   * The confidence level based on available data
   */
  level: AssumptionLevel
  /**
   * Optional explanation of what was inferred (shown on hover/click)
   */
  explanation?: string
  /**
   * Optional custom className
   */
  className?: string
}

/**
 * AssumptionBadge: Read-only indicator showing confidence level of inputs
 * 
 * Displays a neutral badge indicating whether outputs are based on
 * high-confidence inputs or include assumptions. Hover/click reveals
 * a brief explanation of what was inferred.
 * 
 * Only shows if level is provided (hides entirely if data is missing).
 */
export function AssumptionBadge({
  level,
  explanation,
  className,
}: AssumptionBadgeProps) {
  const [showExplanation, setShowExplanation] = useState(false)

  // Hide entirely if no level provided
  if (!level) return null

  const config = {
    high_confidence: {
      label: 'High confidence inputs',
      variant: 'default' as const,
    },
    some_assumptions: {
      label: 'Some assumptions used',
      variant: 'secondary' as const,
    },
    exploratory: {
      label: 'Exploratory inputs',
      variant: 'secondary' as const,
    },
  }[level]

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className="relative">
        <Badge
          variant={config.variant}
          className="text-xs cursor-help"
          onMouseEnter={() => setShowExplanation(true)}
          onMouseLeave={() => setShowExplanation(false)}
          onClick={() => setShowExplanation(!showExplanation)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowExplanation(!showExplanation)
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={explanation ? 'Click for details' : undefined}
        >
          {config.label}
        </Badge>
        {showExplanation && explanation && (
          <div className="absolute left-0 top-full mt-2 z-50 w-64 p-2 text-xs text-foreground bg-background border border-border rounded-md shadow-lg">
            {explanation}
          </div>
        )}
      </div>
    </div>
  )
}

