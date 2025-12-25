'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { getNextBestAction } from '@/lib/projects/nextBestAction'
import { GenerateAnalysisButton } from '@/components/projects/GenerateAnalysisButton'

interface OpportunitiesStatusHeaderProps {
  projectId: string
  competitorCount: number
  coverage: EvidenceCoverageLite
  hasOpportunitiesArtifact: boolean
  className?: string
}

/**
 * OpportunitiesStatusHeader - Unified progress & results header
 * 
 * Replaces the separate "Collecting evidence" banner and "Partial results" callout
 * with a single, compact header that:
 * - Shows readiness state ("Early results" vs "Results ready")
 * - Displays coverage metrics (competitors, sources, types, covered)
 * - Provides one primary CTA to improve coverage
 * 
 * Placed directly above the opportunities list to bring impact above the fold.
 */
export function OpportunitiesStatusHeader({
  projectId,
  competitorCount,
  coverage,
  hasOpportunitiesArtifact,
  className,
}: OpportunitiesStatusHeaderProps) {
  const isReady = coverage.isEvidenceSufficient

  // Determine status title and body
  const statusTitle = isReady ? 'Results ready' : 'Early results'
  const statusBody = isReady
    ? 'Coverage threshold met. Scores are stable and defensible.'
    : "We're still expanding coverage. These opportunities will sharpen as more sources are added."

  // Compute coverage metrics
  const competitorsWithEvidence = coverage.competitorIdsWithEvidence.length
  const totalSources = coverage.totalSources
  const evidenceTypes = coverage.evidenceTypesPresent.length
  const coveredRatio = competitorCount > 0 
    ? `${competitorsWithEvidence} / ${competitorCount}`
    : '0 / 0'

  // Determine next best action
  const nextAction = getNextBestAction({
    projectId,
    competitorCount,
    coverage,
    hasOpportunitiesArtifact,
  })

  // Determine CTA button
  const renderCTA = () => {
    if (nextAction.onClickIntent === 'generate') {
      return (
        <GenerateAnalysisButton
          projectId={projectId}
          label={nextAction.label}
          canGenerate={coverage.isEvidenceSufficient}
          missingReasons={coverage.isEvidenceSufficient ? [] : coverage.reasonsMissing}
        />
      )
    }

    if (nextAction.href) {
      // If coverage is sufficient, show secondary button
      if (isReady) {
        return (
          <Button asChild variant="secondary">
            <Link href={nextAction.href}>
              Refresh evidence
            </Link>
          </Button>
        )
      }

      // If coverage is insufficient, show primary button
      return (
        <Button asChild>
          <Link href={nextAction.href}>
            {nextAction.label}
          </Link>
        </Button>
      )
    }

    return null
  }

  // Get requirement text for incomplete coverage
  const requirementText = !isReady && coverage.reasonsMissing.length > 0
    ? coverage.reasonsMissing[0]
    : null

  return (
    <div
      className={cn(
        'rounded-lg border border-border-subtle bg-card p-4',
        className
      )}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Status (left) */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            {statusTitle}
          </h3>
          <p className="text-xs text-muted-foreground leading-normal">
            {statusBody}
          </p>
          {requirementText && (
            <p className="text-xs text-muted-foreground mt-1">
              {requirementText}
            </p>
          )}
        </div>

        {/* Coverage metrics and CTA (right) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
          {/* Coverage metrics (compact) */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              Competitors: {competitorCount}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Sources: {totalSources}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Types: {evidenceTypes}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Covered: {coveredRatio}
            </Badge>
          </div>

          {/* Primary CTA */}
          <div className="flex-shrink-0">
            {renderCTA()}
          </div>
        </div>
      </div>
    </div>
  )
}

