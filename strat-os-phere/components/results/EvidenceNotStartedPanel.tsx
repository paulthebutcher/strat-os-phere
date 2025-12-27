'use client'

import { EvidenceEmptyStateActionable } from '@/components/evidence/EvidenceEmptyStateActionable'
import { cn } from '@/lib/utils'

interface EvidenceNotStartedPanelProps {
  className?: string
  projectId?: string
  /**
   * If true, indicates a run exists but no evidence has been collected for it yet
   * Shows different messaging in this case
   */
  hasRun?: boolean
  /**
   * Competitor count for empty state checklist
   */
  competitorCount?: number
  /**
   * Evidence source count for empty state checklist
   */
  evidenceSourceCount?: number
}

/**
 * Evidence Not Started Panel
 * 
 * Shown when evidence collection has not been run yet.
 * Uses the actionable empty state component with checklist and CTAs.
 */
export function EvidenceNotStartedPanel({
  className,
  projectId,
  hasRun = false,
  competitorCount = 0,
  evidenceSourceCount = 0,
}: EvidenceNotStartedPanelProps) {
  // If no projectId, return null (shouldn't happen, but guard against it)
  if (!projectId) {
    return null
  }

  return (
    <EvidenceEmptyStateActionable
      projectId={projectId}
      competitorCount={competitorCount}
      evidenceSourceCount={evidenceSourceCount}
      className={className}
    />
  )
}

