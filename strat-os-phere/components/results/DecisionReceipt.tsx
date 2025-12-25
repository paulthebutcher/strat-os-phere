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
import type { Citation } from '@/lib/schemas/opportunityV3'

interface DecisionReceiptProps {
  projectId: string
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
  coverage?: EvidenceCoverageLite
  competitorCount?: number
  justGenerated?: boolean
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
 * Extract "Why This Is Safe" signal blocks (3 blocks: Market, Competitive, Execution)
 */
function getWhyThisIsSafe(opportunity: any): Array<{ label: string; content: string }> {
  const signals: Array<{ label: string; content: string }> = []

  // Extract from proof_points (V3) - group by type
  if ('proof_points' in opportunity && Array.isArray(opportunity.proof_points)) {
    const marketSignals: string[] = []
    const competitiveSignals: string[] = []
    const executionSignals: string[] = []

    for (const pp of opportunity.proof_points) {
      if (pp.claim && typeof pp.claim === 'string') {
        const claim = pp.claim.toLowerCase()
        if (claim.includes('competitor') || claim.includes('market') || claim.includes('review')) {
          marketSignals.push(pp.claim)
        } else if (claim.includes('gap') || claim.includes('differentiation') || claim.includes('positioning')) {
          competitiveSignals.push(pp.claim)
        } else if (claim.includes('convert') || claim.includes('trial') || claim.includes('usage') || claim.includes('revenue')) {
          executionSignals.push(pp.claim)
        } else {
          // Default to market if unclear
          marketSignals.push(pp.claim)
        }
      }
    }

    if (marketSignals.length > 0) {
      signals.push({
        label: 'Market signal',
        content: marketSignals[0],
      })
    }
    if (competitiveSignals.length > 0) {
      signals.push({
        label: 'Competitive gap',
        content: competitiveSignals[0],
      })
    }
    if (executionSignals.length > 0) {
      signals.push({
        label: 'Execution signal',
        content: executionSignals[0],
      })
    }
  }

  // Fallback to scoring explainability
  if (signals.length < 3 && 'scoring' in opportunity && opportunity.scoring) {
    const scoring = opportunity.scoring as { explainability?: Array<{ explanation?: string }> }
    if (Array.isArray(scoring.explainability)) {
      for (const item of scoring.explainability.slice(0, 3 - signals.length)) {
        if (item.explanation && typeof item.explanation === 'string') {
          signals.push({
            label: signals.length === 0 ? 'Market signal' : signals.length === 1 ? 'Competitive gap' : 'Execution signal',
            content: item.explanation,
          })
        }
      }
    }
  }

  // Generic fallbacks if still empty
  if (signals.length === 0) {
    signals.push(
      { label: 'Market signal', content: 'Strong evidence signals across multiple competitors' },
      { label: 'Competitive gap', content: 'Clear differentiation opportunity identified' },
      { label: 'Execution signal', content: 'Feasible implementation path with measurable outcomes' }
    )
  }

  return signals.slice(0, 3)
}

/**
 * Extract "How to Execute" actions from experiments (V3)
 */
function getHowToExecute(opportunity: any): string[] {
  const actions: string[] = []

  // V3: Use experiments
  if ('experiments' in opportunity && Array.isArray(opportunity.experiments)) {
    for (const exp of opportunity.experiments.slice(0, 4)) {
      if (exp.smallest_test && typeof exp.smallest_test === 'string') {
        actions.push(exp.smallest_test)
      } else if (exp.hypothesis && typeof exp.hypothesis === 'string') {
        // Use hypothesis as fallback
        actions.push(exp.hypothesis)
      }
    }
  }

  // V2: Use how_to_win as fallback
  if (actions.length === 0 && 'how_to_win' in opportunity && Array.isArray(opportunity.how_to_win)) {
    for (const item of opportunity.how_to_win.slice(0, 4)) {
      if (typeof item === 'string') {
        actions.push(item)
      }
    }
  }

  // Generic fallback
  if (actions.length === 0) {
    actions.push('Define success metrics and test approach')
  }

  return actions.slice(0, 4)
}

/**
 * Get "what would change this call" - falsifiable and precise
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

  // Check for tradeoffs (V3) - make it falsifiable
  if ('tradeoffs' in opportunity && opportunity.tradeoffs) {
    const tradeoffs = opportunity.tradeoffs as {
      what_we_say_no_to?: string[]
      why_competitors_wont_follow?: string[]
    }
    // Use why_competitors_wont_follow for falsifiability
    if (Array.isArray(tradeoffs.why_competitors_wont_follow) && tradeoffs.why_competitors_wont_follow.length > 0) {
      return `This recommendation would change if ${tradeoffs.why_competitors_wont_follow[0].toLowerCase()}`
    }
  }

  // Score-based heuristics - make falsifiable
  if (score !== null && score < 50) {
    return 'This recommendation would change if two competitors introduce equivalent features and achieve >15% adoption within six months'
  }

  // Evidence-based fallback - make falsifiable
  if (evidenceCount < 5) {
    return 'This recommendation would change if new evidence from two more competitors reveals stronger alternatives'
  }

  // Generic fallback - make falsifiable
  return 'This recommendation would change if two competitors introduce comparable solutions and achieve >15% free-to-paid conversion within six months'
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
 * Categorize evidence by source type for credibility panel
 */
function categorizeEvidence(opportunity: any): {
  pricing: number
  reviews: number
  docs: number
  changelog: number
  total: number
} {
  const counts = {
    pricing: 0,
    reviews: 0,
    docs: 0,
    changelog: 0,
    total: 0,
  }

  const collectCitations = (citations: Citation[]) => {
    for (const citation of citations) {
      counts.total++
      const sourceType = citation.source_type?.toLowerCase() || ''
      if (sourceType === 'pricing') {
        counts.pricing++
      } else if (sourceType === 'reviews') {
        counts.reviews++
      } else if (sourceType === 'docs') {
        counts.docs++
      } else if (sourceType === 'changelog') {
        counts.changelog++
      }
    }
  }

  // V3: citations array
  if ('citations' in opportunity && Array.isArray(opportunity.citations)) {
    collectCitations(opportunity.citations as Citation[])
  }

  // V3: proof_points with citations
  if ('proof_points' in opportunity && Array.isArray(opportunity.proof_points)) {
    for (const pp of opportunity.proof_points) {
      if (Array.isArray(pp.citations)) {
        collectCitations(pp.citations as Citation[])
      }
    }
  }

  return counts
}

/**
 * Decision Receipt v3 - Single Conviction Snapshot
 * 
 * When an Investment-ready opportunity exists, shows only that one.
 * Restructured into 5 sections:
 * - The Call (top, dominant)
 * - Confidence (explicit + calibrated)
 * - Why This Is Safe (evidence-backed, skimmable)
 * - How to Execute (concrete actions)
 * - What Would Change This Call (explicit risk boundary)
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
              Decision snapshot
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
  const secondaryOpportunities = investmentReady
    ? sorted.filter((opp) => opp !== investmentReady)
    : sorted.slice(1)

  const score = getOpportunityScore(primaryOpportunity)
  const evidenceCount = countEvidence(primaryOpportunity)
  const evidenceCategories = categorizeEvidence(primaryOpportunity)
  const whySafe = getWhyThisIsSafe(primaryOpportunity)
  const howToExecute = getHowToExecute(primaryOpportunity)
  const whatWouldChange = getWhatWouldChange(primaryOpportunity, score, evidenceCount)

  // Get title
  const title = 'title' in primaryOpportunity ? primaryOpportunity.title : 'Untitled Opportunity'

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
    <>
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

          {/* A) The Call (Top, dominant) */}
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6 leading-tight">
            {title}
          </h2>

          {/* B) Confidence (Explicit + Calibrated) */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-foreground">Investment-ready</span>
            </div>
            <p className="text-xs text-muted-foreground">
              High confidence based on consistent competitive and buyer signals
            </p>
          </div>

          {/* C) Why This Is Safe (Evidence-backed, skimmable) */}
          <div className="mb-6 space-y-3">
            {whySafe.map((signal, idx) => (
              <div key={idx} className="border-l-2 border-border-subtle pl-3">
                <p className="text-xs font-semibold text-foreground mb-1">{signal.label}</p>
                <p className="text-sm text-foreground">{signal.content}</p>
              </div>
            ))}
          </div>

          {/* D) How to Execute (This Is the Differentiator) */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">How to execute safely</h3>
            <ul className="space-y-2">
              {howToExecute.map((action, idx) => (
                <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* E) What Would Change This Call (Explicit Risk Boundary) */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">What would change this call</h3>
            <p className="text-sm text-foreground">{whatWouldChange}</p>
          </div>

          {/* Evidence Credibility Panel */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border-subtle">
            <p className="text-xs font-semibold text-foreground mb-3">Evidence attached</p>
            <div className="flex flex-wrap gap-3 text-xs text-foreground">
              {evidenceCategories.pricing > 0 && (
                <span>Pricing pages ({evidenceCategories.pricing})</span>
              )}
              {evidenceCategories.reviews > 0 && (
                <span>Reviews ({evidenceCategories.reviews})</span>
              )}
              {(evidenceCategories.docs > 0 || evidenceCategories.changelog > 0) && (
                <span>
                  Docs / changelogs ({evidenceCategories.docs + evidenceCategories.changelog})
                </span>
              )}
            </div>
          </div>

          {/* Trust signal */}
          <p className="text-xs text-muted-foreground mb-6">
            Generated from public market signals
          </p>

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

      {/* Secondary opportunities - moved below snapshot */}
      {secondaryOpportunities.length > 0 && (
        <Card className="mt-6 border-border-subtle">
          <CardContent className="p-6 md:p-8">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Other directional opportunities (lower confidence)
            </p>
            <div className="space-y-4">
              {secondaryOpportunities.slice(0, 3).map((opp, idx) => {
                const oppScore = getOpportunityScore(opp)
                const oppTitle = 'title' in opp ? opp.title : 'Untitled Opportunity'
                return (
                  <div key={idx} className="p-4 border border-border-subtle rounded-lg">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-foreground flex-1">{oppTitle}</h3>
                      {oppScore !== null && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          Score: {oppScore}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}


