'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { DecisionRunState } from '@/lib/decisionRun/getDecisionRunState'

interface DecisionRunStatusBannerProps {
  state: DecisionRunState
  className?: string
}

/**
 * DecisionRunStatusBanner - Persistent banner showing run/evidence status
 * 
 * Shows a thin banner at the top of project pages (Opportunities / Evidence / Appendix)
 * driven by DecisionRunState to provide a "heartbeat" of what the system is doing.
 */
export function DecisionRunStatusBanner({
  state,
  className,
}: DecisionRunStatusBannerProps) {
  // Determine banner content based on state
  const bannerContent = React.useMemo(() => {
    if (state.runStatus === 'running') {
      return {
        message: 'Collecting evidence… results will improve as sources are processed.',
        styles: 'border-primary/20 bg-primary/5',
      }
    }

    if (state.evidenceStatus === 'partial') {
      return {
        message: 'Results are directional. Add coverage to strengthen confidence.',
        styles: 'border-warning/20 bg-warning/5',
      }
    }

    if (state.runStatus === 'complete' && state.evidenceStatus === 'complete') {
      // Optional: show last updated date if available
      // For now, we'll show nothing for complete state (as per PR requirements)
      return null
    }

    // Default: no banner for other states
    return null
  }, [state])

  // Don't render if no content
  if (!bannerContent) {
    return null
  }

  return (
    <div
      className={cn(
        'rounded-md border p-3 text-sm',
        bannerContent.styles,
        className
      )}
    >
      <p className="text-muted-foreground leading-normal">
        {bannerContent.message}
      </p>
    </div>
  )
}

