/**
 * Client-side heuristics for computing input quality scores.
 * These are UI-only indicators and do not affect backend scoring.
 */

export interface InputQuality {
  score: number // 0-100
  label: 'Needs detail' | 'Good start' | 'Strong inputs'
  suggestions: string[]
}

export interface ProjectInputs {
  name?: string
  market?: string
  targetCustomer?: string
  businessGoal?: string
  yourProduct?: string
}

/**
 * Count words in a string (simple heuristic: split on whitespace).
 */
function countWords(text: string | null | undefined): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Compute quality score from project inputs.
 * Returns a score from 0-100 with label and suggestions.
 */
export function computeQualityScore(inputs: ProjectInputs): InputQuality {
  let score = 0
  const suggestions: string[] = []

  // Project name: +25 if length >= 12
  if (inputs.name && inputs.name.length >= 12) {
    score += 25
  } else if (inputs.name) {
    suggestions.push('Add a more descriptive project name (12+ characters)')
  } else {
    suggestions.push('Add a project name')
  }

  // Market/category: +25 if length >= 20 and >= 2 words
  const marketWords = countWords(inputs.market)
  if (inputs.market && inputs.market.length >= 20 && marketWords >= 2) {
    score += 25
  } else if (inputs.market) {
    suggestions.push('Add a more specific market (2-5 words, 20+ characters)')
  } else {
    suggestions.push('Describe the market or category')
  }

  // Target customer: +25 if length >= 15 and >= 2 words
  const customerWords = countWords(inputs.targetCustomer)
  if (inputs.targetCustomer && inputs.targetCustomer.length >= 15 && customerWords >= 2) {
    score += 25
  } else if (inputs.targetCustomer) {
    suggestions.push('Describe the customer with a role + context')
  } else {
    suggestions.push('Add target customer details')
  }

  // Business goal: +15 if length >= 25 (optional)
  if (inputs.businessGoal && inputs.businessGoal.length >= 25) {
    score += 15
  } else if (!inputs.businessGoal) {
    // Only suggest if other fields are also missing
    if (score < 50) {
      suggestions.push('Add a measurable goal (optional)')
    }
  }

  // Your product: +10 if length >= 20 (optional)
  if (inputs.yourProduct && inputs.yourProduct.length >= 20) {
    score += 10
  }

  // Determine label
  let label: InputQuality['label']
  if (score < 40) {
    label = 'Needs detail'
  } else if (score < 70) {
    label = 'Good start'
  } else {
    label = 'Strong inputs'
  }

  // Limit suggestions to top 2 most relevant
  const topSuggestions = suggestions.slice(0, 2)

  return {
    score: Math.min(100, score),
    label,
    suggestions: topSuggestions,
  }
}

/**
 * Check if market input is complete (>= 20 chars and >= 2 words).
 */
export function isMarketComplete(market: string | null | undefined): boolean {
  if (!market) return false
  return market.length >= 20 && countWords(market) >= 2
}

/**
 * Check if target customer input is complete (>= 15 chars and >= 2 words).
 */
export function isTargetCustomerComplete(
  targetCustomer: string | null | undefined
): boolean {
  if (!targetCustomer) return false
  return targetCustomer.length >= 15 && countWords(targetCustomer) >= 2
}

