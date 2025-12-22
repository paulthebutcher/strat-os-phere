'use client'

import { Badge } from '@/components/ui/badge'
import { SectionCard } from '@/components/results/SectionCard'
import { computeEvidenceCoverage, type EvidenceCoverage } from '@/lib/results/coverage'
import { cn } from '@/lib/utils'

interface EvidenceCoveragePanelProps {
  artifact: unknown
  compact?: boolean
  className?: string
}

/**
 * Evidence Coverage Panel
 * 
 * Displays coverage metrics computed from artifact content.
 * Shows total citations, source types, recency, and coverage score.
 */
export function EvidenceCoveragePanel({
  artifact,
  compact = false,
  className,
}: EvidenceCoveragePanelProps) {
  const coverage = computeEvidenceCoverage(artifact)

  // Map coverage score to badge variant
  const scoreVariant =
    coverage.coverageScore >= 70
      ? 'success'
      : coverage.coverageScore >= 40
      ? 'warning'
      : 'default'

  // Limit notes in compact mode
  const displayNotes = compact
    ? coverage.coverageNotes.slice(0, 3)
    : coverage.coverageNotes

  return (
    <SectionCard className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground mb-2">
            Evidence & coverage
          </h3>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant={scoreVariant} className="text-sm px-3 py-1">
            {coverage.coverageScore}/100
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Total citations
          </div>
          <div className="text-sm text-foreground">
            {coverage.totalCitations} citation{coverage.totalCitations !== 1 ? 's' : ''}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Source types
          </div>
          <div className="text-sm text-foreground">
            {coverage.sourceTypes.length} type{coverage.sourceTypes.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Recency
          </div>
          <div className="text-sm text-foreground">{coverage.recencyLabel}</div>
        </div>
      </div>

      {/* Source types breakdown */}
      {coverage.sourceTypes.length > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Coverage by source type
          </div>
          <div className="flex flex-wrap gap-2">
            {coverage.sourceTypes.map(({ type, count }) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type.replace(/_/g, ' ')}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Coverage notes */}
      {displayNotes.length > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Notes
          </div>
          <ul className="space-y-1">
            {displayNotes.map((note, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {coverage.totalCitations === 0 && (
        <div className="text-sm text-muted-foreground text-center py-4">
          No citations found yet. Results are directional until evidence is added.
        </div>
      )}
    </SectionCard>
  )
}

