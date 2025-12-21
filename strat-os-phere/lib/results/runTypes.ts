/**
 * Error types for analysis run state machine
 * Defines discriminated union for error states
 */

/**
 * Error kind discriminator
 * - 'blocked': Pipeline is blocked due to missing prerequisites (e.g., no profiles)
 * - 'failed': Pipeline failed due to an error during execution
 */
export type RunErrorKind = 'blocked' | 'failed'

/**
 * Error state for analysis run
 * Uses discriminated union pattern with 'kind' as the discriminator
 */
export interface RunErrorState {
  kind: RunErrorKind
  message: string
  technicalDetails?: string
  code?: string
}

/**
 * Helper to determine error kind from error code
 */
export function getErrorKindFromCode(code?: string): RunErrorKind {
  if (
    code === 'MISSING_COMPETITOR_PROFILES' ||
    code === 'NO_SNAPSHOTS'
  ) {
    return 'blocked'
  }
  return 'failed'
}

/**
 * Helper to determine error kind from HTTP status code
 */
export function getErrorKindFromStatus(status: number): RunErrorKind {
  // 409 Conflict indicates prerequisite missing (blocked)
  if (status === 409) {
    return 'blocked'
  }
  return 'failed'
}

