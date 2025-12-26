'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { EvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import { safeString } from '@/lib/text/safeString'

interface ReadoutHeroProps {
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
  coverage?: EvidenceCoverageLite
  competitorCount?: number
  projectName?: string
  projectMarket?: string | null
}

/**
 * Check if opportunity is Investment-ready
 */
function isInvestmentReady(opportunity: any): boolean {
  if ('confidence' in opportunity && typeof opportunity.confidence === 'string') {
    const conf = opportunity.confidence.toLowerCase()
    return conf === 'investment_ready' || conf === 'investment-ready'
  }
  return false
}

/**
 * Get confidence band and label
 * Maps to: Directional / Strong / High
 */
function getConfidenceBand(
  opportunity: any,
  score: number | null,
  hasEvidence: boolean,
  coverage?: EvidenceCoverageLite
): { band: 'directional' | 'strong' | 'high'; label: string; description: string } {
  if (isInvestmentReady(opportunity)) {
    return {
      band: 'high',
      label: 'Investment-ready',
      description: 'High confidence based on consistent competitive and buyer signals',
    }
  }

  if (!hasEvidence || !coverage) {
    return {
      band: 'directional',
      label: 'Early signal',
      description: 'Evidence is still being collected. This decision will sharpen as sources complete.',
    }
  }

  // Simple logic: use coverage and score to determine band
  const hasSources = coverage.totalSources > 0
  const hasMultipleTypes = coverage.evidenceTypesPresent.length >= 2
  const hasMultipleCompetitors = coverage.competitorIdsWithEvidence.length >= 2

  if (hasSources && hasMultipleTypes && hasMultipleCompetitors) {
    if (score !== null && score >= 75) {
      return {
        band: 'high',
        label: 'Investment-ready',
        description: 'High confidence based on consistent competitive and buyer signals',
      }
    } else if (score !== null && score >= 50) {
      return {
        band: 'strong',
        label: 'Supported',
        description: 'Strong evidence supports this recommendation',
      }
    }
  }

  if (hasSources && (hasMultipleTypes || hasMultipleCompetitors)) {
    return {
      band: 'strong',
      label: 'Supported',
      description: 'Evidence supports this recommendation',
    }
  }

  return {
    band: 'directional',
    label: 'Directional',
    description: 'Early signal requiring validation',
  }
}

/**
 * Extract "Why This Matters" - one sentence
 */
function getWhyThisMatters(opportunity: any): string | null {
  // Use one_liner if available (V3)
  if ('one_liner' in opportunity && typeof opportunity.one_liner === 'string') {
    return opportunity.one_liner
  }

  // Use why_now (V3) or why_this_matters
  const whyNow = 'why_now' in opportunity ? safeString(opportunity.why_now) : null
  if (whyNow) {
    return whyNow
  }

  const whyThisMatters = 'why_this_matters' in opportunity ? safeString(opportunity.why_this_matters) : null
  if (whyThisMatters) {
    return whyThisMatters
  }

  // Fallback to description or summary
  const description = 'description' in opportunity ? safeString(opportunity.description) : null
  if (description) {
    return description
  }

  return null
}

/**
 * Count evidence/citations for an opportunity
 */
function countEvidence(opportunity: any): number {
  let count = 0

  // V3: citations array
  if ('citations' in opportunity && Array.isArray(opportunity.citations)) {
    count += opportunity.citations.length
  }

  // V3: proof_points with citations
  if ('proof_points' in opportunity && Array.isArray(opportunity.proof_points)) {
    for (const pp of opportunity.proof_points) {
      if (Array.isArray(pp.citations)) {
        count += pp.citations.length
      }
    }
  }

  return count
}

/**
 * ReadoutHero Component
 * 
 * Executive readout hero card that presents:
 * - Recommendation title
 * - Confidence band (Directional/Strong/High) with label
 * - One-sentence "Why this matters"
 * - Key metrics chips (Competitors analyzed, Evidence sources, Evidence types)
 * - Optional: Score if available
 */
export function ReadoutHero({
  opportunitiesV3,
  opportunitiesV2,
  coverage,
  competitorCount = 0,
  projectName,
  projectMarket,
}: ReadoutHeroProps) {
  // Get opportunities array
  const opportunities = opportunitiesV3?.opportunities ?? opportunitiesV2?.opportunities ?? []

  if (opportunities.length === 0) {
    return null
  }

  // Priority 1: Find Investment-ready opportunity
  const investmentReady = opportunities.find((opp) => isInvestmentReady(opp))

  // Priority 2: Sort by score and get top opportunity
  const sorted = [...opportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  // Use Investment-ready if available, otherwise top-scored
  const primaryOpportunity = investmentReady || sorted[0]

  const score = getOpportunityScore(primaryOpportunity)
  const evidenceCount = countEvidence(primaryOpportunity)
  const hasEvidence = evidenceCount > 0
  const confidence = getConfidenceBand(primaryOpportunity, score, hasEvidence, coverage)
  const whyThisMatters = getWhyThisMatters(primaryOpportunity)

  // Get title
  const title = 'title' in primaryOpportunity ? primaryOpportunity.title : 'Untitled Opportunity'

  // Confidence band styling
  const confidenceVariant = confidence.band === 'high' ? 'success' : confidence.band === 'strong' ? 'info' : 'warning'

  // Metrics
  const evidenceTypesCount = coverage?.evidenceTypesPresent.length ?? 0
  const sourcesCount = coverage?.totalSources ?? evidenceCount

  return (
    <Card className="border-border-subtle">
      <CardContent className="p-6 md:p-8">
        {/* Recommendation Title */}
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 leading-tight">
          {title}
        </h1>

        {/* Confidence Band */}
        <div className="flex items-center gap-3 mb-4">
          <Badge variant={confidenceVariant} className="text-sm font-medium">
            {confidence.label}
          </Badge>
          {score !== null && hasEvidence && (
            <span className="text-sm text-muted-foreground">Score: {score}/100</span>
          )}
        </div>

        {/* Why This Matters */}
        {whyThisMatters && (
          <p className="text-base text-foreground mb-6 leading-relaxed">
            {whyThisMatters}
          </p>
        )}

        {/* Key Metrics Chips */}
        <div className="flex flex-wrap items-center gap-3">
          {competitorCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{competitorCount}</span>
              <span className="text-sm text-muted-foreground">
                {competitorCount === 1 ? 'competitor' : 'competitors'} analyzed
              </span>
            </div>
          )}
          {sourcesCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{sourcesCount}</span>
              <span className="text-sm text-muted-foreground">
                {sourcesCount === 1 ? 'source' : 'sources'}
              </span>
            </div>
          )}
          {evidenceTypesCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{evidenceTypesCount}</span>
              <span className="text-sm text-muted-foreground">
                {evidenceTypesCount === 1 ? 'evidence type' : 'evidence types'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

