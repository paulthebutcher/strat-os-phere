/**
 * Evidence Ledger normalization
 * Maps NormalizedEvidenceBundle to UI-friendly EvidenceLedgerModel
 */

import type { NormalizedEvidenceBundle, NormalizedEvidenceItem, NormalizedEvidenceType } from './types'

export type EvidenceType =
  | "Pricing"
  | "Docs"
  | "Changelog"
  | "Reviews"
  | "Security"
  | "Integrations"
  | "Support"
  | "Community"
  | "Other"

export type EvidenceItem = {
  id: string // stable (hash url+title or existing id)
  type: EvidenceType
  competitorName?: string // if available
  title: string
  domain: string
  url: string
  snippet?: string // use stored excerpt/snippet only
  date?: string // if stored
}

export type EvidenceLedgerModel = {
  totals: {
    items: number
    byType: Record<EvidenceType, number>
  }
  coverage: {
    found: EvidenceType[]
    missing: EvidenceType[]
  }
  groups: Array<{
    type: EvidenceType
    items: EvidenceItem[]
  }>
}

/**
 * Maps NormalizedEvidenceType to EvidenceType
 */
function mapNormalizedTypeToLedgerType(
  normalizedType: NormalizedEvidenceType
): EvidenceType {
  const mapping: Record<NormalizedEvidenceType, EvidenceType> = {
    pricing: "Pricing",
    docs: "Docs",
    changelog: "Changelog",
    reviews: "Reviews",
    security: "Security",
    community: "Community",
    blog: "Support", // blog posts are support-related
    jobs: "Support", // job postings are support-related
    other: "Other",
  }
  return mapping[normalizedType] ?? "Other"
}

/**
 * Generate a stable ID for an evidence item
 * Uses existing id if available, otherwise creates a hash
 */
function generateStableId(
  item: NormalizedEvidenceItem,
  index: number
): string {
  if (item.id) {
    return item.id
  }
  // Simple deterministic hash of url + title + type
  const str = `${item.url}|${item.title || ""}|${item.type}`
  const hash = str
    .split("")
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
  return `${item.type}-${Math.abs(hash)}-${index}`
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, "")
  } catch {
    // Fallback: try to extract domain manually
    const match = url.match(/https?:\/\/([^\/]+)/)
    return match ? match[1].replace(/^www\./, "") : url
  }
}

/**
 * Convert NormalizedEvidenceItem to EvidenceItem
 */
function normalizeItem(
  item: NormalizedEvidenceItem,
  index: number,
  competitorName?: string | null
): EvidenceItem {
  const ledgerType = mapNormalizedTypeToLedgerType(item.type)
  const domain = item.domain || extractDomain(item.url)
  const title = item.title || domain || "Untitled"

  return {
    id: generateStableId(item, index),
    type: ledgerType,
    competitorName: competitorName || undefined,
    title,
    domain,
    url: item.url,
    snippet: item.snippet || undefined,
    date: item.publishedAt || item.retrievedAt || undefined,
  }
}

/**
 * All possible evidence types (deterministic list)
 */
const ALL_EVIDENCE_TYPES: EvidenceType[] = [
  "Pricing",
  "Docs",
  "Changelog",
  "Reviews",
  "Security",
  "Integrations",
  "Support",
  "Community",
  "Other",
]

/**
 * Normalize evidence bundle to ledger model
 */
export function normalizeEvidenceBundleToLedger(
  bundle: NormalizedEvidenceBundle | null
): EvidenceLedgerModel | null {
  if (!bundle || !bundle.items || bundle.items.length === 0) {
    return null
  }

  // Convert items to ledger format
  const items: EvidenceItem[] = bundle.items.map((item, index) =>
    normalizeItem(item, index, bundle.company)
  )

  // Group by type
  const itemsByType = new Map<EvidenceType, EvidenceItem[]>()
  for (const item of items) {
    const existing = itemsByType.get(item.type) || []
    existing.push(item)
    itemsByType.set(item.type, existing)
  }

  // Build groups array (sorted by type order)
  const groups: Array<{ type: EvidenceType; items: EvidenceItem[] }> = []
  for (const type of ALL_EVIDENCE_TYPES) {
    const typeItems = itemsByType.get(type) || []
    if (typeItems.length > 0) {
      groups.push({ type, items: typeItems })
    }
  }

  // Calculate totals
  const byType: Record<EvidenceType, number> = {} as Record<
    EvidenceType,
    number
  >
  for (const type of ALL_EVIDENCE_TYPES) {
    byType[type] = itemsByType.get(type)?.length || 0
  }

  // Calculate coverage
  const found: EvidenceType[] = []
  const missing: EvidenceType[] = []
  for (const type of ALL_EVIDENCE_TYPES) {
    if (byType[type] > 0) {
      found.push(type)
    } else {
      missing.push(type)
    }
  }

  return {
    totals: {
      items: items.length,
      byType,
    },
    coverage: {
      found,
      missing,
    },
    groups,
  }
}

