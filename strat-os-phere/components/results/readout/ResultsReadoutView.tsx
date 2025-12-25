'use client'

import { ReadoutHeader } from './ReadoutHeader'
import { ExecutiveSummarySection } from './ExecutiveSummarySection'
import { TopOpportunitiesSection } from './TopOpportunitiesSection'
import { WhatShouldWeDoNextSection } from './WhatShouldWeDoNextSection'
import { WhyThisMattersSection } from './WhyThisMattersSection'
import { AppendixSection } from './AppendixSection'
import { DecisionVerdictCanvas } from '../DecisionVerdictCanvas'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import type { ReadoutData } from '@/lib/results/selectors'
import type { NormalizedResults } from '@/lib/results/normalizeResults'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'

interface ResultsReadoutViewProps {
  projectId: string
  projectName: string
  readoutData: ReadoutData
  normalized: NormalizedResults
  hideHeader?: boolean
}

/**
 * Results Readout View - Main executive narrative readout component
 * 
 * When analysis is complete, shows Decision Verdict Canvas as the primary view.
 * This replaces the preview-style card with a full verdict artifact.
 */
export function ResultsReadoutView({
  projectId,
  projectName,
  readoutData,
  normalized,
  hideHeader = false,
}: ResultsReadoutViewProps) {
  // Check if we have a top opportunity to show as verdict canvas
  // Only show verdict canvas for V3 opportunities (they have the full structure we need)
  const bestArtifact = normalized.opportunities.best
  const isV3 = bestArtifact?.type === 'opportunities_v3'
  
  // Get the top opportunity for verdict canvas
  let verdictOpportunity: OpportunityV3Item | null = null
  if (isV3 && bestArtifact.content && 'opportunities' in bestArtifact.content) {
    const opportunities = bestArtifact.content.opportunities
    if (opportunities && opportunities.length > 0) {
      const sorted = [...opportunities].sort((a, b) => {
        const scoreA = getOpportunityScore(a) ?? 0
        const scoreB = getOpportunityScore(b) ?? 0
        return scoreB - scoreA
      })
      verdictOpportunity = sorted[0] as OpportunityV3Item
    }
  }
  
  // Show Decision Verdict Canvas if we have a top opportunity
  if (verdictOpportunity) {
    return (
      <div className="space-y-8">
        {!hideHeader && (
          <ReadoutHeader
            projectName={projectName}
            lastGeneratedAt={readoutData.lastGeneratedAt}
            projectId={projectId}
            onViewAppendix={() => {
              // Scroll to appendix section
              const appendix = document.getElementById('appendix-section')
              if (appendix) {
                appendix.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          />
        )}

        {/* Decision Verdict Canvas - Primary view when analysis is complete */}
        <DecisionVerdictCanvas
          opportunity={verdictOpportunity}
          projectId={projectId}
        />

        {/* Other opportunities (if any) */}
        {isV3 && bestArtifact.content && 'opportunities' in bestArtifact.content && bestArtifact.content.opportunities.length > 1 && (
          <div className="pt-8 border-t border-border">
            <TopOpportunitiesSection
              opportunities={readoutData.topOpportunities.slice(1)} // Skip first one (shown in canvas)
              projectId={projectId}
            />
          </div>
        )}

        <div id="appendix-section">
          <AppendixSection projectId={projectId} normalized={normalized} />
        </div>
      </div>
    )
  }
  
  // Fallback to original readout view if no V3 opportunities
  return (
    <div className="space-y-8">
      {!hideHeader && (
        <ReadoutHeader
          projectName={projectName}
          lastGeneratedAt={readoutData.lastGeneratedAt}
          projectId={projectId}
          onViewAppendix={() => {
            // Scroll to appendix section
            const appendix = document.getElementById('appendix-section')
            if (appendix) {
              appendix.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        />
      )}

      <ExecutiveSummarySection bullets={readoutData.execSummaryBullets} />

      <TopOpportunitiesSection
        opportunities={readoutData.topOpportunities}
        projectId={projectId}
      />

      <WhatShouldWeDoNextSection
        decision={readoutData.actionPlan.decision}
        next3Moves={readoutData.actionPlan.next3Moves}
        whatToSayNoTo={readoutData.actionPlan.whatToSayNoTo}
        hasStrategicBets={Boolean(normalized.strategicBets)}
      />

      <WhyThisMattersSection
        marketTension={readoutData.whyThisMatters.marketTension}
        whyNow={readoutData.whyThisMatters.whyNow}
        whyDefensible={readoutData.whyThisMatters.whyDefensible}
      />

      <div id="appendix-section">
        <AppendixSection projectId={projectId} normalized={normalized} />
      </div>
    </div>
  )
}

