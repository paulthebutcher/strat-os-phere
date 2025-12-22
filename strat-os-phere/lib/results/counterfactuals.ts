/**
 * Counterfactual Testing
 * 
 * Generates "Why this might be wrong" insights for opportunities
 * using simple heuristics (no LLM calls).
 */

export type Counterfactual = {
  risk: string
  whatWouldChangeMyMind: string
}

/**
 * Counts distinct source types from citations
 */
function countSourceTypes(citations: any[]): number {
  if (!Array.isArray(citations) || citations.length === 0) {
    return 0
  }

  const types = new Set<string>()
  for (const citation of citations) {
    const type =
      citation?.source_type ||
      citation?.sourceType ||
      citation?.type ||
      ''
    if (type && typeof type === 'string') {
      types.add(String(type).toLowerCase().trim())
    }
  }

  return types.size
}

/**
 * Generates a counterfactual for an opportunity
 */
export function generateCounterfactual(o: {
  title?: string
  score?: number
  citations?: any[]
  scoring?: any
}): Counterfactual {
  const citations = Array.isArray(o.citations) ? o.citations : []
  const citationCount = citations.length
  const sourceTypeCount = countSourceTypes(citations)
  const score = typeof o.score === 'number' ? o.score : 0

  // Heuristic 1: Missing/low citations
  if (citationCount === 0 || citationCount < 3) {
    return {
      risk: 'Evidence coverage is thin; this may reflect marketing claims more than real adoption.',
      whatWouldChangeMyMind:
        'Add pricing + review + changelog evidence from at least 2 competitors.',
    }
  }

  // Heuristic 2: High score but few source types
  if (score >= 70 && sourceTypeCount < 2) {
    return {
      risk: 'This may be skewed by a single evidence channel.',
      whatWouldChangeMyMind:
        'Validate with an additional source type (jobs, reviews, changelog).',
    }
  }

  // Default: General competitive response risk
  return {
    risk: 'Competitors may respond quickly, reducing differentiation.',
    whatWouldChangeMyMind:
      'Find evidence of sustained gaps over 6–12 months or switching-cost barriers.',
  }
}

