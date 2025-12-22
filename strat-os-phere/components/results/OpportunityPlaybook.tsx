'use client'

import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Users } from 'lucide-react'

interface OpportunityPlaybookProps {
  opportunity: OpportunityV3Item
  competitors: {
    name: string
    signals?: string[]
  }[]
}

/**
 * OpportunityPlaybook - Shows how competitors currently execute this opportunity
 * and where they're weak. Derived from existing opportunity data.
 */
export function OpportunityPlaybook({
  opportunity,
  competitors,
}: OpportunityPlaybookProps) {
  // Derive competitor insights from opportunity data
  const competitorInsights = deriveCompetitorInsights(opportunity, competitors)
  
  if (competitorInsights.length === 0) {
    return null
  }
  
  return (
    <div className="rounded-lg bg-muted/30 border border-border p-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="playbook" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                How competitors execute today
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-4">
              {competitorInsights.map((insight, index) => (
                <div key={index} className="space-y-2">
                  <h5 className="text-sm font-medium text-foreground">
                    {insight.competitorName}
                  </h5>
                  
                  {insight.currentApproach.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Current approach
                      </p>
                      <ul className="space-y-1 text-sm text-foreground">
                        {insight.currentApproach.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {insight.weaknesses.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Observed weaknesses
                      </p>
                      <ul className="space-y-1 text-sm text-foreground">
                        {insight.weaknesses.map((weakness, weaknessIndex) => (
                          <li key={weaknessIndex} className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {insight.currentApproach.length === 0 && insight.weaknesses.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Limited public signals available for this competitor.
                    </p>
                  )}
                </div>
              ))}
              
              <div className="pt-2 mt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Derived from public signals. Treat as directional starting points.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

interface CompetitorInsight {
  competitorName: string
  currentApproach: string[]
  weaknesses: string[]
}

/**
 * Derives competitor insights from opportunity data.
 * Uses proof_points, citations, and signals_summary to infer competitor approaches.
 */
function deriveCompetitorInsights(
  opportunity: OpportunityV3Item,
  competitors: { name: string; signals?: string[] }[]
): CompetitorInsight[] {
  const insights: CompetitorInsight[] = []
  
  // Extract competitor names from citations and proof points
  const competitorNamesFromCitations = new Set<string>()
  
  // Look for competitor mentions in citations
  opportunity.citations.forEach((citation) => {
    if (citation.domain) {
      // Try to match domain to competitor name (simplified matching)
      const domainName = citation.domain.replace(/^www\./, '').split('.')[0]
      competitors.forEach((comp) => {
        if (comp.name.toLowerCase().includes(domainName.toLowerCase()) ||
            domainName.toLowerCase().includes(comp.name.toLowerCase())) {
          competitorNamesFromCitations.add(comp.name)
        }
      })
    }
  })
  
  // If we have explicit competitor list, use those
  const competitorNamesToAnalyze = competitors.length > 0
    ? competitors.map((c) => c.name)
    : Array.from(competitorNamesFromCitations)
  
  // For each competitor, derive insights from proof points
  competitorNamesToAnalyze.forEach((competitorName) => {
    const relevantProofPoints = opportunity.proof_points.filter((proof) => {
      // Check if proof point mentions competitor or relates to their approach
      const claimLower = proof.claim.toLowerCase()
      return claimLower.includes(competitorName.toLowerCase()) ||
             proof.citations.some((cit) => 
               cit.domain?.toLowerCase().includes(competitorName.toLowerCase())
             )
    })
    
    const currentApproach: string[] = []
    const weaknesses: string[] = []
    
    // Extract approach from proof points
    relevantProofPoints.slice(0, 3).forEach((proof) => {
      const claim = proof.claim.trim()
      if (claim.length > 0 && claim.length < 200) {
        // Check if it's a weakness indicator
        const weaknessIndicators = ['lack', 'missing', 'weak', 'poor', 'fails', 'doesn\'t', 'does not', 'limited']
        const isWeakness = weaknessIndicators.some((indicator) => 
          claim.toLowerCase().includes(indicator)
        )
        
        if (isWeakness) {
          weaknesses.push(claim)
        } else {
          currentApproach.push(claim)
        }
      }
    })
    
    // If no specific proof points, derive from opportunity context
    if (currentApproach.length === 0 && weaknesses.length === 0) {
      // Use tradeoffs to infer weaknesses
      if (opportunity.tradeoffs.why_competitors_wont_follow.length > 0) {
        weaknesses.push(...opportunity.tradeoffs.why_competitors_wont_follow.slice(0, 2))
      }
      
      // Use problem_today to infer what competitors might be doing
      if (opportunity.problem_today) {
        const problemLower = opportunity.problem_today.toLowerCase()
        if (problemLower.includes('competitor') || problemLower.includes('they')) {
          // Extract a simplified version
          const simplified = opportunity.problem_today
            .split('.')[0]
            .substring(0, 150)
            .trim()
          if (simplified.length > 20) {
            currentApproach.push(simplified)
          }
        }
      }
    }
    
    // Only add if we have some insight
    if (currentApproach.length > 0 || weaknesses.length > 0 || competitors.length > 0) {
      insights.push({
        competitorName,
        currentApproach: currentApproach.slice(0, 3),
        weaknesses: weaknesses.slice(0, 2),
      })
    }
  })
  
  // If no insights derived, but we have competitors, show placeholder
  if (insights.length === 0 && competitors.length > 0) {
    return competitors.map((comp) => ({
      competitorName: comp.name,
      currentApproach: [],
      weaknesses: [],
    }))
  }
  
  return insights
}

