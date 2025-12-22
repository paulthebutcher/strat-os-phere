/**
 * Proposed framing information inferred from user input.
 * Used for confirmation-first UX flow.
 */

export type ConfidenceLevel = 'low' | 'med' | 'high'

export interface ProposedFraming {
  market_category: string | null
  target_customer: string | null
  business_goal: string | null
  geography: string | null
  suggested_competitors: Array<{ name: string; url?: string }>
  confidence: {
    market: ConfidenceLevel
    customer: ConfidenceLevel
    goal: ConfidenceLevel
  }
}

/**
 * Infer competitor name from URL domain
 */
export function inferCompetitorNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const hostname = urlObj.hostname.replace(/^www\./, '')
    const domain = hostname.split('.')[0]
    // Capitalize first letter
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  } catch {
    // Fallback: use URL as-is, cleaned up
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}

/**
 * Client-side heuristics to extract framing from free-form text.
 * Returns ProposedFraming with confidence levels.
 */
export function inferFramingFromText(text: string): ProposedFraming {
  const lowerText = text.toLowerCase()
  const framing: ProposedFraming = {
    market_category: null,
    target_customer: null,
    business_goal: null,
    geography: null,
    suggested_competitors: [],
    confidence: {
      market: 'low',
      customer: 'low',
      goal: 'low',
    },
  }

  // Market category inference
  const marketKeywords: Record<string, string> = {
    gym: 'Fitness and gym management',
    fitness: 'Fitness and wellness',
    crm: 'Customer relationship management',
    incident: 'Incident management and operations',
    recruiting: 'Recruiting and talent acquisition',
    ats: 'Applicant tracking systems',
    streaming: 'Video streaming platforms',
    saas: 'Software as a service',
    ecommerce: 'E-commerce platforms',
  }

  for (const [keyword, category] of Object.entries(marketKeywords)) {
    if (lowerText.includes(keyword)) {
      framing.market_category = category
      framing.confidence.market = 'high'
      break
    }
  }

  // Target customer inference
  const customerPatterns = [
    /(?:for|targeting|serving)\s+([^.\n]{5,100})/i,
    /(?:customer|users?|audience)[:\s]+([^.\n]{5,100})/i,
  ]

  for (const pattern of customerPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      framing.target_customer = match[1].trim()
      framing.confidence.customer = 'med'
      break
    }
  }

  // Business goal inference
  const goalPatterns = [
    /(?:to|goal|objective)[:\s]+(?:increase|reduce|improve|identify|prioritize|optimize)[^.\n]{10,200}/i,
    /(?:we want to|need to|aiming to)\s+([^.\n]{10,200})/i,
  ]

  for (const pattern of goalPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      framing.business_goal = match[1].trim()
      framing.confidence.goal = 'med'
      break
    }
  }

  // Geography inference (simple patterns)
  const geoPatterns = [
    { pattern: /(?:US|USA|United States)/i, value: 'United States' },
    { pattern: /(?:EMEA|Europe|Middle East|Africa)/i, value: 'EMEA' },
    { pattern: /(?:APAC|Asia|Pacific)/i, value: 'APAC' },
    { pattern: /(?:North America)/i, value: 'North America' },
  ]

  for (const { pattern, value } of geoPatterns) {
    if (pattern.test(text)) {
      framing.geography = value
      break
    }
  }

  return framing
}

/**
 * Merge framing from API response with client-side inference.
 * API framing takes precedence when available.
 */
export function mergeFraming(
  apiFraming: {
    projectName?: string
    market?: string
    targetCustomer?: string
    geography?: string
    businessGoal?: string
  } | null | undefined,
  inferredFraming: ProposedFraming
): ProposedFraming {
  return {
    market_category: apiFraming?.market || inferredFraming.market_category,
    target_customer: apiFraming?.targetCustomer || inferredFraming.target_customer,
    business_goal: apiFraming?.businessGoal || inferredFraming.business_goal,
    geography: apiFraming?.geography || inferredFraming.geography,
    suggested_competitors: inferredFraming.suggested_competitors,
    confidence: {
      market: apiFraming?.market ? 'high' : inferredFraming.confidence.market,
      customer: apiFraming?.targetCustomer ? 'high' : inferredFraming.confidence.customer,
      goal: apiFraming?.businessGoal ? 'high' : inferredFraming.confidence.goal,
    },
  }
}

