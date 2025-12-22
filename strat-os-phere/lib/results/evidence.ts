/**
 * Evidence normalization and confidence scoring utilities
 * 
 * Safely extracts citations from artifacts and computes confidence metrics
 * without requiring schema changes or breaking on missing data.
 */

export type NormalizedCitation = {
  url: string
  sourceType: string
  date?: Date
}

/**
 * Normalizes source type strings to canonical values
 */
export function normalizeSourceType(input: string | undefined): string {
  if (!input) return 'other'
  
  const normalized = input.toLowerCase().trim()
  
  // Map common variants to canonical types
  if (normalized.includes('pricing') || normalized === 'pricing') {
    return 'pricing'
  }
  if (normalized.includes('review') || normalized === 'reviews') {
    return 'reviews'
  }
  if (normalized.includes('job') || normalized === 'jobs') {
    return 'jobs'
  }
  if (normalized.includes('changelog') || normalized === 'changelog') {
    return 'changelog'
  }
  if (normalized.includes('doc') || normalized === 'docs' || normalized === 'documentation') {
    return 'docs'
  }
  if (normalized.includes('status') || normalized === 'status') {
    return 'status'
  }
  if (normalized.includes('marketing') || normalized === 'marketing_site') {
    return 'marketing_site'
  }
  
  return 'other'
}

/**
 * Safely parses a date from various input formats
 * Returns undefined if parsing fails
 */
export function parseDate(input: unknown): Date | undefined {
  if (!input) return undefined
  
  try {
    // Handle Date objects
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? undefined : input
    }
    
    // Handle string inputs
    if (typeof input === 'string') {
      const parsed = new Date(input)
      return isNaN(parsed.getTime()) ? undefined : parsed
    }
    
    // Handle number inputs (timestamp)
    if (typeof input === 'number') {
      const parsed = new Date(input)
      return isNaN(parsed.getTime()) ? undefined : parsed
    }
    
    return undefined
  } catch {
    return undefined
  }
}

/**
 * Safely extracts a citation from an unknown object
 */
function extractCitation(obj: unknown): NormalizedCitation | null {
  if (!obj || typeof obj !== 'object') return null
  
  const record = obj as Record<string, unknown>
  
  // Extract URL (required)
  const url = record.url || record.citation || record.source_url
  if (!url || typeof url !== 'string') return null
  
  // Extract source type
  const sourceTypeRaw = record.source_type || record.sourceType || record.type || ''
  const sourceType = normalizeSourceType(String(sourceTypeRaw))
  
  // Extract date from various possible fields
  const dateRaw = 
    record.date || 
    record.published_at || 
    record.extracted_at || 
    record.extractedAt ||
    record.publishedAt ||
    record.timestamp
  const date = parseDate(dateRaw)
  
  return {
    url,
    sourceType,
    date,
  }
}

/**
 * Safely extracts citations from an artifact
 * 
 * Looks for citations in multiple locations:
 * - Top-level citations array
 * - Opportunities array with nested citations
 * - Proof points with citations
 * - Scoring explainability citations
 */
