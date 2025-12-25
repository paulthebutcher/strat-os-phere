'use client'

import * as React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/results/SectionCard'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import { computeDecisionConfidence } from '@/lib/ui/decisionConfidence'
import { formatSourceType } from '@/lib/ux/evidenceStrength'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'
import type { Citation } from '@/lib/schemas/opportunityV3'
import { safeString } from '@/lib/text/safeString'

interface DecisionViewProps {
  opportunity: OpportunityV3Item
  projectId?: string
  className?: string
}

/**
 * Group citations by evidence type for display
 */
function groupEvidenceByType(citations: Citation[]): {
  competitive: Citation[]
  customer: Citation[]
  product: Citation[]
} {
  const competitive: Citation[] = []
  const customer: Citation[] = []
  const product: Citation[] = []

  for (const citation of citations) {
    const sourceType = citation.source_type?.toLowerCase() || ''
    
    // Competitive Landscape: changelog (competitive moves)
    if (sourceType === 'changelog') {
      competitive.push(citation)
    }
    // Customer Signals: reviews (customer feedback)
    else if (sourceType === 'reviews') {
      customer.push(citation)
    }
    // Product / Pricing Norms: pricing, docs, marketing_site
    else if (sourceType === 'pricing' || sourceType === 'docs' || sourceType === 'marketing_site') {
      product.push(citation)
    }
    // Default: add to competitive if unclear
    else {
      competitive.push(citation)
    }
  }

  return { competitive, customer, product }
}

/**
 * Extract citations from proof points
 */
function extractAllCitations(opportunity: OpportunityV3Item): Citation[] {
  const citations: Citation[] = []
  
  // Add direct citations
  if (opportunity.citations) {
    citations.push(...opportunity.citations)
  }
  
  // Add citations from proof points
  if (opportunity.proof_points) {
    for (const pp of opportunity.proof_points) {
      if (pp.citations) {
        citations.push(...pp.citations)
      }
    }
  }
  
  // Deduplicate by URL
  const seen = new Set<string>()
  return citations.filter((cit) => {
    if (seen.has(cit.url)) {
      return false
    }
    seen.add(cit.url)
    return true
  })
}

/**
 * Get "What Would Change This Call" conditions
 */
function getWhatWouldChange(opportunity: OpportunityV3Item): string[] {
  const conditions: string[] = []
  
  // Use tradeoffs.why_competitors_wont_follow as falsifiable conditions
  if (opportunity.tradeoffs?.why_competitors_wont_follow) {
    for (const reason of opportunity.tradeoffs.why_competitors_wont_follow) {
      conditions.push(`If ${reason.toLowerCase()}`)
    }
  }
  
  // Use tradeoffs.what_we_say_no_to as additional conditions
  if (opportunity.tradeoffs?.what_we_say_no_to && conditions.length < 3) {
    for (const item of opportunity.tradeoffs.what_we_say_no_to.slice(0, 3 - conditions.length)) {
      conditions.push(`If we need to prioritize ${item.toLowerCase()} instead`)
    }
  }
  
  // Fallback if no tradeoffs available
  if (conditions.length === 0) {
    conditions.push('If two or more direct competitors launch comparable solutions')
    conditions.push('If trial conversion rates materially improve without pricing changes')
  }
  
  return conditions.slice(0, 3)
}

/**
 * Get confidence label and explanation
 */
function getConfidenceInfo(opportunity: OpportunityV3Item): {
  label: string
  explanation: string
  uncertainty?: string
  whatWouldIncrease?: string[]
} {
  const confidence = computeDecisionConfidence(opportunity)
  
  let label = 'Investment-ready'
  let explanation = 'High confidence based on consistent competitive and buyer signals'
  let uncertainty: string | undefined
  let whatWouldIncrease: string[] = []
  
  if (confidence.level === 'high') {
    label = 'Investment-ready'
    explanation = 'Strong evidence across multiple sources supports this decision'
    uncertainty = 'Market conditions could shift, but current signals are clear'
  } else if (confidence.level === 'moderate') {
    label = 'Directional'
    explanation = 'Evidence suggests this direction, but additional validation would strengthen the call'
    uncertainty = 'Some uncertainty remains about market timing and competitive response'
    whatWouldIncrease = [
      'Additional evidence from 2-3 more competitors',
      'Customer validation through interviews or surveys',
      'Pricing signal confirmation from recent market moves'
    ]
  } else {
    label = 'Exploratory'
    explanation = 'Early signals point to this opportunity, but more evidence is needed'
    uncertainty = 'Significant uncertainty about market readiness and competitive dynamics'
    whatWouldIncrease = [
      'More comprehensive competitive analysis',
      'Direct customer feedback',
      'Market trend validation'
    ]
  }
  
  return { label, explanation, uncertainty, whatWouldIncrease }
}

