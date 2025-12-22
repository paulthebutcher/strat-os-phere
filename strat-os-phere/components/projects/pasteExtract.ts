/**
 * Client-side heuristic extractor for paste-anything intake.
 * Parses text and attempts to extract structured fields.
 */

export interface ExtractedFields {
  market?: string
  targetCustomer?: string
  product?: string
  goal?: string
  geography?: string
  primaryConstraint?: string
  riskPosture?: string
  ambitionLevel?: string
  explicitNonGoals?: string
  inputConfidence?: string
}

export interface ExtractionProposal {
  field: keyof ExtractedFields
  label: string
  value: string
  destination: string
}

/**
 * Extract fields from pasted text using simple heuristics.
 */
export function extractFromPaste(text: string): ExtractedFields {
  const extracted: ExtractedFields = {}
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const lowerText = text.toLowerCase()

  // Look for explicit key-value patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    // Market patterns
    if (!extracted.market) {
      if (
        lowerLine.includes('market:') ||
        lowerLine.includes('industry:') ||
        lowerLine.match(/^market\s*[:=]/i) ||
        lowerLine.match(/^industry\s*[:=]/i)
      ) {
        extracted.market = extractValue(line, ['market:', 'industry:'])
      } else if (
        (lowerLine.includes('market') || lowerLine.includes('industry')) &&
        line.length > 10 &&
        line.length < 100
      ) {
        extracted.market = line.replace(/^(market|industry)[\s:=]+/i, '').trim()
      }
    }

    // Target customer patterns
    if (!extracted.targetCustomer) {
      if (
        lowerLine.includes('customer:') ||
        lowerLine.includes('users:') ||
        lowerLine.includes('buyers:') ||
        lowerLine.includes('target:') ||
        lowerLine.match(/^customer\s*[:=]/i) ||
        lowerLine.match(/^users?\s*[:=]/i)
      ) {
        extracted.targetCustomer = extractValue(line, [
          'customer:',
          'users:',
          'buyers:',
          'target:',
        ])
      } else if (
        (lowerLine.includes('customer') ||
          lowerLine.includes('users') ||
          lowerLine.includes('buyers')) &&
        line.length > 10 &&
        line.length < 150
      ) {
        extracted.targetCustomer = line
          .replace(/^(customer|users?|buyers?|target)[\s:=]+/i, '')
          .trim()
      }
    }

    // Product patterns
    if (!extracted.product) {
      if (
        lowerLine.includes('product:') ||
        lowerLine.includes('we are building:') ||
        lowerLine.includes('building:') ||
        lowerLine.match(/^product\s*[:=]/i)
      ) {
        extracted.product = extractValue(line, [
          'product:',
          'we are building:',
          'building:',
        ])
      }
    }

    // Goal patterns
    if (!extracted.goal) {
      if (
        lowerLine.includes('goal:') ||
        lowerLine.includes('outcome:') ||
        lowerLine.includes('objective:') ||
        lowerLine.match(/^goal\s*[:=]/i) ||
        lowerLine.match(/^objective\s*[:=]/i)
      ) {
        extracted.goal = extractValue(line, [
          'goal:',
          'outcome:',
          'objective:',
        ])
      }
    }

    // Geography patterns
    if (!extracted.geography) {
      const geoPatterns = [
        /(?:US|USA|United States)/i,
        /(?:EMEA|Europe|Middle East|Africa)/i,
        /(?:APAC|Asia|Pacific)/i,
        /(?:North America|South America|Latin America)/i,
      ]
      for (const pattern of geoPatterns) {
        if (pattern.test(line)) {
          extracted.geography = line
          break
        }
      }
    }

    // Constraint patterns
    if (!extracted.primaryConstraint) {
      if (
        lowerLine.includes('constraint:') ||
        lowerLine.includes('limitation:') ||
        lowerLine.match(/^constraint\s*[:=]/i)
      ) {
        extracted.primaryConstraint = extractValue(line, [
          'constraint:',
          'limitation:',
        ])
      } else if (
        (lowerLine.includes('time') ||
          lowerLine.includes('budget') ||
          lowerLine.includes('regulatory') ||
          lowerLine.includes('competitive pressure')) &&
        line.length < 100
      ) {
        extracted.primaryConstraint = line
      }
    }

    // Non-goals patterns
    if (!extracted.explicitNonGoals) {
      if (
        lowerLine.includes('non-goals:') ||
        lowerLine.includes('non goals:') ||
        lowerLine.includes('not trying to:') ||
        lowerLine.match(/^non[- ]?goals?\s*[:=]/i)
      ) {
        extracted.explicitNonGoals = extractValue(line, [
          'non-goals:',
          'non goals:',
          'not trying to:',
        ])
      }
    }
  }

  // Fallback: if we found keywords but no explicit patterns, try to extract from context
  if (!extracted.market && lowerText.includes('market')) {
    const marketMatch = text.match(/market[:\s]+([^.\n]+)/i)
    if (marketMatch) extracted.market = marketMatch[1].trim()
  }

  if (!extracted.targetCustomer && lowerText.includes('customer')) {
    const customerMatch = text.match(/customer[:\s]+([^.\n]+)/i)
    if (customerMatch) extracted.targetCustomer = customerMatch[1].trim()
  }

  // Clean up extracted values
  Object.keys(extracted).forEach((key) => {
    const value = extracted[key as keyof ExtractedFields]
    if (value) {
      // Remove common prefixes/suffixes and clean up
      let cleaned = value
        .replace(/^[-•*]\s*/, '') // Remove bullet points
        .replace(/\s+/g, ' ')
        .trim()
      // Limit length
      if (cleaned.length > 200) {
        cleaned = cleaned.substring(0, 197) + '...'
      }
      extracted[key as keyof ExtractedFields] = cleaned || undefined
    }
  })

  return extracted
}

/**
 * Extract value after a colon or equals sign.
 */
function extractValue(
  line: string,
  prefixes: string[]
): string | undefined {
  for (const prefix of prefixes) {
    const index = line.toLowerCase().indexOf(prefix.toLowerCase())
    if (index !== -1) {
      const value = line.substring(index + prefix.length).trim()
      if (value) return value
    }
  }
  return undefined
}

/**
 * Generate proposals for fields that can be filled.
 */
export function generateProposals(
  extracted: ExtractedFields,
  currentValues: Partial<Record<keyof ExtractedFields, string>>
): ExtractionProposal[] {
  const proposals: ExtractionProposal[] = []
  const fieldLabels: Record<keyof ExtractedFields, string> = {
    market: 'Market / category',
    targetCustomer: 'Target customer',
    product: 'Your product',
    goal: 'Business goal',
    geography: 'Geography',
    primaryConstraint: 'Primary constraint',
    riskPosture: 'Risk posture',
    ambitionLevel: 'Ambition level',
    explicitNonGoals: 'Explicit non-goals',
    inputConfidence: 'Input confidence',
  }

  for (const [field, value] of Object.entries(extracted)) {
    if (!value) continue
    const fieldKey = field as keyof ExtractedFields
    const currentValue = currentValues[fieldKey] || ''
    // Only propose if destination is empty or very short
    if (!currentValue || currentValue.trim().length < 3) {
      proposals.push({
        field: fieldKey,
        label: fieldLabels[fieldKey] || field,
        value,
        destination: fieldLabels[fieldKey] || field,
      })
    }
  }

  return proposals
}

