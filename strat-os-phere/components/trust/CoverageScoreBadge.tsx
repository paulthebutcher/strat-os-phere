'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { computeCoverageScore } from '@/lib/scoring/coverageScore'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'
import { cn } from '@/lib/utils'

export interface CoverageScoreBadgeProps {
  bundle?: NormalizedEvidenceBundle | null
  competitorDomains?: string[]
  className?: string
  variant?: 'default' | 'compact'
}

/**
 * CoverageScoreBadge - Displays evidence coverage score with transparency
 * 
 * Shows:
 * - Numeric score (X.X/10) if evidence is sufficient
 * - "Insufficient evidence" if evidence is insufficient
 * - "Why this score?" dialog with detailed breakdown
 */
export function CoverageScoreBadge({
  bundle,
  competitorDomains = [],
  className,
  variant = 'default',
}: CoverageScoreBadgeProps) {
  const scoreResult = React.useMemo(
    () => computeCoverageScore(bundle, { competitorDomains }),
    [bundle, competitorDomains]
  )

  const { isSufficient, score10, scoreLabel, reasons } = scoreResult

  // Badge content
  const badgeContent = isSufficient && score10 !== undefined ? (
    <span className="font-semibold">{score10.toFixed(1)}/10</span>
  ) : (
    <span className="text-muted-foreground">Insufficient evidence</span>
  )

  // Badge variant based on score
  const badgeVariant = isSufficient && score10 !== undefined
    ? score10 >= 7.5
      ? 'success'
      : score10 >= 5.0
      ? 'info'
      : score10 >= 2.5
      ? 'warning'
      : 'secondary'
    : 'muted'

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <Badge variant={badgeVariant} className="text-xs">
          {badgeContent}
        </Badge>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Why this score?"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Coverage Score Details</DialogTitle>
              <DialogDescription>
                {isSufficient
                  ? `Score: ${score10?.toFixed(1)}/10 (${scoreLabel})`
                  : 'Evidence is insufficient to compute a score'}
              </DialogDescription>
            </DialogHeader>
            <ScoreDetails reasons={reasons} isSufficient={isSufficient} />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge variant={badgeVariant} className="text-xs">
        {badgeContent}
      </Badge>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Why this score?"
          >
            <Info className="h-3.5 w-3.5" />
            <span>Why this score?</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Coverage Score Details</DialogTitle>
            <DialogDescription>
              {isSufficient
                ? `Score: ${score10?.toFixed(1)}/10 (${scoreLabel})`
                : 'Evidence is insufficient to compute a score'}
            </DialogDescription>
          </DialogHeader>
          <ScoreDetails reasons={reasons} isSufficient={isSufficient} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * ScoreDetails - Renders detailed breakdown of score reasons
 */
function ScoreDetails({
  reasons,
  isSufficient,
}: {
  reasons: CoverageScoreBadgeProps['bundle'] extends null | undefined
    ? never
    : ReturnType<typeof computeCoverageScore>['reasons']
  isSufficient: boolean
}) {
  const {
    typesPresent,
    typesMissing,
    typeCount,
    totalTypesConsidered,
    firstPartyCount,
    thirdPartyCount,
    firstPartyRatio,
    newestAt,
    oldestAt,
    medianAgeDays,
    recencyScore,
    coverageScore,
    firstPartyScore,
    threshold,
    failedChecks,
  } = reasons

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 text-sm">
      {/* Summary */}
      {!isSufficient && (
        <div className="rounded-lg border border-warning/20 bg-warning/10 px-4 py-3">
          <p className="font-medium text-warning mb-2">Insufficient evidence to score yet</p>
          <p className="text-muted-foreground text-xs mb-3">
            Add more sources or competitors, then re-run analysis.
          </p>
          {failedChecks.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              {failedChecks.map((check, idx) => (
                <li key={idx}>{check}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Evidence Types */}
      <div>
        <h4 className="font-semibold mb-2">Evidence Types</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Types present:</span>
            <span className="font-medium">
              {typeCount} / {totalTypesConsidered}
            </span>
          </div>
          {typesPresent.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {typesPresent.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}
          {typesMissing.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Missing types:</p>
              <div className="flex flex-wrap gap-1.5">
                {typesMissing.map((type) => (
                  <Badge key={type} variant="muted" className="text-xs opacity-60">
                    {type.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sources */}
      <div>
        <h4 className="font-semibold mb-2">Sources</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total sources:</span>
            <span className="font-medium">{firstPartyCount + thirdPartyCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">First-party:</span>
            <span className="font-medium">
              {firstPartyCount} ({(firstPartyRatio * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Third-party:</span>
            <span className="font-medium">{thirdPartyCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Minimum required:</span>
            <span className="font-medium">{threshold.minTotalSources}</span>
          </div>
        </div>
      </div>

      {/* Recency */}
      <div>
        <h4 className="font-semibold mb-2">Recency</h4>
        <div className="space-y-2 text-xs">
          {newestAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Newest:</span>
              <span className="font-medium">{formatDate(newestAt)}</span>
            </div>
          )}
          {oldestAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Oldest:</span>
              <span className="font-medium">{formatDate(oldestAt)}</span>
            </div>
          )}
          {medianAgeDays !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Median age:</span>
              <span className="font-medium">
                {medianAgeDays} day{medianAgeDays !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Recency score:</span>
            <span className="font-medium">{(recencyScore * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Max age allowed:</span>
            <span className="font-medium">{threshold.maxMedianAgeDays} days</span>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      {isSufficient && (
        <div>
          <h4 className="font-semibold mb-2">Score Breakdown</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Coverage score:</span>
              <span className="font-medium">{(coverageScore * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Recency score:</span>
              <span className="font-medium">{(recencyScore * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">First-party score:</span>
              <span className="font-medium">{(firstPartyScore * 100).toFixed(0)}%</span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Weighted formula:</span>
                <span className="font-medium text-xs">
                  45% coverage + 35% recency + 20% first-party
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thresholds */}
      <div>
        <h4 className="font-semibold mb-2">Requirements</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Min sources:</span>
            <span className="font-medium">{threshold.minTotalSources}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Min evidence types:</span>
            <span className="font-medium">{threshold.minEvidenceTypes}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Min first-party ratio:</span>
            <span className="font-medium">{(threshold.minFirstPartyRatio * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Max median age:</span>
            <span className="font-medium">{threshold.maxMedianAgeDays} days</span>
          </div>
        </div>
      </div>
    </div>
  )
}

