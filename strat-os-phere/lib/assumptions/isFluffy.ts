/**
 * Fluff detection and filtering for assumptions.
 * 
 * Flags vague, self-referential, or tautological statements that don't
 * help decision-making because they don't specify:
 * - Who (which competitor / buyer segment)
 * - What (exact claim)
 * - Observable proof (what evidence would confirm/deny)
 * - Decision impact (what changes if wrong)
 */

/**
 * Banned phrases that indicate fluff
 */
const BANNED_PATTERNS = [
  /we have the capability/i,
  /evidence is limited/i,
  /buyer needs are evolving/i,
  /competitors are not addressing/i,
  /may require additional validation/i,
  /may require validation/i,
  /opportunity/i, // When used as a tautology (e.g., "this is an opportunity")
  /capability to execute/i,
  /evidence quality and recency support/i, // Too vague without specifics
  /market dynamics are shifting/i, // Without specifics
  /buyer needs and pain points are evolving/i,
  /competitors are not addressing this opportunity effectively/i,
]

/**
 * Source type keywords that indicate specificity
 */
const SOURCE_TYPE_KEYWORDS = [
  'reviews',
  'docs',
  'pricing page',
  'changelog',
  'status page',
  'marketing site',
  'jobs',
]

/**
 * Measurable indicators (numbers, percentages, counts, timeframes)
 */
const MEASURABLE_PATTERN = /\d+|\d+%|≥|≤|<|>|weeks?|days?|months?|years?|hours?|minutes?/

/**
 * Named entity indicators (competitor names, buyer segments)
 */
function hasNamedEntities(text: string): boolean {
  // Check for capitalized words that might be proper nouns (competitors, segments)
  // This is a heuristic - proper implementation might use NER
  const words = text.split(/\s+/)
  const capitalizedWords = words.filter(w => /^[A-Z][a-z]+/.test(w) && w.length > 3)
  return capitalizedWords.length >= 1
}

/**
 * Count meaningful nouns/verbs (basic heuristic for specificity)
 */
function countMeaningfulWords(text: string): number {
  // Remove common stop words and count remaining meaningful words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'it', 'its', 'we', 'our', 'they', 'their',
  ])
  
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2)
  return words.filter(w => !stopWords.has(w)).length
}

/**
 * Check if a statement is fluffy (vague, non-specific, non-testable)
 */
export function isFluffy(statement: string): boolean {
  const normalized = statement.trim()
  
  // Check for banned patterns
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(normalized)) {
      return true
    }
  }
  
  // Check for specificity indicators
  const hasMeasurable = MEASURABLE_PATTERN.test(normalized)
  const hasSourceType = SOURCE_TYPE_KEYWORDS.some(keyword => 
    normalized.toLowerCase().includes(keyword)
  )
  const hasEntities = hasNamedEntities(normalized)
  const meaningfulWords = countMeaningfulWords(normalized)
  
  // If it has no measurable indicators, no source types, no named entities,
  // and fewer than 5 meaningful words, it's likely fluffy
  if (!hasMeasurable && !hasSourceType && !hasEntities && meaningfulWords < 5) {
    return true
  }
  
  // Additional check: if statement is too short and generic
  if (normalized.length < 50 && meaningfulWords < 4) {
    return true
  }
  
  return false
}

/**
 * Extract entities (competitor names, buyer segments) from a statement
 */
export function extractEntities(statement: string): string[] {
  const entities: string[] = []
  
  // This is a simple heuristic - in production, you might use NER
  const words = statement.split(/\s+/)
  const capitalizedWords = words.filter(w => /^[A-Z][a-z]+/.test(w) && w.length > 3)
  
  // Filter out common words that are capitalized but not entities
  const commonWords = new Set([
    'The', 'This', 'That', 'These', 'Those', 'We', 'Our', 'They', 'Their',
    'Market', 'Buyer', 'Customer', 'Competitor', 'Competitors', 'Evidence',
    'Execution', 'Product', 'Service', 'Solution', 'Opportunity', 'Opportunities',
  ])
  
  capitalizedWords.forEach(word => {
    if (!commonWords.has(word)) {
      entities.push(word)
    }
  })
  
  return [...new Set(entities)] // Deduplicate
}

