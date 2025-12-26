'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { paths } from '@/lib/routes'
import { Badge } from '@/components/ui/badge'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import { computeDecisionConfidence } from '@/lib/ui/decisionConfidence'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'
import type { OpportunityItem } from '@/lib/schemas/opportunities'
import { encodeOpportunityId } from '@/lib/opportunities/opportunityId'
import { getOpportunityBlurb } from '@/lib/opportunities/getOpportunityBlurb'
import { MotionList, MotionListItem } from '@/components/ui/Motion'
import { FileText, MessageSquare, DollarSign, GitBranch } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'

type Opportunity = OpportunityV3Item | OpportunityItem

interface OpportunitiesListProps {
  opportunities: Opportunity[]
  projectId: string
  className?: string
}

/**
 * Get a 1-line insight/why it exists for an opportunity
 */
function getOneLineInsight(opportunity: Opportunity): string {
  // V3: Use one_liner first
  if ('one_liner' in opportunity && opportunity.one_liner) {
    return opportunity.one_liner
  }
  
  // Fallback to blurb helper which safely handles description/why_now/summary
  const blurb = getOpportunityBlurb(opportunity)
  if (blurb && blurb !== "Opportunity details are still being generated.") {
    return blurb
  }
  
  // Final fallback: Use title as insight
  return opportunity.title
}

/**
 * Get confidence label for display
 */
function getConfidenceLabel(opportunity: Opportunity): { label: string; variant: 'default' | 'secondary' | 'muted' } {
  // V3: Compute from evidence
  if ('scoring' in opportunity) {
    const confidence = computeDecisionConfidence(opportunity as OpportunityV3Item)
    if (confidence.level === 'high') {
      return { label: 'Investment-ready', variant: 'default' }
    } else if (confidence.level === 'moderate') {
      return { label: 'Directional', variant: 'secondary' }
    } else {
      return { label: 'Exploratory', variant: 'muted' }
    }
  }
  
  // V1/V2: Use confidence field directly
  if ('confidence' in opportunity && typeof opportunity.confidence === 'string') {
    const conf = opportunity.confidence.toLowerCase()
    if (conf === 'investment_ready' || conf === 'investment-ready') {
      return { label: 'Investment-ready', variant: 'default' }
    } else if (conf === 'directional') {
      return { label: 'Directional', variant: 'secondary' }
    } else {
      return { label: 'Exploratory', variant: 'muted' }
    }
  }
  
  return { label: 'Exploratory', variant: 'muted' }
}

/**
 * Get evidence type icon for an opportunity
 */
function getEvidenceTypeIcon(opportunity: Opportunity) {
  // V3: Check citations for source types
  if ('citations' in opportunity && Array.isArray(opportunity.citations) && opportunity.citations.length > 0) {
    const firstCitation = opportunity.citations[0]
    const sourceType = firstCitation?.source_type?.toLowerCase() || ''
    
    if (sourceType === 'pricing') {
      return DollarSign
    } else if (sourceType === 'reviews') {
      return MessageSquare
    } else if (sourceType === 'changelog') {
      return GitBranch
    } else if (sourceType === 'docs') {
      return FileText
    }
  }
  
  // Default to FileText
  return FileText
}

/**
 * Opportunities List - Scannable list view for filtering and quick inspection
 * 
 * Displays opportunities as rows with:
 * - Title
 * - Score
 * - Confidence indicator
 * - 1-line insight
 * 
 * Clicking a row navigates to the Opportunity Detail page.
 */
export function OpportunitiesList({
  opportunities,
  projectId,
  className,
}: OpportunitiesListProps) {
  // Sort by score descending
  const sorted = [...opportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  if (sorted.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border-subtle p-8 text-center', className)}>
        <p className="text-sm text-muted-foreground">No opportunities available.</p>
      </div>
    )
  }

  return (
    <MotionList className={cn('space-y-2', className)}>
      {sorted.map((opportunity, index) => {
        const score = getOpportunityScore(opportunity)
        const confidence = getConfidenceLabel(opportunity)
        const insight = getOneLineInsight(opportunity)
        const opportunityId = 'id' in opportunity ? opportunity.id : opportunity.title
        const encodedId = encodeOpportunityId(opportunityId)
        const EvidenceIconComponent = getEvidenceTypeIcon(opportunity)
        
        return (
          <MotionListItem key={opportunityId}>
            <Link
              href={paths.opportunity(projectId, encodedId)}
              className="block rounded-lg border border-border-subtle bg-card p-4 transition-colors hover:border-border hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-3">
                    <Icon 
                      name={EvidenceIconComponent} 
                      size="sm" 
                      className="text-muted-foreground shrink-0"
                    />
                    <h3 className="text-sm font-semibold text-foreground leading-tight">
                      {opportunity.title}
                    </h3>
                    <Badge variant={confidence.variant} className="shrink-0 text-xs">
                      {confidence.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {insight}
                  </p>
                </div>
                {score !== null && (
                  <div className="flex shrink-0 items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                    <span className="text-base font-bold text-foreground">
                      {score.toFixed(0)}
                    </span>
                    <span className="text-xs text-muted-foreground">score</span>
                  </div>
                )}
              </div>
            </Link>
          </MotionListItem>
        )
      })}
    </MotionList>
  )
}

