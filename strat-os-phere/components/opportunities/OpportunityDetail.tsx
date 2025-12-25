'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/results/SectionCard'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import { computeDecisionConfidence } from '@/lib/ui/decisionConfidence'
import { OpportunityEvidenceDrawer, type EvidenceDrawerCitation } from '@/components/evidence/OpportunityEvidenceDrawer'
import { formatSourceType } from '@/lib/ux/evidenceStrength'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'
import type { OpportunityItem } from '@/lib/schemas/opportunities'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import { useState } from 'react'

type Opportunity = OpportunityV3Item | OpportunityItem

interface OpportunityDetailProps {
  opportunity: Opportunity
  projectId: string
  opportunitiesV3: OpportunityV3ArtifactContent | null
  opportunitiesV2: OpportunitiesArtifactContent | null
}

/**
 * Normalize citations from V1 or V3 format to EvidenceDrawerCitation
 */
function normalizeCitations(opportunity: Opportunity): EvidenceDrawerCitation[] {
  // V3 citations
  if ('citations' in opportunity && Array.isArray(opportunity.citations)) {
    return opportunity.citations.map((cit) => ({
      url: cit.url,
      sourceType: cit.source_type,
      excerpt: cit.title || cit.url,
      label: cit.title || undefined,
      retrievedAt: cit.extracted_at || cit.retrievedAt || cit.published_at || undefined,
      evidenceId: cit.domain || undefined,
    }))
  }

  // V2 citations (if they exist)
  if ('citations' in opportunity && Array.isArray(opportunity.citations)) {
    const citations = opportunity.citations as any[]
    return citations.map((cit) => ({
      url: cit.url || cit.source || '',
      sourceType: cit.source_type || cit.type || 'other',
      excerpt: cit.title || cit.excerpt || cit.url || '',
      label: cit.title || undefined,
      retrievedAt: cit.retrieved_at || cit.retrievedAt || undefined,
      evidenceId: cit.evidence_id || cit.domain || undefined,
    })).filter((c) => c.url)
  }

  return []
}

/**
 * Extract citations from proof points (V3)
 */
function extractProofPointCitations(opportunity: Opportunity): EvidenceDrawerCitation[] {
  if ('proof_points' in opportunity && Array.isArray(opportunity.proof_points)) {
    const citations: EvidenceDrawerCitation[] = []
    for (const pp of opportunity.proof_points) {
      if (pp.citations && Array.isArray(pp.citations)) {
        for (const cit of pp.citations) {
          citations.push({
            url: cit.url,
            sourceType: cit.source_type,
            excerpt: pp.claim || cit.title || cit.url,
            label: cit.title || undefined,
            retrievedAt: cit.extracted_at || cit.retrievedAt || cit.published_at || undefined,
            evidenceId: cit.domain || undefined,
          })
        }
      }
    }
    return citations
  }
  return []
}

/**
 * Get key signals broken down by type
 */
function getKeySignals(opportunity: Opportunity): Array<{
  label: string
  type: 'competitive' | 'customer' | 'market' | 'business'
  content: string
  citations: EvidenceDrawerCitation[]
}> {
  const signals: Array<{
    label: string
    type: 'competitive' | 'customer' | 'market' | 'business'
    content: string
    citations: EvidenceDrawerCitation[]
  }> = []

  // V3: Extract from proof_points
  if ('proof_points' in opportunity && Array.isArray(opportunity.proof_points)) {
    for (const pp of opportunity.proof_points) {
      const citations: EvidenceDrawerCitation[] = []
      if (pp.citations && Array.isArray(pp.citations)) {
        for (const cit of pp.citations) {
          citations.push({
            url: cit.url,
            sourceType: cit.source_type,
            excerpt: pp.claim || cit.title || cit.url,
            label: cit.title || undefined,
            retrievedAt: cit.extracted_at || cit.retrievedAt || cit.published_at || undefined,
            evidenceId: cit.domain || undefined,
          })
        }
      }

      // Categorize by source type
      const sourceType = citations[0]?.sourceType || 'other'
      let type: 'competitive' | 'customer' | 'market' | 'business' = 'market'
      let label = 'Market signal'

      if (sourceType === 'changelog') {
        type = 'competitive'
        label = 'Competitive landscape'
      } else if (sourceType === 'reviews') {
        type = 'customer'
        label = 'Customer signals'
      } else if (sourceType === 'pricing' || sourceType === 'marketing_site') {
        type = 'market'
        label = 'Market expectations'
      } else {
        type = 'business'
        label = 'Business risk'
      }

      signals.push({
        label,
        type,
        content: pp.claim,
        citations,
      })
    }
  }

  return signals
}

