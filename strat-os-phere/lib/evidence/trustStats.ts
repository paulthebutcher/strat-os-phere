/**
 * Trust stats derivation for Evidence bundles
 * Computes counts, recency, and coverage metrics
 */

import type {
  NormalizedEvidenceBundle,
  NormalizedEvidenceType,
} from './types'

const ORDER: NormalizedEvidenceType[] = [
  'pricing',
  'docs',
  'reviews',
  'jobs',
  'changelog',
  'security',
  'blog',
  'community',
  'other',
]

export type EvidenceTypeStats = {
  type: NormalizedEvidenceType
  count: number
  newestAt: string | null // ISO
}

export type EvidenceTrustStats = {
  total: number
  byType: EvidenceTypeStats[]
  newestOverallAt: string | null
  daysSinceNewest: number | null
  coverage: number // number of types with >= 1 item
}

/**
 * Find the newest date among all items
 */
function newestDateISO(bundle: NormalizedEvidenceBundle): string | null {
  const dates = bundle.items
    .map((i) => i.publishedAt ?? i.retrievedAt ?? null)
    .filter(Boolean) as string[]
  if (!dates.length) return null

  // ISO string compare works if valid ISO; otherwise parse
  const parsed = dates
    .map((d) => ({ d, t: Date.parse(d) }))
    .filter((x) => !Number.isNaN(x.t))
    .sort((a, b) => b.t - a.t)

  return parsed[0]?.d ?? null
}

/**
 * Derive trust stats from an evidence bundle
 */
export function deriveEvidenceTrustStats(
  bundle: NormalizedEvidenceBundle
): EvidenceTrustStats {
  const counts = new Map<
    NormalizedEvidenceType,
    { count: number; newestAt: string | null; newestT: number }
  >()

  // Initialize all types with zero counts
  for (const t of ORDER) {
    counts.set(t, { count: 0, newestAt: null, newestT: -Infinity })
  }

  // Process each item
  for (const item of bundle.items) {
    const type = item.type ?? 'other'
    const entry = counts.get(type) ?? {
      count: 0,
      newestAt: null,
      newestT: -Infinity,
    }
    entry.count += 1

    const candidate = item.publishedAt ?? item.retrievedAt ?? null
    if (candidate) {
      const ts = Date.parse(candidate)
      if (!Number.isNaN(ts) && ts > entry.newestT) {
        entry.newestT = ts
        entry.newestAt = candidate
      }
    }
    counts.set(type, entry)
  }

  // Build byType array in order
  const byType: EvidenceTypeStats[] = ORDER.map((type) => {
    const v = counts.get(type)!
    return { type, count: v.count, newestAt: v.newestAt }
  })

  const newestOverallAt = newestDateISO(bundle)
  const daysSinceNewest = newestOverallAt
    ? Math.floor((Date.now() - Date.parse(newestOverallAt)) / (1000 * 60 * 60 * 24))
    : null

  // Coverage = number of types with >= 1 item
  const coverage = byType.filter((x) => x.count > 0).length

  return {
    total: bundle.items.length,
    byType,
    newestOverallAt,
    daysSinceNewest: Number.isFinite(daysSinceNewest as any) ? daysSinceNewest : null,
    coverage,
  }
}

