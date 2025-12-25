'use client'

import { createClient } from '@/lib/supabase/client'

// Simple client-side logger (since server logger uses process.env)
const clientLogger = {
  error: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ensureAnonSession] ${message}`, data || '')
    }
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[ensureAnonSession] ${message}`, data || '')
    }
  },
}

const ANON_ID_STORAGE_KEY = 'plinth_anon_id'

/**
 * Ensures an anonymous Supabase session exists.
 * 
 * - If user is already authenticated: returns the user ID
 * - If not authenticated: creates or restores anonymous session
 * - Stores anon ID in localStorage as fallback
 * 
 * @returns Promise that resolves to { ok: true, userId: string } or { ok: false, error: string }
 */
export async function ensureAnonSession(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  try {
    const supabase = createClient()

    // Check if user is already authenticated
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser()

    if (user) {
      // Already authenticated, store user ID in localStorage as backup
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(ANON_ID_STORAGE_KEY, user.id)
        } catch {
          // Ignore localStorage errors
        }
      }
      return { ok: true, userId: user.id }
    }

    if (getUserError) {
      clientLogger.error('getUser error', { error: getUserError.message })
    }

    // Check localStorage for existing anon ID (for restoration)
    let existingAnonId: string | null = null
    if (typeof window !== 'undefined') {
      try {
        existingAnonId = localStorage.getItem(ANON_ID_STORAGE_KEY)
      } catch {
        // Ignore localStorage errors
      }
    }

    // Create anonymous session
    const { data: anonData, error: signInError } = await supabase.auth.signInAnonymously({
      options: existingAnonId
        ? {
            // Store existing anon ID in metadata for reference
            data: { previousAnonId: existingAnonId },
          }
        : undefined,
    })

    if (signInError) {
      clientLogger.error('Failed to create anonymous session', {
        error: signInError.message,
      })
      return { ok: false, error: 'Failed to create anonymous session' }
    }

    if (!anonData.user) {
      clientLogger.error('No user returned from signInAnonymously')
      return { ok: false, error: 'Failed to create anonymous session' }
    }

    // Store anon ID in localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ANON_ID_STORAGE_KEY, anonData.user.id)
      } catch {
        // Ignore localStorage errors
      }
    }

    clientLogger.debug('Anonymous session created', {
      userId: anonData.user.id,
    })

    return { ok: true, userId: anonData.user.id }
  } catch (error) {
    clientLogger.error('Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected error occurred',
    }
  }
}

/**
 * Gets the stored anonymous user ID from localStorage (if available)
 */
export function getStoredAnonId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(ANON_ID_STORAGE_KEY)
  } catch {
    return null
  }
}

