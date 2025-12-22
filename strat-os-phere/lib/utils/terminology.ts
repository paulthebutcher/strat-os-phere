/**
 * Terminology normalization layer (display-only)
 * 
 * Maps internal terminology to executive-friendly language for UI display.
 * Does NOT rename variables, types, or APIs - this is presentation-only.
 */

const TERMINOLOGY_MAP: Record<string, string> = {
  // Strategic concepts
  'Strategic bets': 'Strategic opportunities',
  'strategic_bets': 'Strategic opportunities',
  'Strategic Bets': 'Strategic opportunities',
  
  // Evidence/signals
  'Evidence': 'Market signals',
  'evidence': 'Market signals',
  'Proof points': 'Market signals',
  'proof_points': 'Market signals',
  
  // Artifacts (hidden from user-facing copy)
  'Artifacts': '',
  'artifacts': '',
}

/**
 * Normalize terminology for display
 * Returns the executive-friendly term if a mapping exists, otherwise returns the original
 */
export function normalizeTerm(term: string): string {
  return TERMINOLOGY_MAP[term] ?? term
}

/**
 * Normalize a label for display (handles common patterns)
 */
export function normalizeLabel(label: string): string {
  // Check exact match first
  if (TERMINOLOGY_MAP[label]) {
    return TERMINOLOGY_MAP[label]
  }
  
  // Check case-insensitive match
  const lowerLabel = label.toLowerCase()
  for (const [key, value] of Object.entries(TERMINOLOGY_MAP)) {
    if (key.toLowerCase() === lowerLabel) {
      return value || label // Return empty string as original if mapped to empty
    }
  }
  
  return label
}

