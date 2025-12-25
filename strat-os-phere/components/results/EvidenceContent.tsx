'use client'

import { EvidenceConfidencePanel } from '@/components/results/EvidenceConfidencePanel'
import { EvidenceCoveragePanel } from '@/components/results/EvidenceCoveragePanel'
import { EvidenceTable } from '@/components/evidence/EvidenceTable'
import { EvidenceProgressPanel } from '@/components/results/EvidenceProgressPanel'
import { EvidenceNotStartedPanel } from '@/components/results/EvidenceNotStartedPanel'
import { extractCitationsFromAllArtifacts } from '@/lib/results/evidence'
import { useProjectEvidence } from '@/lib/hooks/useProjectEvidence'
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
  
  // Get opportunities array for linking evidence
  const opportunitiesArray = opportunitiesV3?.opportunities || opportunitiesV2?.opportunities || []
  
  // Normalize evidence for table display
  const safeBundle = bundle ?? null
  const evidenceItems = useProjectEvidence(safeBundle, opportunitiesArray)
  
  // Feature flag check
  const qualityPackEnabled = isFlagEnabled('resultsQualityPackV1')

  // Determine evidence state
  const hasEvidence = evidenceItems.length > 0
  const evidenceCollectionStarted = bundle !== null && bundle !== undefined

  // Determine subhead based on state
  const subhead = hasEvidence
    ? 'Sources grounding this recommendation'
    : 'Evidence will appear here as sources are collected'

  return (
    <section className="space-y-6">
      <div className="relative">
        <Backdrop variant="section" density="subtle" className="rounded-lg" />
        <div className="relative z-10 p-6 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Decision Evidence</h1>
              <p className="text-sm text-muted-foreground">
                {subhead}
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

      {/* Three-state evidence display */}
      {hasEvidence ? (
        // State A: Evidence Available
        <EvidenceTable items={evidenceItems} density="full" projectId={projectId} />
      ) : evidenceCollectionStarted ? (
        // State B: Evidence In Progress
        <EvidenceProgressPanel projectId={projectId} />
      ) : (
        // State C: Evidence Not Started
        <EvidenceNotStartedPanel projectId={projectId} />
      )}
    </section>
  )
}

