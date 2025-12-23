'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { EvidenceCoverage } from '@/lib/evidence/claims/types'
import type { NormalizedEvidenceType } from '@/lib/evidence/types'

const TYPE_LABELS: Record<NormalizedEvidenceType, string> = {
  pricing: 'Pricing',
  docs: 'Docs',
  reviews: 'Reviews',
  changelog: 'Changelog',
  jobs: 'Jobs',
  security: 'Security',
  community: 'Community',
  blog: 'Blog',
  other: 'Other',
}

interface EvidenceTrustPanelProps {
  coverage: EvidenceCoverage
  lastUpdated?: string | null
  onViewEvidence?: () => void
}

/**
 * Format days ago message
 */
function formatDaysAgo(days: number): string {
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    return months === 1 ? '1 month ago' : `${months} months ago`
  }
  const years = Math.floor(days / 365)
  return years === 1 ? '1 year ago' : `${years} years ago`
}

/**
 * Compute median age message from recency score
 */
function computeRecencyMessage(recencyScore: number): string {
  // Inverse of recency score calculation
  // recencyScore 1.0 = 0-30 days
  // recencyScore 0.8 = 30-90 days
  // recencyScore 0.6 = 90-180 days
  // recencyScore 0.4 = 180-365 days
  // recencyScore 0.2 = >365 days
  
  if (recencyScore >= 0.9) return 'last 30 days'
  if (recencyScore >= 0.7) return 'last 90 days'
  if (recencyScore >= 0.5) return 'last 180 days'
  if (recencyScore >= 0.3) return 'last year'
  return 'over a year ago'
}

/**
 * Get confidence badge variant
 */
function getConfidenceVariant(
  label: EvidenceCoverage['overallConfidenceLabel']
): 'success' | 'warning' | 'danger' | 'muted' {
  switch (label) {
    case 'High':
      return 'success'
    case 'Medium':
      return 'warning'
    case 'Low':
      return 'warning'
    case 'Insufficient':
      return 'danger'
    default:
      return 'muted'
  }
}

export function EvidenceTrustPanel({
  coverage,
  lastUpdated,
  onViewEvidence,
}: EvidenceTrustPanelProps) {
  const recencyMessage = React.useMemo(
    () => computeRecencyMessage(coverage.recencyScore),
    [coverage.recencyScore]
  )
  
  const firstPartyPercent = Math.round(coverage.firstPartyRatio * 100)
  
  // Get types with counts > 0, sorted by count (descending)
  const typesWithCounts = Object.entries(coverage.countsByType)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      type: type as NormalizedEvidenceType,
      count,
    }))
    .sort((a, b) => b.count - a.count)
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Evidence coverage</CardTitle>
          <Badge variant={getConfidenceVariant(coverage.overallConfidenceLabel)}>
            {coverage.overallConfidenceLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Counts by type */}
        <div className="flex flex-wrap gap-2">
          {typesWithCounts.length > 0 ? (
            typesWithCounts.map(({ type, count }) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {TYPE_LABELS[type]}: {count}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No evidence yet</span>
          )}
        </div>
        
        {/* Recency line */}
        {coverage.recencyScore > 0 && (
          <div className="text-sm text-muted-foreground">
            Most evidence from {recencyMessage}
            {firstPartyPercent > 0 && (
              <span className="ml-2">
                • {firstPartyPercent}% first-party
              </span>
            )}
          </div>
        )}
        
        {/* Gaps callout */}
        {coverage.gaps.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Coverage gaps
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {coverage.gaps.slice(0, 3).map((gap, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>
                    <span className="font-medium">No {TYPE_LABELS[gap.type]}</span>
                    {' → '}
                    {gap.suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* View evidence button */}
        {onViewEvidence && (
          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={onViewEvidence}>
              View evidence
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Empty state component
 */
export function EvidenceTrustPanelEmpty() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evidence coverage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">No evidence bundle saved yet.</p>
          <p>Run analysis to gather sources automatically.</p>
        </div>
      </CardContent>
    </Card>
  )
}

