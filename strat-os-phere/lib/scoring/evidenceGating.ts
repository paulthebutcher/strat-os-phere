/**
 * Evidence Coverage Gating for Scoring
 * 
 * Gates numeric score display based on evidence coverage and confidence.
 * When evidence is insufficient, shows directional labels instead.
 */

export type CoverageStatus = 'complete' | 'partial' | 'insufficient'
export type ConfidenceLevel = 'high' | 'moderate' | 'low'
export type DirectionalSignal = 'strong' | 'mixed' | 'weak' | 'unclear'

/**
 * Summary of evidence citations
 */
export type EvidenceSummary = {
  totalCitations: number
  sourceTypes: string[]
  newestCitationDate?: string | null // ISO string
  oldestCitationDate?: string | null // ISO string
  evidenceWindowDays?: number | null
}

/**
 * Result of gating a score
 */
export type GatedScore = {
  coverage: CoverageStatus
  confidence: ConfidenceLevel
  showNumeric: boolean
  score: number | null
  directional: DirectionalSignal
  summary: EvidenceSummary
}

/**
 * Citation input shape - handles mixed legacy fields
 */
type CitationInput = {
  url?: string
  source_type?: string
  sourceType?: string
  date?: string
  published_at?: string
  extracted_at?: string
  extractedAt?: string
  publishedAt?: string
  timestamp?: string | number
}

/**
 * Safely parses a date from various input formats
 * Returns ISO string or null
 */
function parseDateToISO(input: unknown): string | null {
  if (!input) return null
  
  try {
    let date: Date
    
    if (input instanceof Date) {
      date = input
    } else if (typeof input === 'string') {
      date = new Date(input)
    } else if (typeof input === 'number') {
      date = new Date(input)
    } else {
      return null
    }
    
    if (isNaN(date.getTime())) {
      return null
    }
    
    return date.toISOString()
  } catch {
    return null
  }
}

/**
 * Extracts source type from citation, normalizing common variants
 */
function extractSourceType(citation: CitationInput): string {
  const raw = citation.source_type || citation.sourceType || 'other'
  const normalized = String(raw).toLowerCase().trim()
  
  // Map common variants
  if (normalized.includes('pricing') || normalized === 'pricing') return 'pricing'
  if (normalized.includes('review') || normalized === 'reviews') return 'reviews'
  if (normalized.includes('job') || normalized === 'jobs') return 'jobs'
  if (normalized.includes('changelog') || normalized === 'changelog') return 'changelog'
  if (normalized.includes('doc') || normalized === 'docs' || normalized === 'documentation') return 'docs'
  if (normalized.includes('status') || normalized === 'status') return 'status'
  if (normalized.includes('marketing') || normalized === 'marketing_site') return 'marketing_site'
  
  return normalized || 'other'
}

/**
 * Summarizes citations into EvidenceSummary
 * Handles mixed shapes (legacy fields) and missing dates safely
 */
export function summarizeCitations(
  citations: CitationInput[]
): EvidenceSummary {
  const validCitations = citations.filter(c => c.url)
  
  if (validCitations.length === 0) {
    return {
      totalCitations: 0,
      sourceTypes: [],
      newestCitationDate: null,
      oldestCitationDate: null,
      evidenceWindowDays: null,
    }
  }
  
  // Collect unique source types
  const sourceTypeSet = new Set<string>()
  for (const citation of validCitations) {
    sourceTypeSet.add(extractSourceType(citation))
  }
  const sourceTypes = Array.from(sourceTypeSet)
  
  // Extract and parse dates
  const dates: string[] = []
  for (const citation of validCitations) {
    const dateStr = 
      parseDateToISO(citation.date) ||
      parseDateToISO(citation.published_at) ||
      parseDateToISO(citation.extracted_at) ||
      parseDateToISO(citation.extractedAt) ||
      parseDateToISO(citation.publishedAt) ||
      parseDateToISO(citation.timestamp)
    
    if (dateStr) {
      dates.push(dateStr)
    }
  }
  
  // Sort dates (newest first)
  dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  
  const newestCitationDate = dates.length > 0 ? dates[0] : null
  const oldestCitationDate = dates.length > 0 ? dates[dates.length - 1] : null
  
  // Compute evidence window in days
  let evidenceWindowDays: number | null = null
  if (newestCitationDate && oldestCitationDate) {
    const newest = new Date(newestCitationDate)
    const oldest = new Date(oldestCitationDate)
    const diffMs = newest.getTime() - oldest.getTime()
    evidenceWindowDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  }
  
  return {
    totalCitations: validCitations.length,
    sourceTypes,
    newestCitationDate,
    oldestCitationDate,
    evidenceWindowDays,
  }
}

