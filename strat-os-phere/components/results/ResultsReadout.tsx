'use client'

import { useState, useMemo } from 'react'
import { ExecutiveReadout } from './ExecutiveReadout'
import { AssumptionsMap } from './AssumptionsMap'
import { AssumptionsLedger } from './AssumptionsLedger'
import { deriveAssumptionsFromOpportunities } from '@/lib/results/assumptions'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

interface ResultsReadoutProps {
  projectId: string
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
  generatedAt?: string | null
  projectName?: string
}

/**
 * ResultsReadout - Wrapper component for Executive Summary, Assumptions Map, and Assumptions Ledger
 * 
 * This component:
 * - Derives assumptions from opportunities on the client (pure function)
 * - Manages selected assumption state for map ↔ ledger interaction
 * - Renders all three sections in order
 */
export function ResultsReadout({
  projectId,
  opportunitiesV3,
  opportunitiesV2,
  generatedAt,
  projectName,
}: ResultsReadoutProps) {
  // Derive assumptions from opportunities (memoized)
  const assumptions = useMemo(() => {
    return deriveAssumptionsFromOpportunities(opportunitiesV3, opportunitiesV2)
  }, [opportunitiesV3, opportunitiesV2])

  // Selected assumption for map ↔ ledger interaction
  const [selectedAssumptionId, setSelectedAssumptionId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Executive Readout */}
      <ExecutiveReadout
        opportunitiesV3={opportunitiesV3}
        opportunitiesV2={opportunitiesV2}
        generatedAt={generatedAt}
        projectName={projectName}
      />

      {/* Assumptions Map */}
      {assumptions.length > 0 && (
        <AssumptionsMap
          projectId={projectId}
          assumptions={assumptions}
          selectedAssumptionId={selectedAssumptionId}
          onSelectAssumption={(id) => {
            setSelectedAssumptionId(id)
            // Scroll to ledger if an assumption is selected
            if (id) {
              setTimeout(() => {
                const element = document.getElementById(`assumption-row-${id}`)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  // Highlight briefly
                  element.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
                  setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
                  }, 2000)
                }
              }, 100)
            }
          }}
        />
      )}

      {/* Assumptions Ledger */}
      {assumptions.length > 0 && (
        <div id="assumptions-ledger">
          <AssumptionsLedger
            projectId={projectId}
            assumptions={assumptions}
            selectedAssumptionId={selectedAssumptionId}
            onSelectAssumption={setSelectedAssumptionId}
          />
        </div>
      )}
    </div>
  )
}

