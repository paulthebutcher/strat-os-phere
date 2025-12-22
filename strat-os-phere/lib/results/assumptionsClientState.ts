/**
 * Client-side state management for assumption stances
 * 
 * Stores user stance (agree/disagree/unsure) and optional notes
 * in localStorage, keyed by projectId and assumptionId.
 * No database writes - purely client-side for now.
 */

export type AssumptionUserStance = 'agree' | 'disagree' | 'unsure' | 'unreviewed'

export interface AssumptionStance {
  stance: AssumptionUserStance
  note?: string
}

const STORAGE_KEY_PREFIX = 'plinth_assumptions_'

/**
 * Get storage key for a project
 */
function getStorageKey(projectId: string): string {
  return `${STORAGE_KEY_PREFIX}${projectId}`
}

/**
 * Load all assumption stances for a project
 */
export function loadAssumptionStances(
  projectId: string
): Record<string, AssumptionStance> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const key = getStorageKey(projectId)
    const stored = localStorage.getItem(key)
    
    if (!stored) {
      return {}
    }

    const parsed = JSON.parse(stored) as Record<string, AssumptionStance>
    return parsed
  } catch (error) {
    console.warn('Failed to load assumption stances from localStorage:', error)
    return {}
  }
}

/**
 * Save stance for a specific assumption
 */
export function saveAssumptionStance(
  projectId: string,
  assumptionId: string,
  stance: AssumptionUserStance,
  note?: string
): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const key = getStorageKey(projectId)
    const existing = loadAssumptionStances(projectId)
    
    existing[assumptionId] = {
      stance,
      note: note?.trim() || undefined,
    }

    localStorage.setItem(key, JSON.stringify(existing))
  } catch (error) {
    console.warn('Failed to save assumption stance to localStorage:', error)
  }
}

/**
 * Get stance for a specific assumption
 */
export function getAssumptionStance(
  projectId: string,
  assumptionId: string
): AssumptionStance {
  const all = loadAssumptionStances(projectId)
  return all[assumptionId] || { stance: 'unreviewed' }
}

/**
 * Clear all stances for a project (useful for testing/reset)
 */
export function clearAssumptionStances(projectId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const key = getStorageKey(projectId)
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to clear assumption stances from localStorage:', error)
  }
}

