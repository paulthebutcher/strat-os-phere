/**
 * Bundle reader for Trust Layer v1
 * Reads and normalizes evidence bundles from artifacts
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listArtifacts } from '@/lib/data/artifacts'
import type {
  NormalizedEvidenceBundle,
  NormalizedEvidenceItem,
  NormalizedEvidenceType,
  HarvestEvidenceBundle,
  HarvestEvidenceType,
} from './types'

/**
 * Maps HarvestEvidenceType to NormalizedEvidenceType
 */
function mapHarvestTypeToNormalized(
  harvestType: HarvestEvidenceType | string
): NormalizedEvidenceType {
  const mapping: Record<string, NormalizedEvidenceType> = {
    pricing: 'pricing',
    docs: 'docs',
    reviews: 'reviews',
    jobs: 'jobs',
    changelog: 'changelog',
    status: 'changelog', // status pages are like changelogs
    official_site: 'docs', // official site is docs
    integrations: 'docs', // integrations are docs
    security_trust: 'security',
    community: 'community',
    news: 'blog',
  }
  return mapping[harvestType] ?? 'other'
}

/**
 * Generate a stable ID for an evidence item
 */
function generateItemId(url: string, type: NormalizedEvidenceType, index: number): string {
  // Use a simple hash-like approach for stable IDs
  const hash = url
    .split('')
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
  return `${type}-${Math.abs(hash)}-${index}`
}

/**
 * Normalize HarvestEvidenceBundle to NormalizedEvidenceBundle
 */
function normalizeHarvestBundle(
  bundle: HarvestEvidenceBundle,
  projectId: string,
  artifactId: string,
  createdAt: string
): NormalizedEvidenceBundle {
  const items: NormalizedEvidenceItem[] = []
  let itemIndex = 0

  for (const group of bundle.groups) {
    const normalizedType = mapHarvestTypeToNormalized(group.type)

    for (const source of group.sources) {
      items.push({
        id: generateItemId(source.url, normalizedType, itemIndex++),
        type: normalizedType,
        title: source.title ?? undefined,
        url: source.url,
        domain: source.domain,
        snippet: source.snippet ?? undefined,
        publishedAt: source.publishedDate ?? null,
        retrievedAt: bundle.meta.harvested_at ?? null,
        source: 'tavily',
      })
    }
  }

  return {
    id: artifactId,
    projectId,
    createdAt,
    company: bundle.meta.company ?? null,
    primaryUrl: bundle.meta.url ?? null,
    items,
  }
}

/**
 * Read the latest evidence bundle for a project
 * Returns null if no bundle exists
 */
export async function readLatestEvidenceBundle(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<NormalizedEvidenceBundle | null> {
  // Get all artifacts for the project
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
    return null
  }

  const latestArtifact = evidenceArtifacts[0]
  const content = latestArtifact.content_json

  if (!content) {
    return null
  }

  // Handle HarvestEvidenceBundle format (from writeEvidenceBundleArtifact)
  if (
    typeof content === 'object' &&
    content !== null &&
    'schema_version' in content &&
    'groups' in content &&
    'meta' in content
  ) {
    const harvestBundle = content as HarvestEvidenceBundle & { run_id?: string }
    return normalizeHarvestBundle(
      harvestBundle,
      projectId,
      latestArtifact.id,
      latestArtifact.created_at
    )
  }

  // If it's a different format, return null for now
  // Future: could add support for other bundle formats
  return null
}