export function extractCitationsFromArtifact(artifactContent: unknown): NormalizedCitation[] {
  if (!artifactContent || typeof artifactContent !== 'object') {
    return []
  }
  
  const citations: NormalizedCitation[] = []
  const seenUrls = new Set<string>()
  
  try {
    const record = artifactContent as Record<string, unknown>
    
    // Check top-level citations
    if (Array.isArray(record.citations)) {
      for (const citation of record.citations) {
        const normalized = extractCitation(citation)
        if (normalized && !seenUrls.has(normalized.url)) {
          citations.push(normalized)
          seenUrls.add(normalized.url)
        }
      }
    }
    
    // Check meta.citations
    if (record.meta && typeof record.meta === 'object') {
      const meta = record.meta as Record<string, unknown>
      if (Array.isArray(meta.citations)) {
        for (const citation of meta.citations) {
          const normalized = extractCitation(citation)
          if (normalized && !seenUrls.has(normalized.url)) {
            citations.push(normalized)
            seenUrls.add(normalized.url)
          }
        }
      }
    }
    
    // Check opportunities array
    if (Array.isArray(record.opportunities)) {
      for (const opportunity of record.opportunities) {
        if (!opportunity || typeof opportunity !== 'object') continue
        
        const opp = opportunity as Record<string, unknown>
        
        // Check opportunity.citations
        if (Array.isArray(opp.citations)) {
          for (const citation of opp.citations) {
            const normalized = extractCitation(citation)
            if (normalized && !seenUrls.has(normalized.url)) {
              citations.push(normalized)
              seenUrls.add(normalized.url)
            }
          }
        }
        
        // Check opportunity.evidence_citations
        if (Array.isArray(opp.evidence_citations)) {
          for (const citation of opp.evidence_citations) {
            const normalized = extractCitation(citation)
            if (normalized && !seenUrls.has(normalized.url)) {
              citations.push(normalized)
              seenUrls.add(normalized.url)
            }
          }
        }
        
        // Check opportunity.evidence.citations
        if (opp.evidence && typeof opp.evidence === 'object') {
          const evidence = opp.evidence as Record<string, unknown>
          if (Array.isArray(evidence.citations)) {
            for (const citation of evidence.citations) {
              const normalized = extractCitation(citation)
              if (normalized && !seenUrls.has(normalized.url)) {
                citations.push(normalized)
                seenUrls.add(normalized.url)
              }
            }
          }
        }
        
        // Check proof_points[].citations
        if (Array.isArray(opp.proof_points)) {
          for (const proofPoint of opp.proof_points) {
            if (!proofPoint || typeof proofPoint !== 'object') continue
            const proof = proofPoint as Record<string, unknown>
            if (Array.isArray(proof.citations)) {
              for (const citation of proof.citations) {
                const normalized = extractCitation(citation)
                if (normalized && !seenUrls.has(normalized.url)) {
                  citations.push(normalized)
                  seenUrls.add(normalized.url)
                }
              }
            }
          }
        }
        
        // Check scoring.explainability[].citations
        if (opp.scoring && typeof opp.scoring === 'object') {
          const scoring = opp.scoring as Record<string, unknown>
          if (Array.isArray(scoring.explainability)) {
            for (const explain of scoring.explainability) {
              if (!explain || typeof explain !== 'object') continue
              const explainObj = explain as Record<string, unknown>
              if (Array.isArray(explainObj.citations)) {
                for (const citation of explainObj.citations) {
                  const normalized = extractCitation(citation)
                  if (normalized && !seenUrls.has(normalized.url)) {
                    citations.push(normalized)
                    seenUrls.add(normalized.url)
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    // Silently fail - return what we've collected so far
    console.warn('Error extracting citations:', error)
  }
  
  return citations
}

export type EvidenceSummary = {
  total: number
  byType: Record<string, number>
  mostRecent?: Date
  oldest?: Date
  medianAgeDays?: number
  recencyLabel: string
  confidence: 'high' | 'medium' | 'low'
  confidenceRationale: string
}

/**
 * Computes evidence summary and confidence score
 */
export function summarizeEvidence(
  citations: NormalizedCitation[],
  now: Date = new Date()
): EvidenceSummary {
  const total = citations.length
  
  // Count by type
  const byType: Record<string, number> = {}
  for (const citation of citations) {
    byType[citation.sourceType] = (byType[citation.sourceType] || 0) + 1
  }
  
  // Extract dates
  const dates = citations
    .map((c) => c.date)
    .filter((d): d is Date => d !== undefined)
    .sort((a, b) => b.getTime() - a.getTime()) // Most recent first
  
  const mostRecent = dates[0]
  const oldest = dates[dates.length - 1]
  
  // Compute median age
  let medianAgeDays: number | undefined
  if (dates.length > 0) {
    const sortedAges = dates.map((d) => {
      const diffMs = now.getTime() - d.getTime()
      return Math.floor(diffMs / (1000 * 60 * 60 * 24))
    })
    sortedAges.sort((a, b) => a - b)
    const mid = Math.floor(sortedAges.length / 2)
    medianAgeDays =
      sortedAges.length % 2 === 0
        ? (sortedAges[mid - 1] + sortedAges[mid]) / 2
        : sortedAges[mid]
  }
  
  // Generate recency label
  let recencyLabel: string
  if (mostRecent) {
    const ageDays = Math.floor((now.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24))
    recencyLabel = `Most evidence from last ${ageDays} days`
  } else {
    recencyLabel = 'Evidence dates unavailable'
  }
  
  // Compute confidence score (0-6 points)
  let points = 0
  
  // Coverage score: number of distinct types with count >= 1
  const distinctTypes = Object.keys(byType).length
  if (distinctTypes >= 4) {
    points += 2
  } else if (distinctTypes >= 2) {
    points += 1
  }
  
  // Recency score: based on mostRecent age
  if (mostRecent) {
    const ageDays = Math.floor((now.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24))
    if (ageDays <= 30) {
      points += 2
    } else if (ageDays <= 90) {
      points += 1
    }
  }
  
  // Volume score: based on total citations
  if (total >= 25) {
    points += 2
  } else if (total >= 10) {
    points += 1
  }
  
  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low'
  let confidenceRationale: string
  
  if (points >= 5) {
    confidence = 'high'
    confidenceRationale = `Strong coverage across ${distinctTypes} source type${distinctTypes !== 1 ? 's' : ''} with recent evidence.`
  } else if (points >= 3) {
    confidence = 'medium'
    confidenceRationale = 'Some coverage, but evidence is limited or not very recent.'
  } else {
    confidence = 'low'
    confidenceRationale = 'Limited evidence coverage or recency; treat as directional.'
  }
  
  return {
    total,
    byType,
    mostRecent,
    oldest,
    medianAgeDays,
    recencyLabel,
    confidence,
    confidenceRationale,
  }
}

