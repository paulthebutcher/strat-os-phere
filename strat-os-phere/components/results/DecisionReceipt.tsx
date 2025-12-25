'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { EvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { EMPTY_EVIDENCE_COVERAGE_LITE } from '@/lib/evidence/coverageTypes'
import { getNextBestAction } from '@/lib/projects/nextBestAction'

interface DecisionReceiptProps {
  projectId: string
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
  coverage?: EvidenceCoverageLite
  competitorCount?: number
  justGenerated?: boolean
}

/**
 * Map confidence from opportunity schema to display range
 */
function mapConfidenceToRange(
  opportunity: any,
  score: number | null
): { label: 'Low' | 'Medium' | 'High'; indicator: number } {
  // Try explicit confidence field (V1 schema: exploratory, directional, investment_ready)
  if ('confidence' in opportunity && typeof opportunity.confidence === 'string') {
    const conf = opportunity.confidence.toLowerCase()
    if (conf === 'investment_ready' || conf === 'investment-ready') {
      return { label: 'High', indicator: 2 }
    }
    if (conf === 'directional') {
      return { label: 'Medium', indicator: 1 }
    }
    if (conf === 'exploratory' || conf === 'early') {
      return { label: 'Low', indicator: 0 }
    }
  }

  // Fallback to score-based mapping
  if (score !== null) {
    if (score >= 70) {
      return { label: 'High', indicator: 2 }
    }
    if (score >= 40) {
      return { label: 'Medium', indicator: 1 }
    }
    return { label: 'Low', indicator: 0 }
  }

  // Default to Medium-Low if no data (as per PR requirements)
  return { label: 'Medium', indicator: 1 }
}

/**
 * Extract "why this ranks" bullets (max 2)
 */
function getWhyThisRanks(opportunity: any): string[] {
  const bullets: string[] = []

  // V3: Use scoring explainability
  if ('scoring' in opportunity && opportunity.scoring) {
    const scoring = opportunity.scoring as { explainability?: Array<{ explanation?: string }> }
    if (Array.isArray(scoring.explainability)) {
      for (const item of scoring.explainability.slice(0, 2)) {
        if (item.explanation && typeof item.explanation === 'string') {
          bullets.push(item.explanation)
        }
      }
    }
  }

  // V3: Use proof_points as fallback
  if (bullets.length < 2 && 'proof_points' in opportunity && Array.isArray(opportunity.proof_points)) {
    for (const pp of opportunity.proof_points.slice(0, 2 - bullets.length)) {
      if (pp.claim && typeof pp.claim === 'string') {
        bullets.push(pp.claim)
      }
    }
  }

  // V2: Use how_to_win as fallback
  if (bullets.length < 2 && 'how_to_win' in opportunity && Array.isArray(opportunity.how_to_win)) {
    for (const item of opportunity.how_to_win.slice(0, 2 - bullets.length)) {
      if (typeof item === 'string') {
        bullets.push(item)
      }
    }
  }

  // Generic fallback if still empty
  if (bullets.length === 0) {
    bullets.push('Strong evidence signals across multiple competitors')
  }

  return bullets.slice(0, 2)
}

/**
 * Get "what would change this call" (1 line)
 */
