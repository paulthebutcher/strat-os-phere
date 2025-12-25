'use client'

import { extractCitationsFromAllArtifacts } from '@/lib/results/evidence'
import { OpportunitiesList } from '@/components/opportunities/OpportunitiesList'
import { EvidenceTable } from '@/components/evidence/EvidenceTable'
import { useProjectEvidence } from '@/lib/hooks/useProjectEvidence'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { StrategicBetsArtifactContent } from '@/lib/schemas/strategicBet'
import type { JtbdArtifactContent } from '@/lib/schemas/jtbd'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'

interface OpportunitiesContentProps {
  projectId: string
  opportunitiesV3: OpportunityV3ArtifactContent | null | undefined
  opportunitiesV2: OpportunitiesArtifactContent | null | undefined
  profiles: { snapshots: CompetitorSnapshot[] } | null | undefined
  strategicBets: StrategicBetsArtifactContent | null | undefined
  jtbd: JtbdArtifactContent | null | undefined
  evidenceBundle?: NormalizedEvidenceBundle | null
}

/**
 * Opportunities Content - List View
 * 
 * Displays opportunities as a filterable, scannable list.
 * Each item shows title, score, confidence, and 1-line insight.
 * Clicking an item navigates to the Opportunity Detail page.
 */
export function OpportunitiesContent({
  projectId,
  opportunitiesV3,
  opportunitiesV2,
  profiles,
  strategicBets,
  jtbd,
  evidenceBundle,
}: OpportunitiesContentProps) {
  // Prefer v3, fallback to v2
  const opportunities = opportunitiesV3?.opportunities || opportunitiesV2?.opportunities || []
  
  // Get opportunities array for linking evidence
  const opportunitiesArray = opportunities
  
  // Normalize evidence for table display
  const evidenceItems = useProjectEvidence(evidenceBundle || null, opportunitiesArray)
  
  return (
    <>
      {/* Opportunities List - Scannable, filterable list */}
      <OpportunitiesList
        opportunities={opportunities}
        projectId={projectId}
      />
      
      {/* Evidence Table in compact mode for Opportunities context */}
      {evidenceItems.length > 0 && (
        <div className="mt-6">
          <EvidenceTable items={evidenceItems} density="compact" projectId={projectId} />
        </div>
      )}
    </>
  )
}

