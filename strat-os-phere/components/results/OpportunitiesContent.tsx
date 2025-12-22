'use client'

import { extractCitationsFromAllArtifacts } from '@/lib/results/evidence'
import { ResultsPresenter } from '@/components/results/ResultsPresenter'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { StrategicBetsArtifactContent } from '@/lib/schemas/strategicBet'
import type { JtbdArtifactContent } from '@/lib/schemas/jtbd'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'

interface OpportunitiesContentProps {
  projectId: string
  opportunitiesV3: OpportunityV3ArtifactContent | null | undefined
  opportunitiesV2: OpportunitiesArtifactContent | null | undefined
  profiles: { snapshots: CompetitorSnapshot[] } | null | undefined
  strategicBets: StrategicBetsArtifactContent | null | undefined
  jtbd: JtbdArtifactContent | null | undefined
}

export function OpportunitiesContent({
  projectId,
  opportunitiesV3,
  opportunitiesV2,
  profiles,
  strategicBets,
  jtbd,
}: OpportunitiesContentProps) {
  // Prefer v3, fallback to v2
  const opportunities = opportunitiesV3 ?? opportunitiesV2 ?? null
  const isV3 = Boolean(opportunitiesV3)
  
  // Extract citations from all available artifacts
  const citations = extractCitationsFromAllArtifacts(
    opportunities,
    profiles,
    strategicBets,
    jtbd
  )
  
  // Build header from available metadata
  const header = {
    title: 'Opportunities',
    subtitle: 'Strategic opportunities ranked by score with actionable experiments and proof points.',
    generatedAtISO: opportunitiesV3?.meta?.generated_at || opportunitiesV2?.meta?.generated_at || undefined,
    competitorCount: profiles?.snapshots?.length || undefined,
  }
  
  // Build opportunities array for presenter (empty array, presenter will use raw artifacts)
  const presenterOpportunities: Array<{
    id: string
    title: string
    score: number
  }> = []
  
  // Use ResultsPresenter - it will handle V3/V2 rendering internally
  return (
    <ResultsPresenter
      mode="project"
      projectId={projectId}
      header={header}
      opportunities={presenterOpportunities}
      citations={citations}
      opportunitiesV3={opportunitiesV3 || undefined}
      opportunitiesV2={opportunitiesV2 || undefined}
      profiles={profiles || undefined}
      strategicBets={strategicBets || undefined}
      jtbd={jtbd || undefined}
    />
  )
}