/**
 * Determine relationship to decision
 */
function getRelationshipToDecision(
  opportunity: Opportunity,
  allOpportunities: Opportunity[]
): { role: 'primary' | 'secondary' | 'supporting' | 'deprioritized'; explanation: string } {
  const score = getOpportunityScore(opportunity)
  
  // Sort all opportunities by score
  const sorted = [...allOpportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  const index = sorted.findIndex((opp) => {
    const oppId = 'id' in opp ? opp.id : opp.title
    const currentId = 'id' in opportunity ? opportunity.id : opportunity.title
    return oppId === currentId
  })

  if (index === 0 && score && score >= 70) {
    return {
      role: 'primary',
      explanation: 'Primary driver of the recommended strategy. This opportunity has the strongest evidence and highest score, making it the core recommendation.',
    }
  } else if (index === 0 || (score && score >= 60)) {
    return {
      role: 'primary',
      explanation: 'Primary recommendation based on evidence strength and scoring.',
    }
  } else if (index === 1 || index === 2) {
    return {
      role: 'secondary',
      explanation: 'Secondary option that supports the primary recommendation. Worth considering as part of a broader strategy.',
    }
  } else if (score && score >= 50) {
    return {
      role: 'supporting',
      explanation: 'Supporting option that complements the primary strategy but has lower evidence strength.',
    }
  } else {
    return {
      role: 'deprioritized',
      explanation: 'Considered but deprioritized due to lower evidence strength or score. May become more relevant as evidence grows.',
    }
  }
}

/**
 * Opportunity Detail Component
 * 
 * Focused deep dive on a single opportunity. Displays:
 * 1. Opportunity Overview (title, score, confidence, thesis)
 * 2. Key Signals (competitive, customer, market, business)
 * 3. Evidence (full, inspectable)
 * 4. Relationship to the Decision
 */
export function OpportunityDetail({
  opportunity,
  projectId,
  opportunitiesV3,
  opportunitiesV2,
}: OpportunityDetailProps) {
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false)

  const score = getOpportunityScore(opportunity)
  
  // Compute confidence
  let confidence: { label: string; variant: 'default' | 'secondary' | 'muted' } = { label: 'Exploratory', variant: 'muted' }
  if ('scoring' in opportunity) {
    const decisionConfidence = computeDecisionConfidence(opportunity as OpportunityV3Item)
    if (decisionConfidence.level === 'high') {
      confidence = { label: 'Investment-ready', variant: 'default' }
    } else if (decisionConfidence.level === 'moderate') {
      confidence = { label: 'Directional', variant: 'secondary' }
    }
  } else if ('confidence' in opportunity && typeof opportunity.confidence === 'string') {
    const conf = opportunity.confidence.toLowerCase()
    if (conf === 'investment_ready' || conf === 'investment-ready') {
      confidence = { label: 'Investment-ready', variant: 'default' }
    } else if (conf === 'directional') {
      confidence = { label: 'Directional', variant: 'secondary' }
    }
  }

  // Get all opportunities for relationship calculation
  const allOpportunities = [
    ...(opportunitiesV3?.opportunities || []),
    ...(opportunitiesV2?.opportunities || []),
  ]

  const relationship = getRelationshipToDecision(opportunity, allOpportunities)

  // Collect all citations
  const directCitations = normalizeCitations(opportunity)
  const proofPointCitations = extractProofPointCitations(opportunity)
  const allCitations = [...directCitations, ...proofPointCitations]
  
  // Deduplicate by URL
  const uniqueCitations = Array.from(
    new Map(allCitations.map((c) => [c.url, c])).values()
  )

  const keySignals = getKeySignals(opportunity)

  // Get thesis/summary
  const thesis = 'one_liner' in opportunity 
    ? opportunity.one_liner 
    : 'description' in opportunity 
      ? opportunity.description 
      : opportunity.title

  return (
    <>
      <div className="space-y-6">
        {/* 1. Opportunity Overview */}
        <SectionCard>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {opportunity.title}
                </h2>
                <div className="flex items-center gap-3">
                  {score !== null && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                      <span className="text-lg font-bold text-foreground">
                        {score.toFixed(0)}
                      </span>
                      <span className="text-xs text-muted-foreground">score</span>
                    </div>
                  )}
                  <Badge variant={confidence.variant}>
                    {confidence.label}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {thesis}
            </p>
            {('why_now' in opportunity && opportunity.why_now) && (
              <div className="pt-2 border-t border-border-subtle">
                <p className="text-xs font-medium text-muted-foreground mb-1">Why now</p>
                <p className="text-sm text-foreground">{opportunity.why_now}</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 2. Key Signals (Expanded) */}
        {keySignals.length > 0 && (
          <SectionCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Key Signals
            </h3>
            <div className="space-y-4">
              {keySignals.map((signal, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {signal.label}
                    </span>
                    {signal.citations.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {signal.citations.length} source{signal.citations.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {signal.content}
                  </p>
                  {signal.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {signal.citations.slice(0, 3).map((cit, citIdx) => (
                        <Badge
                          key={citIdx}
                          variant="outline"
                          className="text-xs"
                          asChild
                        >
                          <a
                            href={cit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer"
                          >
                            {formatSourceType(cit.sourceType)}
                          </a>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* 3. Evidence (Full, Inspectable) */}
        {uniqueCitations.length > 0 && (
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Evidence
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEvidenceDrawerOpen(true)}
              >
                View all evidence ({uniqueCitations.length})
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Detailed sources including pricing pages, docs, reviews, and other public signals.
            </p>
            <div className="space-y-2">
              {uniqueCitations.slice(0, 5).map((citation, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors block truncate"
                    >
                      {citation.label || citation.url}
                    </a>
                    {citation.excerpt && citation.excerpt !== citation.url && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {citation.excerpt}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-3 shrink-0">
                    {formatSourceType(citation.sourceType)}
                  </Badge>
                </div>
              ))}
              {uniqueCitations.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEvidenceDrawerOpen(true)}
                  className="w-full"
                >
                  View {uniqueCitations.length - 5} more sources
                </Button>
              )}
            </div>
          </SectionCard>
        )}

        {/* 4. Relationship to the Decision */}
        <SectionCard>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Relationship to the Decision
          </h3>
          <div className="space-y-3">
            <div>
              <Badge
                variant={
                  relationship.role === 'primary'
                    ? 'default'
                    : relationship.role === 'secondary'
                    ? 'secondary'
                    : 'muted'
                }
                className="mb-2"
              >
                {relationship.role === 'primary'
                  ? 'Primary driver'
                  : relationship.role === 'secondary'
                  ? 'Secondary option'
                  : relationship.role === 'supporting'
                  ? 'Supporting option'
                  : 'Considered but deprioritized'}
              </Badge>
              <p className="text-sm text-foreground leading-relaxed">
                {relationship.explanation}
              </p>
            </div>
            <div className="pt-3 border-t border-border-subtle">
              <Button variant="outline" asChild>
                <Link href={`/projects/${projectId}/decision`}>
                  View decision summary
                </Link>
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Evidence Drawer */}
      <OpportunityEvidenceDrawer
        open={isEvidenceDrawerOpen}
        onOpenChange={setIsEvidenceDrawerOpen}
        opportunityTitle={opportunity.title}
        citations={uniqueCitations}
        onAddEvidenceHref={`/projects/${projectId}/competitors`}
      />
    </>
  )
}

