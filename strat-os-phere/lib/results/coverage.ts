/**
 * Evidence Coverage Calculator
 * 
 * Computes coverage metrics from artifact content without requiring
 * strict schema validation. Defensive and tolerant of unknown shapes.
 */

export type SourceType = string

export type EvidenceCoverage = {
  totalCitations: number
  sourceTypes: { type: SourceType; count: number }[]
  mostRecentDate?: string // ISO date string
  oldestDate?: string // ISO date string
  recencyLabel: 'Today' | 'Last 7 days' | 'Last 30 days' | '90+ days' | 'Unknown'
  coverageScore: number // 0-100
  coverageNotes: string[] // Human-readable notes
}

/**
 * Recursively searches for citation arrays in an object
 */
function findCitationArrays(obj: unknown, found: Array<unknown>[] = []): Array<unknown>[] {
  if (!obj || typeof obj !== 'object') {
    return found
  }

  const record = obj as Record<string, unknown>

  // Check common citation array keys
  const citationKeys = ['citations', 'evidence_citations', 'sources', 'references']
  for (const key of citationKeys) {
    if (Array.isArray(record[key])) {
      found.push(record[key])
    }
  }

  // Recursively search nested objects and arrays
  for (const value of Object.values(record)) {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (const item of value) {
          findCitationArrays(item, found)
        }
      } else {
        findCitationArrays(value, found)
      }
    }
  }

  return found
}

/**
 * Extracts citation-like objects from arrays
 */
function extractCitations(arrays: Array<unknown>[]): Array<{
  sourceType?: string
  date?: string
}> {
  const citations: Array<{ sourceType?: string; date?: string }> = []

  for (const array of arrays) {
    for (const item of array) {
      if (!item || typeof item !== 'object') continue

      const record = item as Record<string, unknown>
      const citation: { sourceType?: string; date?: string } = {}

      // Extract source type
      const sourceTypeRaw =
        record.source_type ||
        record.sourceType ||
        record.type ||
        ''
      if (sourceTypeRaw && typeof sourceTypeRaw === 'string') {
        citation.sourceType = sourceTypeRaw
      }

      // Extract date
      const dateRaw =
        record.date ||
        record.published_at ||
        record.captured_at ||
        record.extracted_at ||
        record.extractedAt ||
        record.publishedAt ||
        record.timestamp

      if (dateRaw) {
        try {
          const date = new Date(String(dateRaw))
          if (!isNaN(date.getTime())) {
            citation.date = date.toISOString()
          }
        } catch {
          // Ignore invalid dates
        }
      }

      citations.push(citation)
    }
  }

  return citations
}

/**
 * Computes evidence coverage from artifact content
 */
export function computeEvidenceCoverage(input: unknown): EvidenceCoverage {
  // Find all citation arrays recursively
  const citationArrays = findCitationArrays(input)
  const rawCitations = extractCitations(citationArrays)

  const totalCitations = rawCitations.length

  // Aggregate source types
  const sourceTypeCounts: Record<string, number> = {}
  for (const citation of rawCitations) {
    if (citation.sourceType) {
      const type = String(citation.sourceType).toLowerCase().trim()
      sourceTypeCounts[type] = (sourceTypeCounts[type] || 0) + 1
    }
  }

  const sourceTypes = Object.entries(sourceTypeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  // Extract and parse dates
  const dates = rawCitations
    .map((c) => c.date)
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  const mostRecentDate = dates.length > 0 ? dates[dates.length - 1].toISOString() : undefined
  const oldestDate = dates.length > 0 ? dates[0].toISOString() : undefined

  // Compute recency label
  let recencyLabel: EvidenceCoverage['recencyLabel'] = 'Unknown'
  if (dates.length > 0) {
    const mostRecent = dates[dates.length - 1]
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === 0) {
      recencyLabel = 'Today'
    } else if (daysDiff <= 7) {
      recencyLabel = 'Last 7 days'
    } else if (daysDiff <= 30) {
      recencyLabel = 'Last 30 days'
    } else {
      recencyLabel = '90+ days'
    }
  }

  // Compute coverage score (0-100)
  let score = 0

  // Citation count score (max 30 points)
  if (totalCitations >= 10) {
    score += 30
  } else if (totalCitations >= 5) {
    score += 20
  } else if (totalCitations >= 1) {
    score += 10
  }

  // Source type diversity score (max 30 points)
  const distinctTypes = sourceTypes.length
  if (distinctTypes >= 3) {
    score += 30
  } else if (distinctTypes >= 2) {
    score += 20
  } else if (distinctTypes >= 1) {
    score += 10
  }

  // Recency score (max 40 points)
  if (recencyLabel === 'Today' || recencyLabel === 'Last 7 days' || recencyLabel === 'Last 30 days') {
    score += 40
  } else if (recencyLabel === '90+ days') {
    score += 10
  }

  // Cap at 100
  const coverageScore = Math.min(100, score)

  // Generate coverage notes
  const coverageNotes: string[] = []

  if (totalCitations === 0) {
    coverageNotes.push('No citations found yet — results are directional.')
  } else if (totalCitations < 5) {
    coverageNotes.push(`Only ${totalCitations} citation${totalCitations !== 1 ? 's' : ''} found — consider adding more evidence.`)
  }

  if (distinctTypes === 1) {
    coverageNotes.push('Only 1 source type detected — diversify evidence for stronger defensibility.')
  } else if (distinctTypes === 0 && totalCitations > 0) {
    coverageNotes.push('Source types not detected — evidence may lack metadata.')
  }

  if (recencyLabel === '90+ days') {
    coverageNotes.push('Most evidence is older than 90 days.')
  } else if (recencyLabel === 'Unknown' && totalCitations > 0) {
    coverageNotes.push('Evidence dates unavailable — recency cannot be determined.')
  }

  return {
    totalCitations,
    sourceTypes,
    mostRecentDate,
    oldestDate,
    recencyLabel,
    coverageScore,
    coverageNotes,
  }
}

