'use client'

import * as React from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatSourceType } from '@/lib/ux/evidenceStrength'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'
import type { Citation } from '@/lib/schemas/opportunityV3'

interface EvidenceSignal {
  name: string
  insight: string
  score: number | null
  sourceTypes: string[]
  citations: Citation[]
}

/**
 * Extract evidence signals from opportunity
 */
function extractEvidenceSignals(opportunity: OpportunityV3Item): EvidenceSignal[] {
  const signals: EvidenceSignal[] = []
  
  // Group proof points by signal type
  if (opportunity.proof_points && opportunity.proof_points.length > 0) {
    // Competitive norms - from changelog citations
    const competitiveProofPoints = opportunity.proof_points.filter((pp) => {
      return pp.citations?.some((cit) => cit.source_type === 'changelog')
    })
    
    if (competitiveProofPoints.length > 0) {
      const citations: Citation[] = []
      competitiveProofPoints.forEach((pp) => {
        if (pp.citations) {
          citations.push(...pp.citations.filter((cit) => cit.source_type === 'changelog'))
        }
      })
      
      const sourceTypes = Array.from(new Set(citations.map((c) => c.source_type).filter(Boolean)))
      const insight = competitiveProofPoints[0]?.claim || 'Competitive landscape signals'
      
      signals.push({
        name: 'Competitive Norms',
        insight,
        score: null, // Could derive from scoring breakdown if available
        sourceTypes: sourceTypes as string[],
        citations: citations.slice(0, 5), // Limit for display
      })
    }
    
    // Customer friction - from reviews citations
    const customerProofPoints = opportunity.proof_points.filter((pp) => {
      return pp.citations?.some((cit) => cit.source_type === 'reviews')
    })
    
    if (customerProofPoints.length > 0) {
      const citations: Citation[] = []
      customerProofPoints.forEach((pp) => {
        if (pp.citations) {
          citations.push(...pp.citations.filter((cit) => cit.source_type === 'reviews'))
        }
      })
      
      const sourceTypes = Array.from(new Set(citations.map((c) => c.source_type).filter(Boolean)))
      const insight = customerProofPoints[0]?.claim || 'Customer feedback signals'
      
      signals.push({
        name: 'Customer Friction',
        insight,
        score: null,
        sourceTypes: sourceTypes as string[],
        citations: citations.slice(0, 5),
      })
    }
    
    // Market expectations - from pricing/docs/marketing_site citations
    const marketProofPoints = opportunity.proof_points.filter((pp) => {
      return pp.citations?.some((cit) => 
        cit.source_type === 'pricing' || 
        cit.source_type === 'docs' || 
        cit.source_type === 'marketing_site'
      )
    })
    
    if (marketProofPoints.length > 0) {
      const citations: Citation[] = []
      marketProofPoints.forEach((pp) => {
        if (pp.citations) {
          citations.push(...pp.citations.filter((cit) => 
            cit.source_type === 'pricing' || 
            cit.source_type === 'docs' || 
            cit.source_type === 'marketing_site'
          ))
        }
      })
      
      const sourceTypes = Array.from(new Set(citations.map((c) => c.source_type).filter(Boolean)))
      const insight = marketProofPoints[0]?.claim || 'Market positioning signals'
      
      signals.push({
        name: 'Market Expectations',
        insight,
        score: null,
        sourceTypes: sourceTypes as string[],
        citations: citations.slice(0, 5),
      })
    }
    
    // Business risk - from status/jobs citations or low confidence signals
    const riskProofPoints = opportunity.proof_points.filter((pp) => {
      return pp.citations?.some((cit) => 
        cit.source_type === 'status' || 
        cit.source_type === 'jobs'
      )
    })
    
    if (riskProofPoints.length > 0) {
      const citations: Citation[] = []
      riskProofPoints.forEach((pp) => {
        if (pp.citations) {
          citations.push(...pp.citations.filter((cit) => 
            cit.source_type === 'status' || 
            cit.source_type === 'jobs'
          ))
        }
      })
      
      const sourceTypes = Array.from(new Set(citations.map((c) => c.source_type).filter(Boolean)))
      const insight = riskProofPoints[0]?.claim || 'Business risk signals'
      
      signals.push({
        name: 'Business Risk',
        insight,
        score: null,
        sourceTypes: sourceTypes as string[],
        citations: citations.slice(0, 5),
      })
    }
  }
  
  // If no signals from proof points, create generic signals from citations
  if (signals.length === 0 && opportunity.citations && opportunity.citations.length > 0) {
    const citations = opportunity.citations
    const sourceTypes = Array.from(new Set(citations.map((c) => c.source_type).filter(Boolean)))
    
    signals.push({
      name: 'Evidence Signals',
      insight: 'Evidence from multiple sources supports this decision',
      score: null,
      sourceTypes: sourceTypes as string[],
      citations: citations.slice(0, 5),
    })
  }
  
  return signals.slice(0, 4) // Limit to 4 signals
}

/**
 * Evidence Signal Grid - Inline, visible evidence signals
 */
export function EvidenceSignalGrid({ opportunity }: { opportunity: OpportunityV3Item }) {
  const signals = extractEvidenceSignals(opportunity)
  
  if (signals.length === 0) {
    return null
  }
  
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Evidence Signals</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {signals.map((signal, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-border bg-surface p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">{signal.name}</h3>
              {signal.score !== null && (
                <div className="text-xs font-medium text-muted-foreground">
                  {signal.score.toFixed(1)}
                </div>
              )}
            </div>
            
            <p className="text-sm text-foreground leading-relaxed">
              {signal.insight}
            </p>
            
            {signal.sourceTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {signal.sourceTypes.map((sourceType, stIdx) => (
                  <span
                    key={stIdx}
                    className="inline-flex items-center rounded-md border border-border bg-muted/30 px-2 py-0.5 text-xs text-foreground"
                  >
                    {formatSourceType(sourceType)}
                  </span>
                ))}
              </div>
            )}
            
            {signal.citations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {signal.citations.slice(0, 3).map((citation, citIdx) => {
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
                      key={citIdx}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                      title={citation.title || domain}
                    >
                      <span className="truncate max-w-[120px]">{domain}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  )
                })}
                {signal.citations.length > 3 && (
                  <span className="text-xs text-muted-foreground px-2 py-1">
                    +{signal.citations.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

