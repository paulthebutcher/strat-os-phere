'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { EvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { MIN_COMPETITORS } from '@/lib/evidence/coverageLite'

interface ProjectStatusBarProps {
  competitorCount: number
  coverage: EvidenceCoverageLite
  hasOpportunitiesArtifact: boolean
}

type ProjectStatus = 'Not ready' | 'Collecting evidence' | 'Ready to generate' | 'Opportunities ready'

/**
 * ProjectStatusBar - Slim header showing project status with one-line detail and metrics
 * 
 * Status logic (deterministic, conservative):
 * - If competitorCount < MIN_COMPETITORS: "Not ready"
 * - Else if !coverage.isEvidenceSufficient: "Collecting evidence"
 * - Else if coverage.isEvidenceSufficient && !hasOpportunitiesArtifact: "Ready to generate"
 * - Else if hasOpportunitiesArtifact: "Opportunities ready"
 */
export function ProjectStatusBar({
  competitorCount,
  coverage,
  hasOpportunitiesArtifact,
}: ProjectStatusBarProps) {
  // Determine status and detail
  const statusInfo = React.useMemo((): { status: ProjectStatus; detail: string } => {
    if (competitorCount < MIN_COMPETITORS) {
      return {
        status: 'Not ready',
        detail: `Add at least ${MIN_COMPETITORS} competitors to begin.`,
      }
    }

    if (!coverage.isEvidenceSufficient) {
      return {
        status: 'Collecting evidence',
        detail: coverage.reasonsMissing[0] ?? 'Add more public evidence to enable ranked opportunities.',
      }
    }

    if (coverage.isEvidenceSufficient && !hasOpportunitiesArtifact) {
      return {
        status: 'Ready to generate',
        detail: 'Evidence coverage meets the threshold. You can generate ranked opportunities.',
      }
    }

    // hasOpportunitiesArtifact
    return {
      status: 'Opportunities ready',
      detail: 'Ranked opportunities are available for review.',
    }
  }, [competitorCount, coverage, hasOpportunitiesArtifact])

  // Status styling
  const statusStyles = React.useMemo(() => {
    switch (statusInfo.status) {
      case 'Not ready':
        return 'border-border bg-muted/30'
      case 'Collecting evidence':
        return 'border-primary/20 bg-primary/5'
      case 'Ready to generate':
        return 'border-success/20 bg-success/5'
      case 'Opportunities ready':
        return 'border-success/20 bg-success/5'
    }
  }, [statusInfo.status])

  return (
    <div
      className={cn(
        'rounded-md border px-4 py-3',
        statusStyles
      )}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Status and detail */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {statusInfo.status}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
            {statusInfo.detail}
          </p>
        </div>

        {/* Metrics (show if available) */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
          <div className="flex items-center gap-1">
            <span className="font-medium">Competitors:</span>
            <span>{competitorCount}</span>
          </div>
          {coverage.totalSources > 0 && (
            <>
              <div className="flex items-center gap-1">
                <span className="font-medium">Evidence sources:</span>
                <span>{coverage.totalSources}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Evidence types:</span>
                <span>{coverage.evidenceTypesPresent.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Competitors covered:</span>
                <span>{coverage.competitorIdsWithEvidence.length}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

