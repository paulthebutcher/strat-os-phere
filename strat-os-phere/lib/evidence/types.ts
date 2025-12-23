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

