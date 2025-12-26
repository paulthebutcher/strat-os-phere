'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { paths } from '@/lib/routes'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { EvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { EMPTY_EVIDENCE_COVERAGE_LITE } from '@/lib/evidence/coverageTypes'
import type { Citation } from '@/lib/schemas/opportunityV3'
import { safeString } from '@/lib/text/safeString'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { MotionSection } from '@/components/ui/Motion'

interface DecisionSummaryProps {
  projectId: string
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
  coverage?: EvidenceCoverageLite
  competitorCount?: number
  projectName?: string
  projectMarket?: string | null
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
 * Get confidence label and description
 */
function getConfidenceLabel(opportunity: any, score: number | null): { label: string; description: string } {
  if (isInvestmentReady(opportunity)) {
    return {
      label: 'Investment-ready',
      description: 'High confidence based on consistent competitive and buyer signals',
    }
  }
  
  if (score !== null) {
    if (score >= 75) {
      return {
        label: 'High confidence',
        description: 'Strong evidence supports this recommendation',
      }
    } else if (score >= 50) {
      return {
        label: 'Directional',
        description: 'Moderate confidence - promising signal but requires validation',
      }
    } else {
      return {
        label: 'Exploratory',
        description: 'Lower confidence - needs more evidence to validate',
      }
    }
  }
  
  return {
    label: 'Directional',
    description: 'Promising signal requiring validation',
  }
}

/**
 * Extract "Why This Matters" - concise rationale
 */
function getWhyThisMatters(opportunity: any): string[] {
  const insights: string[] = []
  
  // Use one_liner if available (V3)
  if ('one_liner' in opportunity && typeof opportunity.one_liner === 'string') {
    insights.push(opportunity.one_liner)
  }
  
  // Use why_now (V3) or why_this_matters - safely handle non-string types
  const whyNow = 'why_now' in opportunity ? safeString(opportunity.why_now) : null
  if (whyNow) {
    insights.push(whyNow)
  } else {
    const whyThisMatters = 'why_this_matters' in opportunity ? safeString(opportunity.why_this_matters) : null
    if (whyThisMatters) {
      insights.push(whyThisMatters)
    }
  }
  
  // Extract from problem_today (V3)
  const problemToday = 'problem_today' in opportunity ? safeString(opportunity.problem_today) : null
  if (problemToday) {
    insights.push(problemToday)
  }
  
  // Fallback to description or summary
  if (insights.length === 0) {
    const description = 'description' in opportunity ? safeString(opportunity.description) : null
    if (description) {
      insights.push(description)
    }
  }
  
  // Limit to 3 key insights
  return insights.slice(0, 3)
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
 * Categorize evidence by source type
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
 * Get key scoring factors
 */
function getKeyScoringFactors(opportunity: any): Array<{ factor: string; score: number }> {
  const factors: Array<{ factor: string; score: number }> = []
  
  if ('scoring' in opportunity && typeof opportunity.scoring === 'object' && opportunity.scoring !== null) {
    const scoring = opportunity.scoring as {
      breakdown?: {
        customer_pain?: number
        willingness_to_pay?: number
        strategic_fit?: number
        feasibility?: number
        defensibility?: number
        competitor_gap?: number
      }
    }
    
    if (scoring.breakdown) {
      const breakdown = scoring.breakdown
      const factorMap: Record<string, string> = {
        customer_pain: 'Customer pain',
        willingness_to_pay: 'Willingness to pay',
        strategic_fit: 'Strategic fit',
        feasibility: 'Feasibility',
        defensibility: 'Defensibility',
        competitor_gap: 'Competitive gap',
      }
      
      for (const [key, label] of Object.entries(factorMap)) {
        const value = breakdown[key as keyof typeof breakdown]
        if (typeof value === 'number') {
          factors.push({ factor: label, score: value })
        }
      }
      
      // Sort by score descending, take top 3
      factors.sort((a, b) => b.score - a.score)
      return factors.slice(0, 3)
    }
  }
  
  return factors
}

/**
 * Get "what would change this call" - guardrails
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
 * Decision Summary Component
 * 
 * Decision-oriented synthesis surface that presents:
 * 1. Decision Header (primary recommendation, confidence, context)
 * 2. Why This Matters (concise rationale)
 * 3. Evidence Snapshot (inline, not exhaustive)
 * 4. Scoring & Confidence (explicit)
 * 5. Guardrails (what would change the call)
 */
export function DecisionSummary({
  projectId,
  opportunitiesV3,
  opportunitiesV2,
  coverage,
  competitorCount = 0,
  projectName,
  projectMarket,
  justGenerated = false,
}: DecisionSummaryProps) {
  const summaryRef = useRef<HTMLDivElement>(null)

  // Get opportunities array
  const opportunities = opportunitiesV3?.opportunities ?? opportunitiesV2?.opportunities ?? []

  // Auto-scroll and highlight on justGenerated
  useEffect(() => {
    if (justGenerated && summaryRef.current) {
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [justGenerated])

  // No opportunities state
  if (opportunities.length === 0) {
    return (
      <Card
        ref={summaryRef}
        className={cn(
          'border-border-subtle',
          justGenerated && 'ring-2 ring-primary/20 transition-all duration-500'
        )}
      >
        <CardContent className="p-6 md:p-8">
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Decision summary
            </p>
            <p className="text-base text-foreground mb-4">
              No analysis available yet. Generate opportunities to see your decision summary.
            </p>
          </div>
          <Button asChild>
            <Link href={paths.opportunities(projectId)}>Generate analysis</Link>
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

  const score = getOpportunityScore(primaryOpportunity)
  const evidenceCount = countEvidence(primaryOpportunity)
  const evidenceCategories = categorizeEvidence(primaryOpportunity)
  const whyThisMatters = getWhyThisMatters(primaryOpportunity)
  const keyFactors = getKeyScoringFactors(primaryOpportunity)
  const whatWouldChange = getWhatWouldChange(primaryOpportunity, score, evidenceCount)

  // Get title
  const title = 'title' in primaryOpportunity ? primaryOpportunity.title : 'Untitled Opportunity'

  // Evidence readiness state: determines what we can show
  // CRITICAL: Never show high confidence or scores without evidence
  const hasEvidence = evidenceCount > 0
  const evidenceReadiness: 'loading' | 'early' | 'ready' | 'unavailable' = 
    hasEvidence 
      ? 'ready'
      : coverage?.isEvidenceSufficient === false && coverage?.reasonsMissing?.length > 0
        ? 'unavailable' // Evidence collection failed or insufficient
        : justGenerated
          ? 'loading' // Just generated, evidence may still be loading
          : 'early' // Early signals, evidence not yet collected

  // Only show confidence/score if we have evidence OR it's a degraded/early state
  // But never show "High confidence" without evidence
  const canShowConfidence = hasEvidence || evidenceReadiness === 'early'
  const confidence = getConfidenceLabel(primaryOpportunity, score)
  
  // Degrade confidence label if no evidence
  const displayConfidence = hasEvidence 
    ? confidence 
    : {
        label: 'Early signals',
        description: 'Evidence is still being collected. This decision will sharpen as sources complete.',
      }

  return (
    <Card
      ref={summaryRef}
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

        {/* 1. Decision Header - Primary recommendation, confidence, context */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 leading-tight">
            {title}
          </h2>
          
          {/* Confidence and context - Only show if evidence ready OR early signals */}
          {canShowConfidence && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                          <span className="text-sm font-medium text-foreground">{displayConfidence.label}</span>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">{displayConfidence.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {/* Only show score if we have evidence */}
                  {hasEvidence && score !== null && (
                    <span className="text-sm text-muted-foreground">Score: {score}/100</span>
                  )}
                </div>
                {projectMarket && (
                  <span className="text-sm text-muted-foreground">{projectMarket}</span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {displayConfidence.description}
              </p>
            </>
          )}
        </div>

        {/* 2. Evidence Snapshot - NOW FIRST, before narrative (reordered per PR) */}
        <MotionSection className="mb-6 pb-6 border-b border-border-subtle">
          <h3 className="text-sm font-semibold text-foreground mb-3">Evidence snapshot</h3>
          
          {/* Evidence readiness states */}
          {evidenceReadiness === 'loading' && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border-subtle">
              <p className="text-sm text-foreground mb-2 font-medium">
                Evidence is still being collected
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We're gathering sources from competitor sites, reviews, and documentation.
                This decision will sharpen as evidence completes.
              </p>
            </div>
          )}

          {evidenceReadiness === 'early' && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border-subtle">
              <p className="text-sm text-foreground mb-2 font-medium">
                Early signals available
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evidence coverage is still expanding. This decision is based on initial signals and will strengthen as more sources are collected.
              </p>
            </div>
          )}

          {evidenceReadiness === 'unavailable' && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border-subtle">
              <p className="text-sm text-foreground mb-2 font-medium">
                Evidence collection in progress
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Confidence is directional until coverage improves. See Evidence Preview above for current sources.
              </p>
            </div>
          )}

          {evidenceReadiness === 'ready' && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border-subtle">
              {/* Source count by type */}
              <div className="flex flex-wrap gap-4 text-sm text-foreground mb-3">
                {evidenceCategories.pricing > 0 && (
                  <span className="font-medium">Pricing ({evidenceCategories.pricing})</span>
                )}
                {evidenceCategories.reviews > 0 && (
                  <span className="font-medium">Reviews ({evidenceCategories.reviews})</span>
                )}
                {evidenceCategories.docs > 0 && (
                  <span className="font-medium">Docs ({evidenceCategories.docs})</span>
                )}
                {evidenceCategories.changelog > 0 && (
                  <span className="font-medium">Changelog ({evidenceCategories.changelog})</span>
                )}
              </div>
              
              {/* Competitors represented - extract from citations */}
              {competitorCount > 0 && (
                <p className="text-xs text-muted-foreground mb-2">
                  {competitorCount} {competitorCount === 1 ? 'competitor' : 'competitors'} analyzed
                </p>
              )}
              
              {/* Total count */}
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{evidenceCount}</span> {evidenceCount === 1 ? 'source' : 'sources'} total
              </p>
            </div>
          )}
        </MotionSection>

        {/* 3. Why This Matters - Concise rationale (moved after evidence) */}
        {whyThisMatters.length > 0 && (
          <MotionSection className="mb-6 pb-6 border-b border-border-subtle" delay={0.15}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Why this matters</h3>
            <div className="space-y-2">
              {whyThisMatters.map((insight, idx) => (
                <p key={idx} className="text-sm text-foreground">
                  {insight}
                </p>
              ))}
            </div>
          </MotionSection>
        )}

        {/* 4. Scoring & Confidence - Explicit (only show if we have evidence) */}
        {hasEvidence && keyFactors.length > 0 && (
          <MotionSection className="mb-6 pb-6 border-b border-border-subtle" delay={0.2}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Key scoring factors</h3>
            <div className="space-y-2">
              {keyFactors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{factor.factor}</span>
                  <span className="text-sm text-muted-foreground">{factor.score}/10</span>
                </div>
              ))}
            </div>
          </MotionSection>
        )}

        {/* 5. Guardrails - What would change the call */}
        <MotionSection className="mb-6" delay={0.25}>
          <h3 className="text-sm font-semibold text-foreground mb-2">What would change this call</h3>
          <p className="text-sm text-foreground">{whatWouldChange}</p>
        </MotionSection>

        {/* Action links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-border-subtle">
          <Button asChild variant="outline">
            <Link href={paths.opportunities(projectId)}>
              View all opportunities
            </Link>
          </Button>
          <Link
            href={paths.evidence(projectId)}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Review evidence →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

