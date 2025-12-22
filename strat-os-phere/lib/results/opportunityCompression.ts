/**
 * Opportunity Compression / Deduping
 * 
 * Groups near-duplicate opportunities into merged opportunities
 * while preserving evidence links. Deterministic and safe.
 */

export type OpportunityLike = {
  id?: string
  title?: string
  name?: string
  summary?: string
  description?: string
  whyNow?: string
  score?: number
  scoring?: any
  citations?: any[]
  [key: string]: any
}

export type CompressedOpportunity = OpportunityLike & {
  mergedFromIds: string[]
  mergedCount: number
  mergedTitles: string[]
  mergedCitations: any[]
}

/**
 * Normalizes text for comparison
 */
function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Collapse spaces
    .trim()
}

/**
 * Creates a fingerprint from an opportunity for comparison
 */
function fingerprint(o: OpportunityLike): string {
  const title = normalizeText(o.title || o.name || '')
  const summary = normalizeText(
    (o.summary || o.description || '').substring(0, 160)
  )
  return `${title} ${summary}`.trim()
}

/**
 * Computes Jaccard similarity between two strings using word tokens
 */
function similarity(a: string, b: string): number {
  if (!a || !b) return 0

  // Tokenize into words (length >= 3)
  const tokenize = (s: string): Set<string> => {
    const tokens = s
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 3)
    return new Set(tokens)
  }

  const tokensA = tokenize(a)
  const tokensB = tokenize(b)

  if (tokensA.size === 0 && tokensB.size === 0) return 1
  if (tokensA.size === 0 || tokensB.size === 0) return 0

  // Compute intersection and union
  let intersection = 0
  const union = new Set<string>()

  for (const token of tokensA) {
    union.add(token)
    if (tokensB.has(token)) {
      intersection++
    }
  }

  for (const token of tokensB) {
    union.add(token)
  }

  return intersection / union.size
}

/**
 * Deduplicates citations by URL
 */
function dedupeCitations(citations: any[]): any[] {
  const seen = new Set<string>()
  const result: any[] = []

  for (const citation of citations) {
    const url = citation?.url || citation?.citation || citation?.source_url
    if (url && typeof url === 'string' && !seen.has(url)) {
      seen.add(url)
      result.push(citation)
    }
  }

  return result
}

/**
 * Compresses opportunities by merging near-duplicates
 */
export function compressOpportunities(
  list: OpportunityLike[]
): { items: CompressedOpportunity[]; stats: { original: number; merged: number } } {
  if (!Array.isArray(list) || list.length === 0) {
    return { items: [], stats: { original: 0, merged: 0 } }
  }

  const original = list.length
  const processed = new Set<number>()
  const compressed: CompressedOpportunity[] = []

  for (let i = 0; i < list.length; i++) {
    if (processed.has(i)) continue

    const current = list[i]
    const currentFingerprint = fingerprint(current)
    const group: number[] = [i]

    // Find similar opportunities
    for (let j = i + 1; j < list.length; j++) {
      if (processed.has(j)) continue

      const other = list[j]
      const otherFingerprint = fingerprint(other)
      const sim = similarity(currentFingerprint, otherFingerprint)

      if (sim >= 0.6) {
        group.push(j)
        processed.add(j)
      }
    }

    processed.add(i)

    // Merge group into one opportunity
    const groupItems = group.map((idx) => list[idx])

    // Find highest score item as base
    let baseIdx = 0
    let maxScore = groupItems[0]?.score ?? -1

    for (let k = 1; k < groupItems.length; k++) {
      const score = groupItems[k]?.score ?? -1
      if (score > maxScore) {
        maxScore = score
        baseIdx = k
      }
    }

    const base = groupItems[baseIdx]

    // Collect all IDs
    const mergedFromIds: string[] = []
    for (const item of groupItems) {
      const id = item?.id || item?.title || item?.name
      if (id && typeof id === 'string') {
        mergedFromIds.push(id)
      }
    }

    // If no IDs found, generate indices
    if (mergedFromIds.length === 0) {
      for (let k = 0; k < group.length; k++) {
        mergedFromIds.push(`idx-${group[k]}`)
      }
    }

    // Collect all titles
    const mergedTitles: string[] = []
    for (const item of groupItems) {
      const title = item?.title || item?.name
      if (title && typeof title === 'string') {
        mergedTitles.push(title)
      }
    }

    // Collect and dedupe citations
    const allCitations: any[] = []
    for (const item of groupItems) {
      if (Array.isArray(item?.citations)) {
        allCitations.push(...item.citations)
      }
    }
    const mergedCitations = dedupeCitations(allCitations)

    // Create compressed opportunity
    const compressedOpp: CompressedOpportunity = {
      ...base,
      mergedFromIds,
      mergedCount: group.length,
      mergedTitles,
      mergedCitations,
    }

    compressed.push(compressedOpp)
  }

  const merged = original - compressed.length

  return {
    items: compressed,
    stats: { original, merged },
  }
}

