'use client'

import { ReadoutHeader } from './ReadoutHeader'
import { ExecutiveSummarySection } from './ExecutiveSummarySection'
import { TopOpportunitiesSection } from './TopOpportunitiesSection'
import { WhatShouldWeDoNextSection } from './WhatShouldWeDoNextSection'
import { WhyThisMattersSection } from './WhyThisMattersSection'
import { AppendixSection } from './AppendixSection'
import type { ReadoutData } from '@/lib/results/selectors'
import type { NormalizedResults } from '@/lib/results/normalizeResults'

interface ResultsReadoutViewProps {
  projectId: string
  projectName: string
  readoutData: ReadoutData
  normalized: NormalizedResults
}

/**
 * Results Readout View - Main executive narrative readout component
 * 
 * This is the default view for the results page, presenting a VP-ready
 * narrative synthesis of the competitive analysis.
 */
export function ResultsReadoutView({
  projectId,
  projectName,
  readoutData,
  normalized,
}: ResultsReadoutViewProps) {
  return (
    <div className="space-y-8">
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

