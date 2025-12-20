/**
 * Banned pattern validation for model outputs
 * Detects vague verbs and unsupported absolutes that reduce output quality
 */

const BANNED_VAGUE_VERBS = [
  'improve',
  'enhance',
  'optimize',
  'streamline',
  'leverage',
  'utilize',
  'facilitate',
  'enable',
  'empower',
  'transform',
  'revolutionize',
  'disrupt',
  'maximize',
  'minimize',
]

const BANNED_UNSUPPORTED_ABSOLUTES = [
  'always',
  'never',
  'all',
  'none',
  'every',
  'no one',
  'everyone',
  'everything',
  'nothing',
]

/**
 * Check if text contains banned patterns
 * Returns violations found in the text
 */
export function detectBannedPatterns(text: string): {
  hasViolations: boolean
  vagueVerbs: string[]
  unsupportedAbsolutes: string[]
} {
  const textLower = text.toLowerCase()
  
  const vagueVerbs: string[] = []
  BANNED_VAGUE_VERBS.forEach((verb) => {
    // Word boundary check to avoid false positives (e.g., "improvement" vs "improve")
    const regex = new RegExp(`\\b${verb}s?\\b`, 'gi')
    if (regex.test(text)) {
      vagueVerbs.push(verb)
    }
  })

  const unsupportedAbsolutes: string[] = []
  BANNED_UNSUPPORTED_ABSOLUTES.forEach((absolute) => {
    const regex = new RegExp(`\\b${absolute}\\b`, 'gi')
    if (regex.test(text)) {
      unsupportedAbsolutes.push(absolute)
    }
  })

  return {
    hasViolations: vagueVerbs.length > 0 || unsupportedAbsolutes.length > 0,
    vagueVerbs: [...new Set(vagueVerbs)], // Deduplicate
    unsupportedAbsolutes: [...new Set(unsupportedAbsolutes)], // Deduplicate
  }
}

/**
 * Score text quality based on banned pattern violations
 * Returns a penalty score (0.0 = no violations, 1.0 = many violations)
 */
export function computeBannedPatternPenalty(text: string): number {
  const violations = detectBannedPatterns(text)
  
  if (!violations.hasViolations) {
    return 0.0
  }

  // Count violations (weight vague verbs more heavily)
  const penalty =
    violations.vagueVerbs.length * 0.3 + violations.unsupportedAbsolutes.length * 0.2

  // Cap penalty at 1.0
  return Math.min(1.0, penalty / 10) // Normalize so ~10 violations = 1.0
}

