/**
 * localStorage-based store for tracking active runs across navigation
 */

import type { ActiveRun, RunStatus } from './types'

const STORAGE_KEY = 'plinth_active_runs'

/**
 * Get all active runs from localStorage
 */
export function getActiveRuns(): ActiveRun[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    const runs = JSON.parse(stored) as ActiveRun[]
    // Filter out runs older than 24 hours
    const now = Date.now()
    return runs.filter((run) => {
      const createdAt = new Date(run.createdAt).getTime()
      return now - createdAt < 24 * 60 * 60 * 1000
    })
  } catch {
    return []
  }
}

/**
 * Add a new active run to localStorage
 */
export function addActiveRun(run: ActiveRun): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const runs = getActiveRuns()
    // Remove any existing run with the same runId
    const filtered = runs.filter((r) => r.runId !== run.runId)
    filtered.push(run)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Update an active run's status
 */
export function updateActiveRunStatus(
  runId: string,
  status: RunStatus
): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const runs = getActiveRuns()
    const updated = runs.map((run) =>
      run.runId === runId ? { ...run, lastSeenStatus: status } : run
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Remove an active run from localStorage
 */
export function removeActiveRun(runId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const runs = getActiveRuns()
    const filtered = runs.filter((r) => r.runId !== runId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Check if a run is still active (not completed or failed)
 */
export function isRunActive(status: RunStatus): boolean {
  return status === 'queued' || status === 'running'
}

