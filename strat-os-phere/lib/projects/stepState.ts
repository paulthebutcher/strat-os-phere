/**
 * Project Step State - Single source of truth for step completion
 * 
 * This module implements a state machine for project onboarding steps:
 * - Step 1: Describe (project creation)
 * - Step 2: Competitors (requires explicit confirmation)
 * - Step 3: Evidence (gated by Step 2 confirmation)
 * 
 * Core Principle: Step progression is a state machine, not a navigation suggestion.
 * A step can only be "complete" if it has an explicit completion signal—not inferred
 * from derived data or presence of DB rows.
 * 
 * STATE MACHINE RULES:
 * ====================
 * 
 * Step 1 (Describe):
 *   - Complete: Project exists (implicit)
 *   - Always allows navigation to Step 2
 * 
 * Step 2 (Competitors):
 *   - Complete: competitorsConfirmed === true AND competitorsCount > 0
 *   - Incomplete if: 
 *     * No explicit confirmation (even if competitors exist from previous runs)
 *     * No competitors added
 *   - User must explicitly confirm via Step 2 confirmation action
 *   - Merely having competitors in DB does NOT imply completion
 * 
 * Step 3 (Evidence):
 *   - Accessible: Step 2 is complete (canProceedToStep3 === true)
 *   - Hard gate: Redirects to Step 2 if Step 2 not complete
 *   - Gate runs server-side (not useEffect)
 * 
 * IMPLEMENTATION NOTES:
 * ====================
 * - Confirmation flag stored in project_inputs.input_json:
 *   * competitorsConfirmedAt: ISO timestamp (preferred)
 *   * competitorsConfirmed: boolean (fallback)
 * - Both Step 2 and Step 3 pages use getProjectStepState() for consistency
 * - No auto-forward logic: Step 2 never auto-advances, even if competitors exist
 * - Stale competitors from previous runs: Step 2 still requires confirmation
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getLatestProjectInput } from '@/lib/data/projectInputs'
import { logger } from '@/lib/logger'

export interface ProjectStepState {
  // Step 2 state
  hasSuggestedCompetitors: boolean
  competitorsCount: number
  competitorsConfirmed: boolean
  competitorsConfirmedAt: string | null
  
  // Computed current step
  currentStep: 1 | 2 | 3
  
  // Helper flags
  canProceedToStep3: boolean
}

/**
 * Get the current step state for a project.
 * 
 * This is the single source of truth for step completion logic.
 * All step navigation and gating should use this function.
 * 
 * State machine rules:
 * - Step 1 complete: Project exists (implicit)
 * - Step 2 complete: competitorsConfirmed === true AND competitorsCount > 0
 * - Step 3 accessible: Step 2 complete
 * 
 * Note: Merely having competitors in the DB does NOT imply Step 2 is complete.
 * The user must explicitly confirm via the Step 2 confirmation action.
 */
export async function getProjectStepState(
  client: TypedSupabaseClient,
  projectId: string
): Promise<ProjectStepState> {
  // Load competitors and project inputs in parallel
  const [competitors, inputResult] = await Promise.all([
    listCompetitorsForProject(client, projectId).catch(() => []),
    getLatestProjectInput(client, projectId).catch(() => ({ ok: false as const, error: { code: 'UNKNOWN', message: 'Failed to load inputs' } })),
  ])

  const competitorsCount = Array.isArray(competitors) ? competitors.length : 0
  
  // Extract suggested competitor names and confirmation status from inputs
  let hasSuggestedCompetitors = false
  let competitorsConfirmed = false
  let competitorsConfirmedAt: string | null = null

  if (inputResult.ok && inputResult.data?.input_json) {
    const inputs = inputResult.data.input_json as Record<string, any>
    
    // Check for suggested competitors
    if (Array.isArray(inputs.suggestedCompetitorNames) && inputs.suggestedCompetitorNames.length > 0) {
      hasSuggestedCompetitors = true
    }
    
    // Check for explicit confirmation (both timestamp and boolean flag supported)
    if (inputs.competitorsConfirmedAt) {
      competitorsConfirmed = true
      competitorsConfirmedAt = typeof inputs.competitorsConfirmedAt === 'string' 
        ? inputs.competitorsConfirmedAt 
        : null
    } else if (inputs.competitorsConfirmed === true) {
      competitorsConfirmed = true
    }
  }

  // Compute current step based on state machine rules
  // Step 2 is complete only if BOTH confirmed AND has competitors
  const step2Complete = competitorsConfirmed && competitorsCount > 0
  
  // Current step: if Step 2 is complete, we're on Step 3, else Step 2
  // (Step 1 is always complete once project exists)
  const currentStep: 1 | 2 | 3 = step2Complete ? 3 : 2

  const canProceedToStep3 = step2Complete

  return {
    hasSuggestedCompetitors,
    competitorsCount,
    competitorsConfirmed,
    competitorsConfirmedAt,
    currentStep,
    canProceedToStep3,
  }
}

/**
 * Dev-only helper to log step state for debugging
 */
export function logStepState(projectId: string, state: ProjectStepState, context: string) {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('[flow] step state', {
      projectId,
      context,
      ...state,
    })
  }
}

