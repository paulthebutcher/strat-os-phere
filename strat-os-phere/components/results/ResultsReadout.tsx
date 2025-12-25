'use client'

import { useMemo } from 'react'
import { DecisionBrief } from './DecisionBrief'
import { DecisionLeversSection } from '@/components/decision-levers/DecisionLeversSection'
import { deriveAssumptionsFromOpportunities } from '@/lib/results/assumptions'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

interface ResultsReadoutProps {
  projectId: string
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
  generatedAt?: string | null
  projectName?: string
  competitorCount?: number
}

/**
 * ResultsReadout - Wrapper component for Decision Brief and Assumptions Explorer
 * 
 * This component:
 * - Derives assumptions from opportunities on the client (pure function)
 * - Renders Decision Brief and unified Assumptions Explorer
 */
export function ResultsReadout({
  projectId,
  opportunitiesV3,
  opportunitiesV2,
  generatedAt,
  projectName,
  competitorCount,
}: ResultsReadoutProps) {
  // Derive assumptions from opportunities (memoized)
  const assumptions = useMemo(() => {
    return deriveAssumptionsFromOpportunities(opportunitiesV3, opportunitiesV2)
  }, [opportunitiesV3, opportunitiesV2])

  return (
    <div className="space-y-6">
      {/* Decision Brief */}
      <DecisionBrief
        projectId={projectId}
        opportunitiesV3={opportunitiesV3}
        opportunitiesV2={opportunitiesV2}
        generatedAt={generatedAt}
        projectName={projectName}
        competitorCount={competitorCount}
        levers={assumptions}
      />

      {/* Decision Levers (Action Matrix + Queue) */}
      {assumptions.length > 0 && (
        <DecisionLeversSection
          projectId={projectId}
          levers={assumptions}
        />
      )}
    </div>
  )
}