/**
 * DecisionView - Holistic, executive-grade decision view
 * 
 * Replaces the sidebar/list item pattern with a full-width, self-contained decision artifact.
 * Structure:
 * 1. Decision Header (H1 + metadata)
 * 2. Executive Rationale
 * 3. Evidence Breakdown (inline, grouped by type)
 * 4. What Would Change This Call
 * 5. Confidence Framing
 */
export function DecisionView({
  opportunity,
  projectId,
  className,
}: DecisionViewProps) {
  const score = getOpportunityScore(opportunity)
  const allCitations = extractAllCitations(opportunity)
  const evidenceGroups = groupEvidenceByType(allCitations)
  const whatWouldChange = getWhatWouldChange(opportunity)
  const confidenceInfo = getConfidenceInfo(opportunity)
  
  // Evidence readiness: never show high confidence without evidence
  const hasEvidence = allCitations.length > 0
  const evidenceCount = allCitations.length
  
  // Build executive rationale - synthesize from one_liner, why_now, and proposed_move
  // This should read like an exec summary, not analysis notes
  const rationaleBullets: string[] = []
  
  // Start with the one_liner as the primary statement
  if (opportunity.one_liner) {
    rationaleBullets.push(opportunity.one_liner)
  }
  
  // Add why_now as context if it adds value - safely handle non-string types
  const whyNow = safeString(opportunity.why_now)
  if (whyNow && !opportunity.one_liner?.toLowerCase().includes(whyNow.toLowerCase().slice(0, 20))) {
    rationaleBullets.push(whyNow)
  }
  
  // Add proposed_move if it's distinct from one_liner
  if (opportunity.proposed_move && !opportunity.one_liner?.toLowerCase().includes(opportunity.proposed_move.toLowerCase().slice(0, 20))) {
    rationaleBullets.push(opportunity.proposed_move)
  }
  
  // If we have proof_points, extract key patterns for rationale
  if (opportunity.proof_points && opportunity.proof_points.length > 0) {
    const competitivePatterns = opportunity.proof_points
      .filter((pp) => pp.citations?.some((cit) => cit.source_type === 'changelog'))
      .map((pp) => pp.claim)
      .slice(0, 2)
    
    for (const pattern of competitivePatterns) {
      if (!rationaleBullets.some((bullet) => bullet.toLowerCase().includes(pattern.toLowerCase().slice(0, 15)))) {
        rationaleBullets.push(pattern)
      }
    }
  }
  
  // Extract key takeaways from proof points for evidence groups
  const competitiveTakeaways = opportunity.proof_points
    ?.filter((pp) => {
      // Check if any citation in this proof point is competitive
      return pp.citations?.some((cit) => {
        const st = cit.source_type?.toLowerCase() || ''
        return st === 'reviews' || st === 'changelog'
      })
    })
    .map((pp) => pp.claim)
    .slice(0, 3) || []
  
  const customerTakeaways = opportunity.proof_points
    ?.filter((pp) => {
      return pp.citations?.some((cit) => {
        const st = cit.source_type?.toLowerCase() || ''
        return st === 'reviews'
      })
    })
    .map((pp) => pp.claim)
    .slice(0, 3) || []
  
  const productTakeaways = opportunity.proof_points
    ?.filter((pp) => {
      return pp.citations?.some((cit) => {
        const st = cit.source_type?.toLowerCase() || ''
        return st === 'pricing' || st === 'docs' || st === 'marketing_site'
      })
    })
    .map((pp) => pp.claim)
    .slice(0, 3) || []

  return (
    <SectionCard className={cn('space-y-8', className)}>
      {/* 1. Decision Header */}
      <header className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight">
          {opportunity.title}
        </h1>
        
        {/* Metadata row - Only show confidence/score if evidence exists */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {hasEvidence ? (
            <>
              <div className="flex items-center gap-2">
                <Badge variant={confidenceInfo.label === 'Investment-ready' ? 'default' : 'secondary'}>
                  {confidenceInfo.label}
                </Badge>
              </div>
              
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">{evidenceCount}</span> source{evidenceCount !== 1 ? 's' : ''} attached
              </div>
              
              {score !== null && (
                <div className="text-muted-foreground">
                  Score: <span className="font-medium text-foreground">{score.toFixed(1)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Early signals</Badge>
              <span className="text-sm text-muted-foreground">
                Evidence is still being collected
              </span>
            </div>
          )}
        </div>
      </header>

      {/* 2. Evidence Breakdown - NOW FIRST, before rationale (reordered per PR) */}
      {hasEvidence ? (
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Evidence</h2>
          
          {/* Competitive Landscape */}
          {evidenceGroups.competitive.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Competitive Landscape</h3>
              {competitiveTakeaways.length > 0 ? (
                <div className="space-y-2">
                  {competitiveTakeaways.map((takeaway, idx) => (
                    <p key={idx} className="text-sm text-foreground leading-relaxed">
                      <strong className="font-semibold">{takeaway}</strong>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Competitive signals from {evidenceGroups.competitive.length} source{evidenceGroups.competitive.length !== 1 ? 's' : ''}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {evidenceGroups.competitive.slice(0, 5).map((citation, idx) => {
                  let domain = citation.domain
                  if (!domain) {
                    try {
                      domain = new URL(citation.url).hostname.replace(/^www\./, '')
                    } catch {
                      domain = citation.url
                    }
                  }
                  return (
                    <a
                      key={idx}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                      title={citation.title || domain}
                    >
                      <span>{formatSourceType(citation.source_type)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Customer Signals */}
          {evidenceGroups.customer.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Customer Signals</h3>
              {customerTakeaways.length > 0 ? (
                <div className="space-y-2">
                  {customerTakeaways.map((takeaway, idx) => (
                    <p key={idx} className="text-sm text-foreground leading-relaxed">
                      <strong className="font-semibold">{takeaway}</strong>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Customer feedback from {evidenceGroups.customer.length} source{evidenceGroups.customer.length !== 1 ? 's' : ''}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {evidenceGroups.customer.slice(0, 5).map((citation, idx) => {
                  let domain = citation.domain
                  if (!domain) {
                    try {
                      domain = new URL(citation.url).hostname.replace(/^www\./, '')
                    } catch {
                      domain = citation.url
                    }
                  }
                  return (
                    <a
                      key={idx}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                      title={citation.title || domain}
                    >
                      <span>{formatSourceType(citation.source_type)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Product / Pricing Norms */}
          {evidenceGroups.product.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Product / Pricing Norms</h3>
              {productTakeaways.length > 0 ? (
                <div className="space-y-2">
                  {productTakeaways.map((takeaway, idx) => (
                    <p key={idx} className="text-sm text-foreground leading-relaxed">
                      <strong className="font-semibold">{takeaway}</strong>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Product and pricing signals from {evidenceGroups.product.length} source{evidenceGroups.product.length !== 1 ? 's' : ''}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {evidenceGroups.product.slice(0, 5).map((citation, idx) => {
                  let domain = citation.domain
                  if (!domain) {
                    try {
                      domain = new URL(citation.url).hostname.replace(/^www\./, '')
                    } catch {
                      domain = citation.url
                    }
                  }
                  return (
                    <a
                      key={idx}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                      title={citation.title || domain}
                    >
                      <span>{formatSourceType(citation.source_type)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Evidence</h2>
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-foreground mb-2 font-medium">
              Evidence is still being collected
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We're gathering sources from competitor sites, reviews, and documentation.
              This decision will sharpen as evidence completes.
            </p>
          </div>
        </section>
      )}

      {/* 3. Executive Rationale (moved after evidence) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Why this is the right call</h2>
        <div className="space-y-2">
          {rationaleBullets.length > 0 ? (
            <ul className="space-y-2">
              {rationaleBullets.map((item, idx) => (
                <li key={idx} className="text-base text-foreground leading-relaxed">
                  • {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-foreground leading-relaxed">
              {opportunity.one_liner || 'This opportunity is supported by strong evidence and competitive signals.'}
            </p>
          )}
        </div>
      </section>

      {/* 4. What Would Change This Call */}
      {whatWouldChange.length > 0 && (
        <section className="space-y-3 pt-6 border-t border-border">
          <h2 className="text-lg font-semibold text-foreground">What would change this decision?</h2>
          <ul className="space-y-2">
            {whatWouldChange.map((condition, idx) => (
              <li key={idx} className="text-base text-foreground leading-relaxed">
                • {condition}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">
            This decision is conditional and falsifiable. These conditions would invalidate or weaken the recommendation.
          </p>
        </section>
      )}

      {/* 5. Confidence Framing */}
      <section className="space-y-3 pt-6 border-t border-border">
        <h2 className="text-lg font-semibold text-foreground">Confidence</h2>
        <p className="text-base text-foreground leading-relaxed">
          {confidenceInfo.explanation}
        </p>
        {confidenceInfo.uncertainty && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {confidenceInfo.uncertainty}
          </p>
        )}
        {confidenceInfo.whatWouldIncrease && confidenceInfo.whatWouldIncrease.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-foreground">What would increase confidence further:</p>
            <ul className="space-y-1">
              {confidenceInfo.whatWouldIncrease.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground leading-relaxed">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </SectionCard>
  )
}

