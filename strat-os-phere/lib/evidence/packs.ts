/**
 * PR3: Evidence packs - curated query templates per EvidenceType
 * Generates deterministic query plans for Tavily searches
 */

import type { HarvestEvidenceType, HarvestEvidenceCtx } from './types'

export const EVIDENCE_TYPES: readonly HarvestEvidenceType[] = [
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
] as const

export type EvidencePack = {
  type: HarvestEvidenceType
  // query templates already resolved to strings
  queries: string[]
  // optional domain hints used later for scoring/selection (no enforcement)
  preferredDomains?: string[]
}

/**
 * Extract domain from URL (simple extraction, no validation)
 */
function extractDomainFromUrl(url?: string): string | undefined {
  if (!url) return undefined
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    // Fallback: basic regex extraction
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/i)
    return match?.[1]?.replace(/^www\./, '')
  }
}

/**
 * Build queries for a specific evidence type
 */
export function buildQueriesForType(
  type: HarvestEvidenceType,
  ctx: HarvestEvidenceCtx
): string[] {
  const { company, url } = ctx
  const domain = extractDomainFromUrl(url)
  const queries: string[] = []

  switch (type) {
    case 'official_site':
      queries.push(`${company} official site`)
      queries.push(`${company} product features`)
      if (domain) {
        queries.push(`site:${domain} product`)
        queries.push(`site:${domain} about`)
      }
      break

    case 'pricing':
      queries.push(`${company} pricing`)
      queries.push(`${company} plans pricing tiers`)
      if (domain) {
        queries.push(`site:${domain} pricing`)
        queries.push(`site:${domain} plans`)
      }
      break

    case 'docs':
      queries.push(`${company} documentation`)
      queries.push(`${company} API documentation`)
      if (domain) {
        queries.push(`site:${domain} docs`)
        queries.push(`site:${domain} documentation`)
      }
      break

    case 'changelog':
      queries.push(`${company} changelog`)
      queries.push(`${company} release notes`)
      if (domain) {
        queries.push(`site:${domain} changelog OR releases OR updates`)
        queries.push(`site:${domain} what's new`)
      }
      break

    case 'status':
      queries.push(`${company} status page`)
      queries.push(`${company} system status`)
      if (domain) {
        queries.push(`site:status.${domain}`)
        queries.push(`site:${domain} status`)
      }
      // Also try common status page patterns
      queries.push(`status.${company} status page`)
      break

    case 'reviews':
      queries.push(`${company} reviews G2`)
      queries.push(`${company} reviews Capterra`)
      queries.push(`${company} reviews TrustRadius`)
      break

    case 'jobs':
      queries.push(`site:boards.greenhouse.io "${company}"`)
      queries.push(`site:lever.co "${company}"`)
      queries.push(`${company} hiring engineering`)
      break

    case 'integrations':
      queries.push(`${company} integrations`)
      queries.push(`${company} integrations Zapier`)
      if (domain) {
        queries.push(`site:${domain} integrations`)
        queries.push(`site:${domain} apps integrations`)
      }
      break

    case 'security_trust':
      queries.push(`${company} SOC 2`)
      queries.push(`${company} security`)
      queries.push(`${company} compliance`)
      if (domain) {
        queries.push(`site:${domain} security OR trust OR compliance`)
        queries.push(`site:${domain} security policy`)
      }
      break

    case 'community':
      queries.push(`${company} community`)
      queries.push(`${company} forum`)
      // Keep reddit optional (less reliable)
      queries.push(`${company} reddit experiences`)
      break
  }

  return queries
}

/**
 * Build evidence packs for the given context
 * Returns packs for all types (or filtered by includeTypes)
 */
export function buildEvidencePacks(ctx: HarvestEvidenceCtx): EvidencePack[] {
  const typesToInclude =
    ctx.includeTypes && ctx.includeTypes.length > 0
      ? ctx.includeTypes
      : EVIDENCE_TYPES

  const domain = extractDomainFromUrl(ctx.url)

  return typesToInclude.map((type) => {
    const queries = buildQueriesForType(type, ctx)
    const preferredDomains = domain ? [domain] : undefined

    return {
      type,
      queries,
      preferredDomains,
    }
  })
}

