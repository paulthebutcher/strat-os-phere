/**
 * Try Draft Persistence
 * 
 * Handles localStorage persistence for the public "Try Plinth" flow.
 * Allows users to start an analysis without authentication and resume after login.
 */

const STORAGE_KEY = 'plinth.tryDraft.v1'
const INTENT_KEY = 'plinth.postAuthIntent.v1'

export type TryMode = 'company' | 'market' | 'idea'

export interface TryDraft {
  mode?: TryMode // Optional for backward compatibility
  primaryCompanyName: string
  contextText?: string
  marketCategory?: string
  targetCustomer?: string
  product?: string
  selectedCompetitors: Array<{
    name: string
    url: string
  }>
  evidenceSeedUrls?: Array<{
    competitorDomain: string
    urls: string[]
  }>
  createdAt: number
}

export interface PostAuthIntent {
  kind: 'RUN_TRY_FLOW'
  createdAt: number
  draftVersion: number
}

/**
 * Load the try draft from localStorage
 */
export function loadTryDraft(): TryDraft | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }

    const draft = JSON.parse(stored) as TryDraft
    // Validate it has required fields
    if (!draft.primaryCompanyName || !draft.createdAt) {
      return null
    }

    // Ensure mode defaults to 'company' for backward compatibility
    if (!draft.mode) {
      draft.mode = 'company'
    }

    return draft
  } catch {
    return null
  }
}

/**
 * Save the try draft to localStorage
 */
export function saveTryDraft(draft: TryDraft): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch (error) {
    console.error('Failed to save try draft:', error)
  }
}

/**
 * Clear the try draft from localStorage
 */
export function clearTryDraft(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(INTENT_KEY)
  } catch (error) {
    console.error('Failed to clear try draft:', error)
  }
}

/**
 * Save post-auth intent
 */
export function savePostAuthIntent(intent: PostAuthIntent): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(INTENT_KEY, JSON.stringify(intent))
  } catch (error) {
    console.error('Failed to save post-auth intent:', error)
  }
}

/**
 * Load post-auth intent
 */
export function loadPostAuthIntent(): PostAuthIntent | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(INTENT_KEY)
    if (!stored) {
      return null
    }

    return JSON.parse(stored) as PostAuthIntent
  } catch {
    return null
  }
}

/**
 * Clear post-auth intent
 */
export function clearPostAuthIntent(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(INTENT_KEY)
  } catch (error) {
    console.error('Failed to clear post-auth intent:', error)
  }
}

