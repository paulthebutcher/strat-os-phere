'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/results/SectionCard'
import { suggestNextStepHref } from '@/lib/ux/nextStepLinks'
import { computeDecisionConfidence } from '@/lib/ui/decisionConfidence'
import type { OpportunityV1 } from '@/lib/opportunities/opportunityV1'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'
import { OpportunityEvidenceDrawer, type EvidenceDrawerCitation } from '@/components/evidence/OpportunityEvidenceDrawer'
import {
  computeEvidenceStrength,
  formatEvidenceStrengthLabel,
  formatSourceType,
} from '@/lib/ux/evidenceStrength'

/**
 * Opportunity Card V1 - Executive Brief Format
 * 
 * Renders opportunities in an exec brief structure:
 * - What to do
 * - Why now
 * - Why this ranks
 * - Risks & assumptions (collapsible)
 * - To increase confidence (actionable checklist)
 * 
 * Supports both OpportunityV1 and OpportunityV3Item types.
 */

interface OpportunityCardV1Props {
  opportunity: OpportunityV1 | OpportunityV3Item
  projectId?: string
  className?: string
}

function isOpportunityV1(
  opp: OpportunityV1 | OpportunityV3Item
): opp is OpportunityV1 {
  return 'recommendation' in opp && 'confidence' in opp
}

