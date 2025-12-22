/**
 * Client-side heuristic extractor for paste-anything intake.
 * Parses text and attempts to extract structured fields using conservative heuristics.
 * No AI calls - pure pattern matching.
 */

export interface FormValues {
  name?: string
  marketCategory?: string
  targetCustomer?: string
  businessGoal?: string
  product?: string
  geography?: string
}

/**
 * Extract fields from pasted text using simple heuristics.
 * Returns partial form values that can be safely applied.
 * Never throws - returns empty object on failure.
 */
export function extractFromPaste(text: string): Partial<FormValues> {
  const extracted: Partial<FormValues> = {}
  if (!text || !text.trim()) {
    return extracted
  }

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const lowerText = text.toLowerCase()

  // Look for explicit key-value patterns (case-insensitive)
  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    // Market / category patterns
    if (!extracted.marketCategory) {
      if (
        lowerLine.startsWith('market:') ||
        lowerLine.startsWith('category:') ||
        lowerLine.startsWith('industry:') ||
        /^market\s*[:=]/i.test(line) ||
        /^category\s*[:=]/i.test(line)
      ) {
        extracted.marketCategory = extractValueAfterColon(line)
      }
    }

    // Target customer patterns
    if (!extracted.targetCustomer) {
      if (
        lowerLine.startsWith('customer:') ||
        lowerLine.startsWith('target customer:') ||
        lowerLine.startsWith('target:') ||
        lowerLine.startsWith('users:') ||
        /^customer\s*[:=]/i.test(line) ||
        /^target\s*[:=]/i.test(line)
      ) {
        extracted.targetCustomer = extractValueAfterColon(line)
      }
    }

    // Business goal patterns
    if (!extracted.businessGoal) {
      if (
        lowerLine.startsWith('goal:') ||
        lowerLine.startsWith('business goal:') ||
        lowerLine.startsWith('objective:') ||
        lowerLine.startsWith('outcome:') ||
        /^goal\s*[:=]/i.test(line) ||
        /^objective\s*[:=]/i.test(line)
      ) {
        extracted.businessGoal = extractValueAfterColon(line)
      }
    }

    // Product patterns
    if (!extracted.product) {
      if (
        lowerLine.startsWith('product:') ||
        lowerLine.startsWith('we are building:') ||
        lowerLine.startsWith('building:') ||
        /^product\s*[:=]/i.test(line)
      ) {
        extracted.product = extractValueAfterColon(line)
      }
    }

    // Geography patterns
    if (!extracted.geography) {
      if (
        lowerLine.startsWith('geography:') ||
        lowerLine.startsWith('geo:') ||
        lowerLine.startsWith('region:') ||
        /^geography\s*[:=]/i.test(line) ||
        /^geo\s*[:=]/i.test(line)
      ) {
        extracted.geography = extractValueAfterColon(line)
      }
    }

    // Project name patterns
    if (!extracted.name) {
      if (
        lowerLine.startsWith('name:') ||
        lowerLine.startsWith('project name:') ||
        lowerLine.startsWith('project:') ||
        /^name\s*[:=]/i.test(line) ||
        /^project\s*[:=]/i.test(line)
      ) {
        extracted.name = extractValueAfterColon(line)
      }
    }
  }

  // Fallback: try regex patterns if explicit patterns didn't match
  if (!extracted.marketCategory) {
    // Look for phrases containing software, platform, tools, management
    const marketPattern = /(?:market|category|industry)[:\s]+([^.\n]+(?:software|platform|tools|management|service|solution)[^.\n]*)/i
    const match = text.match(marketPattern)
    if (match && match[1]) {
      extracted.marketCategory = match[1].trim()
    }
  }

  if (!extracted.targetCustomer) {
    // Look for customer-related phrases
    const customerPattern = /(?:customer|target|users?)[:\s]+([^.\n]{10,150})/i
    const match = text.match(customerPattern)
    if (match && match[1]) {
      extracted.targetCustomer = match[1].trim()
    }
  }

  if (!extracted.businessGoal) {
    // Look for sentences starting with "to", "so that", "reduce", "increase", "improve"
    const goalPattern = /(?:goal|objective|outcome)[:\s]+(?:to|so that|reduce|increase|improve|identify|prioritize)[^.\n]{10,200}/i
    const match = text.match(goalPattern)
    if (match && match[0]) {
      extracted.businessGoal = match[0].replace(/^(?:goal|objective|outcome)[:\s]+/i, '').trim()
    }
  }

  if (!extracted.geography) {
    // Look for common regions/countries
    const geoPatterns = [
      /(?:US|USA|United States)/i,
      /(?:EMEA|Europe|Middle East|Africa)/i,
      /(?:APAC|Asia|Pacific)/i,
      /(?:North America|South America|Latin America)/i,
      /(?:Canada|Mexico|UK|United Kingdom)/i,
      /(?:Western Europe|Eastern Europe)/i,
    ]
    for (const pattern of geoPatterns) {
      const match = text.match(pattern)
      if (match) {
        extracted.geography = match[0]
        break
      }
    }
  }

  // Clean up extracted values
  Object.keys(extracted).forEach((key) => {
    const value = extracted[key as keyof FormValues]
    if (value) {
      let cleaned = value
        .replace(/^[-•*]\s*/, '') // Remove bullet points
        .replace(/\s+/g, ' ')
        .trim()
      // Limit length
      if (cleaned.length > 200) {
        cleaned = cleaned.substring(0, 197) + '...'
      }
      if (cleaned.length > 0) {
        extracted[key as keyof FormValues] = cleaned as any
      } else {
        delete extracted[key as keyof FormValues]
      }
    }
  })

  return extracted
}

/**
 * Extract value after a colon or equals sign.
 */
function extractValueAfterColon(line: string): string {
  const colonIndex = line.indexOf(':')
  const equalsIndex = line.indexOf('=')
  const index = colonIndex !== -1 ? colonIndex : equalsIndex !== -1 ? equalsIndex : -1
  if (index !== -1) {
    return line.substring(index + 1).trim()
  }
  return ''
}

