/**
 * System Invariants - Runtime guards for system invariants
 * 
 * Provides helpers to enforce system invariants (see docs/principles/SystemInvariants.md).
 * In production, violations log warnings but don't throw. In development/test, can throw for faster feedback.
 */

import { logger } from '@/lib/logger'

/**
 * Invariant ID type matching SystemInvariants.md
 */
export type InvariantId = 'INV-1' | 'INV-2' | 'INV-3' | 'INV-4' | 'INV-5'

/**
 * Context information for invariant violation logging
 */
export interface InvariantContext {
  /**
   * Which invariant was violated (INV-1 through INV-5)
   */
  invariantId: InvariantId
  
  /**
   * Project ID if available
   */
  projectId?: string
  
  /**
   * Route or context path where violation occurred
   */
  route?: string
  
  /**
   * Additional context string
   */
  context?: string
  
  /**
   * Safe details (no PII) about the violation
   */
  details: {
    message: string
    [key: string]: unknown
  }
}

/**
 * Check an invariant condition
 * 
 * @param condition - The condition that must be true for the invariant to hold
 * @param info - Context information about the invariant check
 * @returns true if invariant holds, false if violated
 * 
 * Behavior:
 * - In production: Returns false and logs structured warning (does NOT throw)
 * - In development/test: Returns false and logs warning (can throw if DEBUG_INVARIANTS=throw)
 * 
 * Usage:
 * ```typescript
 * const isValid = invariant(
 *   evidenceSources.length > 0,
 *   {
 *     invariantId: 'INV-1',
 *     projectId,
 *     context: 'evidence_check',
 *     details: { message: 'No evidence sources found' }
 *   }
 * )
 * 
 * if (!isValid) {
 *   return { ok: false, error: { code: 'NOT_READY', message: '...' } }
 * }
 * ```
 */
export function invariant(
  condition: boolean,
  info: InvariantContext
): boolean {
  if (condition) {
    // Invariant holds - no action needed
    return true
  }

  // Invariant violated - log structured warning
  const logData = {
    type: 'invariant_violation' as const,
    invariantId: info.invariantId,
    ...(info.projectId && { projectId: info.projectId }),
    ...(info.route && { route: info.route }),
    ...(info.context && { context: info.context }),
    details: info.details,
  }

  // In development, allow throwing if explicitly requested (for tests)
  if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_INVARIANTS === 'throw') {
    logger.warn('Invariant violated (throwing in dev mode)', logData)
    throw new Error(`Invariant ${info.invariantId} violated: ${info.details.message}`)
  }

  // Default: log warning and return false (non-throwing)
  logger.warn(`Invariant ${info.invariantId} violated`, logData)
  return false
}

/**
 * Type helper for exhaustive checking
 * Ensures all cases are handled in switch/if-else statements
 * 
 * @param value - The value that should be exhaustively checked
 * @param message - Optional error message
 */
export function assertNever(value: never, message = 'Unexpected value'): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`)
}

