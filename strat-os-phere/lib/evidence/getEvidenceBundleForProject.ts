/**
 * Evidence bundle accessor for project
 * Returns bundle with artifact metadata for reporting and debugging
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { readLatestEvidenceBundle } from './readBundle'
import { listArtifacts } from '@/lib/data/artifacts'
import type { NormalizedEvidenceBundle } from './types'

export interface EvidenceBundleResult {
  bundle: NormalizedEvidenceBundle | null
  artifactId?: string
  updatedAt?: string
  createdAt?: string
}

/**
 * Get the latest evidence bundle for a project with artifact metadata
 * Returns null bundle if none exists
 */
export async function getEvidenceBundleForProject(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<EvidenceBundleResult> {
  // Get all artifacts to find the latest evidence bundle artifact
  const artifacts = await listArtifacts(supabase, { projectId })
  
  // Find the latest evidence_bundle_v1 artifact
  const evidenceArtifacts = artifacts
    .filter((a) => a.type === 'evidence_bundle_v1')
    .sort((a, b) => {
      const aTime = new Date(a.created_at).getTime()
      const bTime = new Date(b.created_at).getTime()
      return bTime - aTime
    })

  if (evidenceArtifacts.length === 0) {
    return { bundle: null }
  }

  const latestArtifact = evidenceArtifacts[0]
  
  // Read the bundle (this normalizes it)
  const bundle = await readLatestEvidenceBundle(supabase, projectId)
  
  if (!bundle) {
    return { bundle: null }
  }

  return {
    bundle,
    artifactId: latestArtifact.id,
    updatedAt: latestArtifact.created_at, // Artifacts use created_at as the timestamp
    createdAt: latestArtifact.created_at,
  }
}

