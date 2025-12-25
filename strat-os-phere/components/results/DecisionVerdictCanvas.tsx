'use client'

import * as React from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { SectionCard } from '@/components/results/SectionCard'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import { computeDecisionConfidence } from '@/lib/ui/decisionConfidence'
import { formatSourceType } from '@/lib/ux/evidenceStrength'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'
import type { Citation } from '@/lib/schemas/opportunityV3'
import { EvidenceSignalGrid } from './EvidenceSignalGrid'
import { ScoringLogic } from './ScoringLogic'

interface DecisionVerdictCanvasProps {
  opportunity: OpportunityV3Item
  projectId?: string
  className?: string
}

/**
 * Extract all citations from opportunity
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
 * Get "What would change this call" conditions
 */
function getWhatWouldChange(opportunity: OpportunityV3Item): string[] {
  const conditions: string[] = []
  
  // Use tradeoffs.why_competitors_wont_follow as falsifiable conditions
  if (opportunity.tradeoffs?.why_competitors_wont_follow) {
    for (const reason of opportunity.tradeoffs.why_competitors_wont_follow) {
      conditions.push(reason)
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
 * Get confidence label from confidence level
 */
function getConfidenceLabel(level: 'high' | 'moderate' | 'exploratory'): string {
  switch (level) {
    case 'high':
      return 'Investment-ready'
    case 'moderate':
      return 'Directional'
    case 'exploratory':
      return 'Exploratory'
  }
}

/**
 * Get source type summary for evidence coverage
 */
function getSourceTypeSummary(citations: Citation[]): string {
  const sourceTypes = new Set<string>()
  for (const cit of citations) {
    if (cit.source_type) {
      sourceTypes.add(cit.source_type)
    }
  }
  
  const types = Array.from(sourceTypes).slice(0, 3)
  if (types.length === 0) {
    return 'No sources'
  }
  
  return types.map(t => formatSourceType(t)).join(' · ')
}

/**
 * Decision Verdict Canvas - Full-width, static-first decision artifact
 * 
 * Structure:
 * 1. Verdict Header (decision statement, score, confidence, evidence coverage)
 * 2. Evidence Signal Grid (inline, visible signals)
 * 3. Scoring Logic (explicit, minimal)
 * 4. Decision Guardrails (what would change the call)
 */
export function DecisionVerdictCanvas({
  opportunity,
  projectId,
  className,
}: DecisionVerdictCanvasProps) {
  const score = getOpportunityScore(opportunity)
  const allCitations = extractAllCitations(opportunity)
  const whatWouldChange = getWhatWouldChange(opportunity)
  const confidence = computeDecisionConfidence(opportunity)
  const confidenceLabel = getConfidenceLabel(confidence.level)
  const sourceTypeSummary = getSourceTypeSummary(allCitations)
  
  return (
    <div className={cn('space-y-8', className)}>
      {/* 1. Verdict Header */}
      <header className="space-y-4 pb-6 border-b border-border">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight">
          {opportunity.title}
        </h1>
        
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {score !== null && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Score:</span>
              <span className="font-semibold text-foreground">{score.toFixed(0)}</span>
              <span className="text-muted-foreground">/ 100</span>
            </div>
          )}
          
          <Badge 
            variant={confidence.level === 'high' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {confidenceLabel}
          </Badge>
          
          {allCitations.length > 0 && (
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">{allCitations.length}</span> sources
              {sourceTypeSummary && (
                <>
                  {' · '}
                  <span className="text-muted-foreground">{sourceTypeSummary}</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 2. Evidence Signal Grid */}
      <EvidenceSignalGrid opportunity={opportunity} />

      {/* 3. Scoring Logic */}
      <ScoringLogic opportunity={opportunity} score={score} />

      {/* 4. Decision Guardrails */}
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
    </div>
  )
}

