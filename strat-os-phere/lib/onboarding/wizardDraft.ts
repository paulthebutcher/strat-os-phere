/**
 * Wizard Draft Persistence
 * 
 * Handles localStorage persistence for the analysis wizard flow.
 * Allows users to start an analysis without authentication and resume after login.
 */

const STORAGE_KEY = 'plinth:wizard:draft.v1'

import type { WizardState } from './types'

/**
 * Load the wizard draft from localStorage
 */
export function loadWizardDraft(): WizardState | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }

    const draft = JSON.parse(stored) as WizardState
    // Validate it has required fields
    if (!draft.primaryCompanyName) {
      return null
    }

    return draft
  } catch {
    return null
  }
}

/**
 * Save the wizard draft to localStorage
 */
export function saveWizardDraft(draft: WizardState): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch (error) {
    console.error('Failed to save wizard draft:', error)
  }
}

/**
 * Clear the wizard draft from localStorage
 */
export function clearWizardDraft(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear wizard draft:', error)
  }
}

