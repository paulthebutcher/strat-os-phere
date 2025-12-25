/**
 * Hook for managing lever commitment state (Proceed/Validate/Park)
 * 
 * V1: Uses localStorage, scoped by project_id + lever_id
 * Future: Can migrate to DB if needed
 */

import { useState, useEffect, useCallback } from 'react'

export type LeverCommitment = 'proceed' | 'validate' | 'park' | 'unset'

const STORAGE_KEY_PREFIX = 'plinth:lever_commitment:'

/**
 * Get storage key for a specific lever
 */
function getStorageKey(projectId: string, leverId: string): string {
  return `${STORAGE_KEY_PREFIX}${projectId}:${leverId}`
}

/**
 * Load commitment for a lever
 */
function loadCommitment(projectId: string, leverId: string): LeverCommitment {
  if (typeof window === 'undefined') return 'unset'
  
  try {
    const key = getStorageKey(projectId, leverId)
    const stored = localStorage.getItem(key)
    if (stored) {
      const value = stored as LeverCommitment
      if (['proceed', 'validate', 'park', 'unset'].includes(value)) {
        return value
      }
    }
  } catch (error) {
    console.warn('Failed to load lever commitment from localStorage:', error)
  }
  
  return 'unset'
}

/**
 * Save commitment for a lever
 */
function saveCommitment(projectId: string, leverId: string, commitment: LeverCommitment): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = getStorageKey(projectId, leverId)
    if (commitment === 'unset') {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, commitment)
    }
  } catch (error) {
    console.warn('Failed to save lever commitment to localStorage:', error)
  }
}

/**
 * Load all commitments for a project
 */
export function loadAllCommitments(projectId: string): Record<string, LeverCommitment> {
  if (typeof window === 'undefined') return {}
  
  const commitments: Record<string, LeverCommitment> = {}
  
  try {
    // Scan localStorage for keys matching our pattern
    const prefix = `${STORAGE_KEY_PREFIX}${projectId}:`
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        const leverId = key.slice(prefix.length)
        const value = localStorage.getItem(key)
        if (value && ['proceed', 'validate', 'park'].includes(value)) {
          commitments[leverId] = value as LeverCommitment
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load all lever commitments:', error)
  }
  
  return commitments
}

/**
 * Hook to manage commitment state for a single lever
 */
export function useLeverCommitment(projectId: string, leverId: string) {
  const [commitment, setCommitmentState] = useState<LeverCommitment>(() => 
    loadCommitment(projectId, leverId)
  )
  
  useEffect(() => {
    setCommitmentState(loadCommitment(projectId, leverId))
    
    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = () => {
      setCommitmentState(loadCommitment(projectId, leverId))
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [projectId, leverId])
  
  const setCommitment = useCallback((newCommitment: LeverCommitment) => {
    saveCommitment(projectId, leverId, newCommitment)
    setCommitmentState(newCommitment)
    
    // Dispatch custom event for same-tab updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lever-commitment-updated', {
        detail: { projectId, leverId, commitment: newCommitment }
      }))
    }
  }, [projectId, leverId])
  
  return [commitment, setCommitment] as const
}

