/**
 * Artifact selection helper
 * 
 * Selects the best available artifact for each type, preferring:
 * - Newest by created_at
 * - Highest schema_version if available
 * - Most complete data
 */

import type { Artifact } from '@/lib/supabase/types'
import type {
  NormalizedProfilesArtifact,
  NormalizedSynthesisArtifact,
  NormalizedJtbdArtifact,
  NormalizedOpportunitiesV2Artifact,
  NormalizedOpportunitiesV3Artifact,
  NormalizedScoringMatrixArtifact,
  NormalizedStrategicBetsArtifact,
} from '@/lib/results/normalizeArtifacts'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'

export interface SelectedArtifacts {
  opportunitiesArtifact: NormalizedOpportunitiesV3Artifact | NormalizedOpportunitiesV2Artifact | null
  betsArtifact: NormalizedStrategicBetsArtifact | null
  jtbdArtifact: NormalizedJtbdArtifact | null
  scoringArtifact: NormalizedScoringMatrixArtifact | null
  profilesArtifact: NormalizedProfilesArtifact | null
  synthesisArtifact: NormalizedSynthesisArtifact | null
}

/**
 * Selects the best artifacts from a list, preferring newest and highest version
 */
export function selectArtifacts(artifacts: Artifact[]): SelectedArtifacts {
  // Group artifacts by type
  const byType = new Map<string, Artifact[]>()
  
  for (const artifact of artifacts) {
    const type = artifact.type as string
    if (!byType.has(type)) {
      byType.set(type, [])
    }
    byType.get(type)!.push(artifact)
  }
  
  // Sort each type by created_at (newest first), then by schema_version if available
  for (const [type, items] of byType.entries()) {
    items.sort((a, b) => {
      // First, sort by created_at (newest first)
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      if (dateB !== dateA) {
        return dateB - dateA
      }
      
      // If dates are equal, prefer higher schema_version
      const versionA = (a.content_json as any)?.schema_version ?? 
                       (a.content_json as any)?.meta?.schema_version ?? 0
      const versionB = (b.content_json as any)?.schema_version ?? 
                       (b.content_json as any)?.meta?.schema_version ?? 0
      return versionB - versionA
    })
  }
  
  // Normalize all artifacts
  const normalized = normalizeResultsArtifacts(artifacts)
  
  // Select best opportunity artifact (prefer v3 over v2)
  const opportunitiesArtifact = normalized.opportunitiesV3 ?? normalized.opportunitiesV2 ?? null
  
  return {
    opportunitiesArtifact,
    betsArtifact: normalized.strategicBets,
    jtbdArtifact: normalized.jtbd,
    scoringArtifact: normalized.scoringMatrix,
    profilesArtifact: normalized.profiles,
    synthesisArtifact: normalized.synthesis,
  }
}