function getConfidenceLabel(confidence: string): string {
  const lower = confidence.toLowerCase()
  if (lower === 'exploratory' || lower === 'investment_ready') {
    return confidence
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  return confidence.charAt(0).toUpperCase() + confidence.slice(1)
}

function getConfidenceVariant(confidence: string): 'default' | 'secondary' | 'muted' {
  const lower = confidence.toLowerCase()
  if (lower === 'investment_ready') {
    return 'default'
  }
  if (lower === 'directional') {
    return 'secondary'
  }
  return 'muted'
}

/**
 * Normalize citations from V1 or V3 format to EvidenceDrawerCitation
 */
function normalizeCitations(
  opportunity: OpportunityV1 | OpportunityV3Item
): EvidenceDrawerCitation[] {
  const isV1 = isOpportunityV1(opportunity)

  if (isV1) {
    // V1 citations are already in the right format
    return opportunity.citations.map((cit) => ({
      url: cit.url,
      sourceType: cit.sourceType,
      excerpt: cit.excerpt,
      evidenceId: cit.evidenceId,
      retrievedAt: cit.retrievedAt,
    }))
  } else {
    // V3 citations need mapping
    return (opportunity.citations || []).map((cit) => ({
      url: cit.url,
      sourceType: cit.source_type,
      excerpt: cit.title || cit.url, // V3 doesn't have excerpt, use title or URL
      label: cit.title || undefined,
      retrievedAt: cit.extracted_at || cit.retrievedAt || cit.published_at || undefined,
      evidenceId: cit.domain || undefined, // Use domain as fallback identifier
    }))
  }
}

export function OpportunityCardV1({
  opportunity,
  projectId,
  className,
}: OpportunityCardV1Props) {
  const [isRisksExpanded, setIsRisksExpanded] = useState(false)
  const [isConfidenceExpanded, setIsConfidenceExpanded] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false)

  const isV1 = isOpportunityV1(opportunity)

  // Get citations and compute evidence strength
  const citations = normalizeCitations(opportunity)
  // Convert to Citation format for strength computation
  const citationsForStrength = citations.map((c) => ({
    url: c.url,
    sourceType: c.sourceType as any,
    excerpt: c.excerpt,
  }))
  const evidenceStrength = computeEvidenceStrength(citationsForStrength as any)

  // Extract data based on type
  const title = opportunity.title
  
  // Get confidence level
  let confidence: string = 'exploratory'
  if (isV1) {
    confidence = opportunity.confidence
  } else {
    // For V3, compute confidence from evidence
    const decisionConfidence = computeDecisionConfidence(opportunity)
    // Map decision confidence levels to V1-style labels
    if (decisionConfidence.level === 'high') {
      confidence = 'investment_ready'
    } else if (decisionConfidence.level === 'moderate') {
      confidence = 'directional'
    } else {
      confidence = 'exploratory'
    }
  }

  // Recommendation block (What to do)
  const whatToDo = isV1 ? opportunity.recommendation?.whatToDo : opportunity.one_liner
  const whyNow = isV1
    ? opportunity.recommendation?.whyNow
    : opportunity.why_now
  const expectedImpact = isV1 ? opportunity.recommendation?.expectedImpact : undefined

  // Why this ranks
  // For V1: use whyThisRanks array
  // For V3: derive from proof_points or scoring explainability
  let whyThisRanks: string[] = []
  if (isV1) {
    whyThisRanks = opportunity.whyThisRanks || []
  } else {
    // For V3, use proof_points as "why this ranks"
    if (opportunity.proof_points && opportunity.proof_points.length > 0) {
      whyThisRanks = opportunity.proof_points
        .slice(0, 3)
        .map((pp) => pp.claim)
        .filter((claim): claim is string => Boolean(claim))
    }
    // Fallback to scoring explainability if available
    if (whyThisRanks.length === 0 && 'scoring' in opportunity && opportunity.scoring) {
      const scoring = opportunity.scoring as any
      if (scoring.explainability && Array.isArray(scoring.explainability)) {
        whyThisRanks = scoring.explainability
          .slice(0, 3)
          .map((exp: any) => exp.explanation)
          .filter((exp: any): exp is string => Boolean(exp))
      }
    }
  }

  // Risks and assumptions
  const risks = isV1 ? opportunity.recommendation?.risks || [] : []
  const assumptions = isV1 ? opportunity.assumptions || [] : []
  
  // For V3, derive risks from tradeoffs if available
  if (!isV1 && 'tradeoffs' in opportunity && opportunity.tradeoffs) {
    const tradeoffs = opportunity.tradeoffs as any
    if (tradeoffs.what_we_say_no_to && Array.isArray(tradeoffs.what_we_say_no_to)) {
      // Use tradeoffs as risks context
    }
  }

  // What would increase confidence
  // Note: This field doesn't exist in OpportunityV1 or V3 schema, so we'll handle it gracefully
  // For V3, we can derive suggestions from experiments or scoring gaps
  const whatWouldIncreaseConfidence: string[] = []
  // If it exists as a property (for future compatibility), use it
  if ('whatWouldIncreaseConfidence' in opportunity && Array.isArray(opportunity.whatWouldIncreaseConfidence)) {
    whatWouldIncreaseConfidence.push(...opportunity.whatWouldIncreaseConfidence)
  } else if (!isV1) {
    // For V3, suggest actions based on available data
    // This is a placeholder - in a real scenario, this would come from the generation logic
    // For now, we'll leave it empty to avoid making up data
  }

  const hasRisksOrAssumptions = risks.length > 0 || assumptions.length > 0
  const hasConfidenceItems = whatWouldIncreaseConfidence.length > 0

  // Determine add evidence href
  const addEvidenceHref = projectId
    ? `/projects/${projectId}/competitors`
    : undefined

  const toggleCheckbox = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <>
      <SectionCard className={cn('space-y-6 md:space-y-8', className)}>
        {/* Header row */}
        <header className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-heading-m font-semibold text-foreground leading-tight">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={getConfidenceVariant(confidence)}>
              {getConfidenceLabel(confidence)}
            </Badge>
          </div>
        </header>

        {/* Evidence strength indicator */}
        {citations.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Evidence: <span className="font-medium text-foreground">
                  {formatEvidenceStrengthLabel(evidenceStrength)}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEvidenceDrawerOpen(true)}
                className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              >
                View evidence
              </Button>
            </div>
            {/* Evidence type pills */}
            {evidenceStrength.types.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {evidenceStrength.types.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="text-xs"
                  >
                    {formatSourceType(type)}
                  </Badge>
                ))}
              </div>
            )}
            {/* Weak evidence callout */}
            {evidenceStrength.isWeak && (
              <div className="rounded-lg bg-muted/30 border border-border-subtle p-3 space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evidence is thin — treat as directional.
                </p>
                {addEvidenceHref && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-auto py-1.5 text-xs"
                  >
                    <Link href={addEvidenceHref}>
                      Improve evidence coverage
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </section>
        )}

      {/* Recommendation block - What to do */}
      {whatToDo && (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">What to do</h4>
          <p className="text-sm text-foreground leading-relaxed">{whatToDo}</p>
          {(whyNow || expectedImpact) && (
            <div className="space-y-1.5 pt-1">
              {whyNow && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Why now:</span>{' '}
                  {whyNow}
                </p>
              )}
              {expectedImpact && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Expected impact:</span>{' '}
                  {expectedImpact}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Why this ranks */}
      {whyThisRanks.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Why this ranks
          </h4>
          <ul className="space-y-2">
            {whyThisRanks.slice(0, 3).map((item, idx) => (
              <li key={idx} className="text-sm text-foreground leading-relaxed">
                • {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Risks & assumptions - collapsible */}
      {hasRisksOrAssumptions && (
        <section>
          <button
            onClick={() => setIsRisksExpanded(!isRisksExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors w-full text-left"
          >
            <span>Risks & assumptions</span>
            <span className="text-muted-foreground ml-auto">
              {isRisksExpanded ? '−' : '+'}
            </span>
          </button>
          {isRisksExpanded && (
            <div className="mt-3 space-y-4 pt-3 border-t border-border-subtle">
              {risks.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Risks
                  </h5>
                  <ul className="space-y-1.5">
                    {risks.map((risk, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-foreground leading-relaxed"
                      >
                        • {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {assumptions.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Assumptions
                  </h5>
                  <ul className="space-y-1.5">
                    {assumptions.map((assumption, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-foreground leading-relaxed"
                      >
                        • {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* What could change this recommendation - collapsible */}
      {hasConfidenceItems && (
        <section className="pt-4 border-t border-border-subtle">
          <button
            onClick={() => setIsConfidenceExpanded(!isConfidenceExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors w-full text-left"
          >
            <span>What could change this recommendation?</span>
            <span className="text-muted-foreground ml-auto">
              {isConfidenceExpanded ? '−' : '+'}
            </span>
          </button>
          {isConfidenceExpanded && (
            <div className="mt-3 space-y-4 pt-3">
              <ul className="space-y-3 mb-4">
                {whatWouldIncreaseConfidence.map((item, idx) => {
                  const href = projectId ? suggestNextStepHref(item, projectId) : null
                  const isChecked = checkedItems.has(idx)

                  return (
                    <li key={idx} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckbox(idx)}
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            'text-sm text-foreground leading-relaxed block',
                            isChecked && 'line-through text-muted-foreground'
                          )}
                        >
                          {item}
                        </span>
                        {href && (
                          <div className="mt-1.5">
                            <Button
                              asChild
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                            >
                              <Link href={href}>Do this</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Plinth won't pretend uncertainty is resolved. These are the steps
                that would strengthen the call.
              </p>
            </div>
          )}
        </section>
      )}
      </SectionCard>

      {/* Evidence Drawer */}
      <OpportunityEvidenceDrawer
        open={isEvidenceDrawerOpen}
        onOpenChange={setIsEvidenceDrawerOpen}
        opportunityTitle={title}
        citations={citations}
        onAddEvidenceHref={addEvidenceHref}
      />
    </>
  )
}

