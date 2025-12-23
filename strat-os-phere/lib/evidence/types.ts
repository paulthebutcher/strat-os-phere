/**
 * Evidence bundle types
 * Defines the structure for storing and retrieving evidence bundles
 */

export type EvidenceType =
  | 'pricing'
  | 'reviews'
  | 'docs'
  | 'changelog'
  | 'jobs'
  | 'status'
  | 'security'
  | 'integrations'
  | 'comparisons'
  | 'community'
  | 'news'

export type EvidenceSource = {
  type: EvidenceType
  title: string
  url: string
  domain: string
  excerpt: string
  score: number
  retrievedAt: string
  publishedAt?: string
  confidence: 'low' | 'med' | 'high'
}

export type EvidenceBundle = {
  schemaVersion: 1
  projectId: string
  competitorId?: string
  queryContext: {
    companyName?: string
    primaryUrl?: string
    market?: string
    product?: string
    targetCustomer?: string
  }
  sourcesByType: Record<EvidenceType, EvidenceSource[]>
  stats: {
    totalSources: number
    byType: Record<EvidenceType, number>
    newestDate?: string
    oldestDate?: string
  }
}

/**
 * PR3: Harvest-specific evidence types
 * Used for evidence harvesting via Tavily (pipeline-isolated)
 */

export type HarvestEvidenceType =
  | 'official_site'
  | 'pricing'
  | 'docs'
  | 'changelog'
  | 'status'
  | 'reviews'
  | 'jobs'
  | 'integrations'
  | 'security_trust'
  | 'community'

export type HarvestEvidenceCtx = {
  company: string
  url?: string // optional primary domain
  context?: string // optional user context / decision
  limitPerType?: number // default 5
  includeTypes?: HarvestEvidenceType[] // optional filter
}

export type HarvestEvidenceSource = {
  title?: string
  url: string
  domain: string
  publishedDate?: string | null
  snippet?: string
  sourceType?: string // raw tavily type if present
}

export type HarvestEvidenceGroup = {
  type: HarvestEvidenceType
  queries: string[]
  sources: HarvestEvidenceSource[]
  stats: {
    requested: number
    returned: number
    kept: number
    deduped: number
    uniqueDomains: number
  }
}

export type HarvestEvidenceBundle = {
  schema_version: 1
  meta: {
    company: string
    url?: string
    context?: string
    harvested_at: string // ISO
    limitPerType: number
  }
  groups: HarvestEvidenceGroup[]
  totals: {
    sources: number
    uniqueUrls: number
    uniqueDomains: number
    byType: Record<HarvestEvidenceType, number>
  }
}

/**
 * PR5: Normalized evidence types for Trust Layer
 * Simplified structure for UI consumption
 */

export type NormalizedEvidenceType =
  | 'pricing'
  | 'docs'
  | 'reviews'
  | 'jobs'
  | 'changelog'
  | 'blog'
  | 'community'
  | 'security'
  | 'other'

export type NormalizedEvidenceItem = {
  id: string
  type: NormalizedEvidenceType
  title?: string
  url: string
  domain?: string
  snippet?: string
  publishedAt?: string | null // ISO
  retrievedAt?: string | null // ISO
  scoreHint?: number | null
  source?: string | null
}

export type NormalizedEvidenceBundle = {
  id: string
  projectId: string
  createdAt: string // ISO
  company?: string | null
  primaryUrl?: string | null
  items: NormalizedEvidenceItem[]
}