function getWhatWouldChange(
  opportunity: any,
  score: number | null,
  evidenceCount: number
): string {
  // Check for explicit risks or assumptions
  if ('risks' in opportunity && Array.isArray(opportunity.risks) && opportunity.risks.length > 0) {
    const firstRisk = opportunity.risks[0]
    if (typeof firstRisk === 'string') {
      return firstRisk
    }
  }

  // Check for tradeoffs (V3)
  if ('tradeoffs' in opportunity && opportunity.tradeoffs) {
    const tradeoffs = opportunity.tradeoffs as {
      what_we_say_no_to?: string[]
    }
    if (Array.isArray(tradeoffs.what_we_say_no_to) && tradeoffs.what_we_say_no_to.length > 0) {
      return `If we deprioritize: ${tradeoffs.what_we_say_no_to[0]}`
    }
  }

  // Score-based heuristics
  if (score !== null && score < 50) {
    return 'If competitor launches equivalent feature or market conditions shift significantly'
  }

  // Evidence-based fallback
  if (evidenceCount < 5) {
    return 'Add evidence from two more competitors to strengthen confidence'
  }

  // Generic fallback
  return 'If market conditions shift significantly or new evidence reveals stronger alternatives'
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
 * Decision Receipt - Above-the-fold decision artifact
 * 
 * Shows the top-ranked opportunity with:
 * - Recommendation (title)
 * - Confidence range (Low/Medium/High)
 * - Why this ranks (2 bullets)
 * - What would change this call (1 line)
 * - One primary action button
 */
export function DecisionReceipt({
  projectId,
  opportunitiesV3,
  opportunitiesV2,
  coverage,
  competitorCount = 0,
  justGenerated = false,
}: DecisionReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  // Get opportunities array
  const opportunities = opportunitiesV3?.opportunities ?? opportunitiesV2?.opportunities ?? []

  // Auto-scroll and highlight on justGenerated
  useEffect(() => {
    if (justGenerated && receiptRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        receiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [justGenerated])

  // No opportunities state
  if (opportunities.length === 0) {
    return (
      <Card
        ref={receiptRef}
        className={cn(
          'border-border-subtle',
          justGenerated && 'ring-2 ring-primary/20 transition-all duration-500'
        )}
      >
        <CardContent className="p-6 md:p-8">
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Top decision
            </p>
            <p className="text-base text-foreground">
              No ranked opportunities available yet.
            </p>
          </div>
          <Button asChild>
            <Link href={`/projects/${projectId}/opportunities`}>Generate opportunities</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Sort by score and get top opportunity
  const sorted = [...opportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  const topOpportunity = sorted[0]
  const score = getOpportunityScore(topOpportunity)
  const confidence = mapConfidenceToRange(topOpportunity, score)
  const evidenceCount = countEvidence(topOpportunity)
  const whyRanks = getWhyThisRanks(topOpportunity)
  const whatWouldChange = getWhatWouldChange(topOpportunity, score, evidenceCount)

  // Get title (clamp to 2 lines visually)
  const title = 'title' in topOpportunity ? topOpportunity.title : 'Untitled Opportunity'

  // Determine primary action
  const hasOpportunitiesArtifact = Boolean(opportunitiesV3 || opportunitiesV2)
  const defaultCoverage: EvidenceCoverageLite = {
    ...EMPTY_EVIDENCE_COVERAGE_LITE,
    isEvidenceSufficient: evidenceCount >= 5,
  }
  const nextAction = getNextBestAction({
    projectId,
    competitorCount,
    coverage: coverage ?? defaultCoverage,
    hasOpportunitiesArtifact,
  })

  // Determine if we need more evidence
  const needsMoreEvidence = !coverage?.isEvidenceSufficient || evidenceCount < 5

  return (
    <Card
      ref={receiptRef}
      className={cn(
        'border-border-subtle',
        justGenerated && 'ring-2 ring-primary/20 transition-all duration-500'
      )}
    >
      <CardContent className="p-6 md:p-8">
        {/* Status line for justGenerated */}
        {justGenerated && (
          <div className="mb-4 pb-4 border-b border-border-subtle">
            <p className="text-xs font-medium text-primary">Analysis complete</p>
          </div>
        )}

        {/* Section label */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Top decision
        </p>

        {/* Recommendation (largest text) */}
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6 leading-tight line-clamp-2">
          {title}
        </h2>

        {/* Confidence range */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-foreground">Confidence:</span>
            <div className="flex items-center gap-2">
              {/* Low indicator */}
              <span
                className={cn(
                  'text-xs font-medium',
                  confidence.indicator >= 0 ? 'text-foreground' : 'text-muted-foreground/40'
                )}
              >
                Low
              </span>
              <span className="text-muted-foreground">·</span>
              {/* Medium indicator */}
              <span
                className={cn(
                  'text-xs font-medium',
                  confidence.indicator >= 1 ? 'text-foreground' : 'text-muted-foreground/40'
                )}
              >
                Medium
              </span>
              <span className="text-muted-foreground">·</span>
              {/* High indicator */}
              <span
                className={cn(
                  'text-xs font-medium',
                  confidence.indicator >= 2 ? 'text-foreground' : 'text-muted-foreground/40'
                )}
              >
                High
              </span>
            </div>
          </div>
          {confidence.label === 'Medium' && (score === null || score < 50) && (
            <p className="text-xs text-muted-foreground">
              Defaulted to Medium–Low due to limited evidence
            </p>
          )}
        </div>

        {/* Why this ranks (2 bullets) */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Why this ranks</h3>
          <ul className="space-y-2">
            {whyRanks.map((bullet, idx) => (
              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-muted-foreground mt-1">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What would change this call (1 line) */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">What would change this call</h3>
          <p className="text-sm text-foreground">{whatWouldChange}</p>
        </div>

        {/* Primary action button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {needsMoreEvidence ? (
            <Button asChild>
              <Link href={`/projects/${projectId}/evidence`}>
                Fetch more evidence
              </Link>
            </Button>
          ) : nextAction.onClickIntent === 'generate' ? (
            <Button asChild>
              <Link href={`/projects/${projectId}/opportunities`}>
                {nextAction.label}
              </Link>
            </Button>
          ) : nextAction.href ? (
            <Button asChild>
              <Link href={nextAction.href}>
                Refine this decision
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/projects/${projectId}/opportunities`}>
                View opportunities
              </Link>
            </Button>
          )}

          {/* Secondary text link */}
          <Link
            href={`/projects/${projectId}/evidence`}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View supporting evidence
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

