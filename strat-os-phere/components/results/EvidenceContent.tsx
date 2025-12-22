'use client'

import { EvidenceConfidencePanel } from '@/components/results/EvidenceConfidencePanel'
import { EvidenceCoveragePanel } from '@/components/results/EvidenceCoveragePanel'
import { extractCitationsFromArtifact } from '@/lib/results/evidence'
import { isFlagEnabled } from '@/lib/flags'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

interface EvidenceContentProps {
  opportunitiesV3: OpportunityV3ArtifactContent | null | undefined
  opportunitiesV2: OpportunitiesArtifactContent | null | undefined
}

export function EvidenceContent({
  opportunitiesV3,
  opportunitiesV2,
}: EvidenceContentProps) {
  // Prefer v3, fallback to v2
  const opportunities = opportunitiesV3 ?? opportunitiesV2 ?? null
  
  // Extract citations
  const citations = extractCitationsFromArtifact(opportunities)
  
  // Feature flag check
  const qualityPackEnabled = isFlagEnabled('resultsQualityPackV1')

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Evidence</h1>
        <p className="text-sm text-muted-foreground">
          Evidence and citations supporting the competitive analysis.
        </p>
      </div>

      {/* Evidence & Confidence Panel */}
      <EvidenceConfidencePanel citations={citations} />
      
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

