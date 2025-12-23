/**
 * UI-only view model helper for analysis state and coverage
 * 
 * This module maps whatever data the page currently has into:
 * - systemState: 'empty' | 'running' | 'partial' | 'complete' | 'failed'
 * - coverageLevel: 'limited' | 'moderate' | 'strong'
 * - optional counts (sourceCount, competitorCount)
 * 
 * Rules (must be defensive):
 * - If data is missing or unclear, default to safe states
 * - Never crash if props are undefined
 * - Default to 'partial' state and 'limited' coverage if uncertain
 */

import type { SystemState } from '@/components/ux/SystemStateBanner'
import type { CoverageLevel } from '@/components/ux/CoverageIndicator'

export interface AnalysisViewModel {
  systemState: SystemState
  coverageLevel: CoverageLevel
  sourceCount?: number
  competitorCount?: number
}

interface ViewModelInput {
  // Run status information
  activeRunStatus?: 'running' | 'queued' | 'completed' | 'failed' | 'cancelled' | null
  hasArtifacts?: boolean
  artifactCount?: number
  
  // Coverage hints (if available)
  sourceCount?: number
  competitorCount?: number
  
  // Error state
  hasError?: boolean
  errorMessage?: string
}

/**
 * Derive analysis view model from available page data
 * 
 * Defensive defaults:
 * - If no run status and no artifacts → 'empty'
 * - If run status is 'running' or 'queued' → 'running'
 * - If run status is 'failed' or hasError → 'failed'
 * - If has artifacts but run is still running → 'partial'
 * - If has artifacts and run completed → 'complete'
 * - If unclear → 'partial' (safe default)
 */
export function deriveAnalysisViewModel(input: ViewModelInput = {}): AnalysisViewModel {
  const {
    activeRunStatus,
    hasArtifacts = false,
    artifactCount = 0,
    sourceCount,
    competitorCount,
    hasError = false,
  } = input

  // Determine system state
  let systemState: SystemState = 'partial' // Safe default

  // Priority 1: Check for errors
  if (hasError || activeRunStatus === 'failed' || activeRunStatus === 'cancelled') {
    systemState = 'failed'
  }
  // Priority 2: Check if running
  else if (activeRunStatus === 'running' || activeRunStatus === 'queued') {
    systemState = 'running'
  }
  // Priority 3: Check if empty
  else if (!hasArtifacts && artifactCount === 0) {
    systemState = 'empty'
  }
  // Priority 4: Check if complete
  else if (hasArtifacts && activeRunStatus === 'completed') {
    systemState = 'complete'
  }
  // Priority 5: Has artifacts but status unclear → partial
  else if (hasArtifacts) {
    systemState = 'partial'
  }
  // Default: empty
  else {
    systemState = 'empty'
  }

  // Determine coverage level
  // Default to 'limited' if we can't determine
  let coverageLevel: CoverageLevel = 'limited'

  // If we have source count, use it to determine coverage
  if (sourceCount !== undefined) {
    if (sourceCount >= 20) {
      coverageLevel = 'strong'
    } else if (sourceCount >= 10) {
      coverageLevel = 'moderate'
    } else {
      coverageLevel = 'limited'
    }
  }
  // If we have competitor count, use it as a hint
  else if (competitorCount !== undefined) {
    if (competitorCount >= 5) {
      coverageLevel = 'moderate'
    } else {
      coverageLevel = 'limited'
    }
  }
  // If we have artifacts but no counts, default to limited with a note
  else if (hasArtifacts) {
    coverageLevel = 'limited'
  }
  // No artifacts = limited (or undefined, but we default to limited)
  else {
    coverageLevel = 'limited'
  }

  return {
    systemState,
    coverageLevel,
    sourceCount,
    competitorCount,
  }
}

/**
 * Simplified version that just takes the most common inputs
 * Used when we don't have full run information
 */
export function deriveSimpleAnalysisViewModel(
  hasArtifacts: boolean,
  isRunning?: boolean,
  hasError?: boolean
): AnalysisViewModel {
  return deriveAnalysisViewModel({
    activeRunStatus: isRunning ? 'running' : hasArtifacts ? 'completed' : null,
    hasArtifacts,
    hasError,
  })
}