/**
 * Computes coverage status from evidence summary
 * 
 * Heuristic:
 * - insufficient: totalCitations < 2 OR sourceTypes < 2
 * - partial: totalCitations >= 2 AND sourceTypes >= 2 but < 3
 * - complete: totalCitations >= 4 AND sourceTypes >= 3
 */
export function computeCoverage(summary: EvidenceSummary): CoverageStatus {
  const { totalCitations, sourceTypes } = summary
  
  if (totalCitations < 2 || sourceTypes.length < 2) {
    return 'insufficient'
  }
  
  if (totalCitations >= 4 && sourceTypes.length >= 3) {
    return 'complete'
  }
  
  // totalCitations >= 2 AND sourceTypes >= 2 but < 3
  return 'partial'
}

/**
 * Computes confidence level from evidence summary
 * 
 * Heuristic:
 * - default: low
 * - moderate: (coverage is complete AND newestCitationDate within 120 days) OR (totalCitations >= 4 AND newestCitationDate within 120 days)
 * - high: (totalCitations >= 8 AND sourceTypes >= 4 AND newestCitationDate within 60 days)
 * 
 * Never throws on missing dates
 */
export function computeConfidence(summary: EvidenceSummary): ConfidenceLevel {
  const { totalCitations, sourceTypes, newestCitationDate } = summary
  
  // Helper to safely compute days ago
  function getDaysAgo(dateStr: string | null | undefined): number | null {
    if (!dateStr) return null
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return null
      const now = new Date()
      return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    } catch {
      return null
    }
  }
  
  const daysAgo = getDaysAgo(newestCitationDate)
  
  // High confidence: 8+ citations, 4+ types, recent (within 60 days)
  if (totalCitations >= 8 && sourceTypes.length >= 4 && daysAgo !== null && daysAgo <= 60) {
    return 'high'
  }
  
  // Moderate confidence: 
  // - complete coverage (if no dates in summary, or dates are recent within 120 days)
  // - OR (4+ citations AND recent within 120 days)
  const coverage = computeCoverage(summary)
  if (coverage === 'complete') {
    // If no date string provided in summary, allow moderate
    // If date string exists but is invalid/old, don't give moderate
    if (!newestCitationDate) {
      return 'moderate' // No dates at all - allow moderate from coverage
    }
    // Date string exists - must be valid and recent
    if (daysAgo !== null && daysAgo <= 120) {
      return 'moderate'
    }
    // Date exists but is invalid or old - don't give moderate
  }
  
  if (totalCitations >= 4 && daysAgo !== null && daysAgo <= 120) {
    return 'moderate'
  }
  
  return 'low'
}

/**
 * Determines if numeric score should be shown
 * 
 * true only when coverage === 'complete' and confidence in ['moderate', 'high']
 */
export function shouldShowNumericScore(
  coverage: CoverageStatus,
  confidence: ConfidenceLevel
): boolean {
  return coverage === 'complete' && (confidence === 'moderate' || confidence === 'high')
}

/**
 * Converts numeric score to directional signal
 * 
 * score >= 7 => strong
 * 4-6.99 => mixed
 * 1-3.99 => weak
 * null/undefined => unclear
 */
export function directionalFromScore(score?: number | null): DirectionalSignal {
  if (score === null || score === undefined) {
    return 'unclear'
  }
  
  if (score >= 7) {
    return 'strong'
  }
  
  if (score >= 4) {
    return 'mixed'
  }
  
  if (score >= 1) {
    return 'weak'
  }
  
  return 'unclear'
}

/**
 * Gates a score based on evidence coverage and confidence
 * 
 * If showNumeric is false: returns score: null but includes directional
 * from the original numeric score if present; otherwise unclear.
 */
export function gateScore(
  score: number | null | undefined,
  citations: CitationInput[]
): GatedScore {
  const summary = summarizeCitations(citations)
  const coverage = computeCoverage(summary)
  const confidence = computeConfidence(summary)
  const showNumeric = shouldShowNumericScore(coverage, confidence)
  
  // If we should show numeric, return the score
  // Otherwise, return null for score but compute directional from original score
  const gatedScore = showNumeric ? score ?? null : null
  const directional = showNumeric 
    ? directionalFromScore(score) // Still compute for potential future use
    : directionalFromScore(score) // Use original score to determine direction
  
  return {
    coverage,
    confidence,
    showNumeric,
    score: gatedScore,
    directional,
    summary,
  }
}

