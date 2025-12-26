'use client'

import { cn } from '@/lib/utils'
import type { DecisionRunState } from '@/lib/decisionRun/getDecisionRunState'
import type { EvidenceCoverageLite } from '@/lib/evidence/coverageLite'

interface EvidenceProgressStripProps {
  decisionRunState?: DecisionRunState | null
  coverage?: EvidenceCoverageLite
  competitorCount?: number
  className?: string
}

/**
 * EvidenceProgressStrip Component
 * 
 * Compact progress strip that shows evidence collection status.
 * Replaces the big system banner with a slim, informative strip.
 */
export function EvidenceProgressStrip({
  decisionRunState,
  coverage,
  competitorCount = 0,
  className,
}: EvidenceProgressStripProps) {
  // Determine if evidence is complete
  const isComplete = decisionRunState?.runStatus === 'complete' && 
                     decisionRunState?.evidenceStatus === 'complete'

  // Determine if evidence is in progress
  const isInProgress = decisionRunState?.runStatus === 'running' || 
                       decisionRunState?.evidenceStatus === 'partial'

  // If complete, show green status (can collapse after a few seconds)
  if (isComplete) {
    return (
      <div
        className={cn(
          'rounded-md border border-success/20 bg-success/5 px-4 py-2 text-sm',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-success font-medium">Evidence complete</span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {competitorCount > 0 && (
              <span>{competitorCount} {competitorCount === 1 ? 'competitor' : 'competitors'}</span>
            )}
            {coverage?.totalSources ? (
              <span>{coverage.totalSources} {coverage.totalSources === 1 ? 'source' : 'sources'}</span>
            ) : null}
            {coverage?.evidenceTypesPresent.length ? (
              <span>{coverage.evidenceTypesPresent.length} {coverage.evidenceTypesPresent.length === 1 ? 'type' : 'types'}</span>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  // If in progress, show progress strip
  if (isInProgress) {
    const message = decisionRunState?.runStatus === 'running'
      ? 'Collecting evidence… results will improve as sources are processed.'
      : 'Evidence in progress'

    // Approximate progress (can be improved with actual progress tracking)
    const progressPercent = coverage?.totalSources 
      ? Math.min(100, (coverage.totalSources / (competitorCount * 5)) * 100) 
      : undefined

    return (
      <div
        className={cn(
          'rounded-md border border-primary/20 bg-primary/5 px-4 py-2 text-sm',
          className
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-foreground font-medium">{message}</span>
            </div>
            {progressPercent !== undefined && (
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(10, progressPercent)}%` }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
            {competitorCount > 0 && (
              <span>{competitorCount} {competitorCount === 1 ? 'competitor' : 'competitors'}</span>
            )}
            {coverage?.totalSources ? (
              <span>{coverage.totalSources} {coverage.totalSources === 1 ? 'source' : 'sources'}</span>
            ) : null}
            {coverage?.evidenceTypesPresent.length ? (
              <span>{coverage.evidenceTypesPresent.length} {coverage.evidenceTypesPresent.length === 1 ? 'type' : 'types'}</span>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  // No progress to show
  return null
}

