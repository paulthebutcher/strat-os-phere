/**
 * Local storage utilities for onboarding state persistence.
 * Stores user preferences and completion states in localStorage.
 */

export interface OnboardingState {
  dismissedProjectCoachCard?: boolean
  completedFirstWin?: boolean
  lastQualityScoreSeen?: number
  isGuidedMode?: boolean
}

const STORAGE_KEY = 'plinth_onboarding_state'

/**
 * Get the current onboarding state from localStorage.
 * Returns default state if nothing is stored.
 */
export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored) as OnboardingState
  } catch {
    return {}
  }
}

/**
 * Update onboarding state, merging with existing state.
 */
export function setOnboardingState(partial: Partial<OnboardingState>): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const current = getOnboardingState()
    const updated = { ...current, ...partial }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Clear all onboarding state.
 */
export function clearOnboardingState(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

