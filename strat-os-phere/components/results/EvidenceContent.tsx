'use client'

import { EvidenceConfidencePanel } from '@/components/results/EvidenceConfidencePanel'
import { EvidenceCoveragePanel } from '@/components/results/EvidenceCoveragePanel'
import { extractCitationsFromAllArtifacts } from '@/lib/results/evidence'
import { isFlagEnabled } from '@/lib/flags'
import { EvidenceConfidenceIllustration, Backdrop } from '@/components/graphics'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { StrategicBetsArtifactContent } from '@/lib/schemas/strategicBet'
import type { JtbdArtifactContent } from '@/lib/schemas/jtbd'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'

interface EvidenceContentProps {
  projectId: string
  opportunitiesV3: OpportunityV3ArtifactContent | null | undefined
  opportunitiesV2: OpportunitiesArtifactContent | null | undefined
  profiles: { snapshots: CompetitorSnapshot[] } | null | undefined
  strategicBets: StrategicBetsArtifactContent | null | undefined
  jtbd: JtbdArtifactContent | null | undefined
  bundle?: NormalizedEvidenceBundle | null
}

export function EvidenceContent({
  projectId,
  opportunitiesV3,
  opportunitiesV2,
  profiles,
  strategicBets,
  jtbd,
  bundle,
}: EvidenceContentProps) {
  // Prefer v3, fallback to v2
  const opportunities = opportunitiesV3 ?? opportunitiesV2 ?? null
  
  // Extract citations from all available artifacts
  const citations = extractCitationsFromAllArtifacts(
    opportunities,
    profiles,
    strategicBets,
    jtbd
  )
  
  // Feature flag check
  const qualityPackEnabled = isFlagEnabled('resultsQualityPackV1')

  return (
    <section className="space-y-6">
      <div className="relative">
        <Backdrop variant="section" density="subtle" className="rounded-lg" />
        <div className="relative z-10 p-6 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Evidence</h1>
              <p className="text-sm text-muted-foreground">
                Evidence and citations supporting the competitive analysis.
              </p>
            </div>
            <div className="hidden md:block w-32 h-24 opacity-30">
              <EvidenceConfidenceIllustration />
            </div>
          </div>
        </div>
      </div>

      {/* Evidence & Confidence Panel */}
      <EvidenceConfidencePanel citations={citations} bundle={bundle} projectId={projectId} />
      
      {/* Evidence Coverage Panel (feature-flagged) */}
      {qualityPackEnabled && opportunities && (
        <EvidenceCoveragePanel artifact={opportunities} />
      )}

      {citations.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No evidence available yet. Evidence will appear after analysis is generated.
        </div>
      )}
    </section>
  )
}

