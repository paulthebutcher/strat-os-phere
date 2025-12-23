/**
 * PR3: Harvest evidence using Tavily and normalize results
 * Pipeline-isolated evidence harvesting (no DB writes, no LLM calls)
 */

import { tavilySearch } from '@/lib/tavily/client'
import { canonicalizeUrl, normalizeTavilyResults } from './normalize'
import { buildEvidencePacks } from './packs'
import type {
  HarvestEvidenceCtx,
  HarvestEvidenceBundle,
  HarvestEvidenceGroup,
  HarvestEvidenceSource,
  HarvestEvidenceType,
} from './types'

// Concurrency limit for Tavily requests
const CONCURRENCY = 3

/**
 * Simple concurrency limiter using Promise.all with batching
 */
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = []
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit)
    const batchResults = await Promise.all(batch.map((task) => task()))
    results.push(...batchResults)
  }
  return results
}

/**
 * Deduplicate sources by canonical URL
 * Prefers sources from preferredDomains when duplicates exist
 */
function deduplicateSources(
  sources: HarvestEvidenceSource[],
  preferredDomains?: string[]
): HarvestEvidenceSource[] {
  const urlMap = new Map<string, HarvestEvidenceSource>()
  const preferredDomainSet = preferredDomains
    ? new Set(preferredDomains.map((d) => d.toLowerCase()))
    : undefined

  for (const source of sources) {
    const canonical = canonicalizeUrl(source.url)
    const existing = urlMap.get(canonical)

    if (!existing) {
      urlMap.set(canonical, source)
      continue
    }

    // If we have preferred domains, prefer sources from those domains
    if (preferredDomainSet) {
      const sourceDomain = source.domain.toLowerCase()
      const existingDomain = existing.domain.toLowerCase()

      const sourceIsPreferred = preferredDomainSet.has(sourceDomain)
      const existingIsPreferred = preferredDomainSet.has(existingDomain)

      if (sourceIsPreferred && !existingIsPreferred) {
        urlMap.set(canonical, source)
      }
      // Otherwise keep existing
    }
    // If no preferred domains, keep first occurrence
  }

  return Array.from(urlMap.values())
}

/**
 * Harvest evidence for a company using Tavily
 * Returns a structured EvidenceBundle grouped by type
 */
export async function harvestEvidence(
  ctx: HarvestEvidenceCtx
): Promise<HarvestEvidenceBundle> {
  const limitPerType = ctx.limitPerType ?? 5
  const packs = buildEvidencePacks(ctx)

  // Build all query tasks
  const queryTasks: Array<{
    pack: typeof packs[0]
    query: string
    task: () => Promise<{ pack: typeof packs[0]; query: string; results: HarvestEvidenceSource[] }>
  }> = []

  for (const pack of packs) {
    for (const query of pack.queries) {
      queryTasks.push({
        pack,
        query,
        task: async () => {
          try {
            const response = await tavilySearch({
              query,
              maxResults: limitPerType * 2, // Request more to account for dedup
              searchDepth: 'basic',
            })

            // Normalize Tavily results
            const normalized = normalizeTavilyResults(response, {
              maxExcerptChars: 400,
            })

            // Convert to HarvestEvidenceSource format
            const sources: HarvestEvidenceSource[] = normalized.map((n) => ({
              title: n.title,
              url: n.url,
              domain: n.domain,
              publishedDate: n.publishedDate || null,
              snippet: n.excerpt || undefined,
              sourceType: 'tavily',
            }))

            return {
              pack,
              query,
              results: sources,
            }
          } catch (error) {
            // Log error but continue with other queries
            console.warn(`[harvestEvidence] Query failed: ${query}`, error)
            return {
              pack,
              query,
              results: [],
            }
          }
        },
      })
    }
  }

  // Execute queries with concurrency limit
  const queryResults = await runWithConcurrency(
    queryTasks.map((t) => t.task),
    CONCURRENCY
  )

  // Group results by pack type and deduplicate
  const groupsByType = new Map<
    HarvestEvidenceType,
    {
      group: HarvestEvidenceGroup
      preferredDomains?: string[]
    }
  >()

  for (const { pack, query, results } of queryResults) {
    let groupData = groupsByType.get(pack.type)

    if (!groupData) {
      const group: HarvestEvidenceGroup = {
        type: pack.type,
        queries: [],
        sources: [],
        stats: {
          requested: 0,
          returned: 0,
          kept: 0,
          deduped: 0,
          uniqueDomains: 0,
        },
      }
      groupData = {
        group,
        preferredDomains: pack.preferredDomains,
      }
      groupsByType.set(pack.type, groupData)
    }

    // Track queries
    if (!groupData.group.queries.includes(query)) {
      groupData.group.queries.push(query)
    }

    // Add results (will deduplicate later)
    groupData.group.sources.push(...results)
    groupData.group.stats.requested += 1
    groupData.group.stats.returned += results.length
  }

  // Deduplicate and limit per group
  const finalGroups: HarvestEvidenceGroup[] = []

  for (const { group, preferredDomains } of groupsByType.values()) {
    // Deduplicate
    const beforeDedup = group.sources.length
    const deduped = deduplicateSources(group.sources, preferredDomains)
    const afterDedup = deduped.length
    group.stats.deduped = beforeDedup - afterDedup

    // Limit to limitPerType
    const limited = deduped.slice(0, limitPerType)
    group.stats.kept = limited.length

    // Count unique domains
    const uniqueDomains = new Set(limited.map((s) => s.domain.toLowerCase()))
    group.stats.uniqueDomains = uniqueDomains.size

    group.sources = limited
    finalGroups.push(group)
  }

  // Calculate totals
  const allSources = finalGroups.flatMap((g) => g.sources)
  const uniqueUrls = new Set(allSources.map((s) => canonicalizeUrl(s.url)))
  const uniqueDomains = new Set(allSources.map((s) => s.domain.toLowerCase()))

  const byType: Record<HarvestEvidenceType, number> = {} as Record<
    HarvestEvidenceType,
    number
  >
  for (const group of finalGroups) {
    byType[group.type] = group.sources.length
  }

  // Fill in missing types with 0
  const allTypes: HarvestEvidenceType[] = [
    'official_site',
    'pricing',
    'docs',
    'changelog',
    'status',
    'reviews',
    'jobs',
    'integrations',
    'security_trust',
    'community',
  ]
  for (const type of allTypes) {
    if (!(type in byType)) {
      byType[type] = 0
    }
  }

  const bundle: HarvestEvidenceBundle = {
    schema_version: 1,
    meta: {
      company: ctx.company,
      url: ctx.url,
      context: ctx.context,
      harvested_at: new Date().toISOString(),
      limitPerType,
    },
    groups: finalGroups,
    totals: {
      sources: allSources.length,
      uniqueUrls: uniqueUrls.size,
      uniqueDomains: uniqueDomains.size,
      byType,
    },
  }

  return bundle
}

