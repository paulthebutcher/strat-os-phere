/**
 * Canonical Result type and helpers for safe error handling
 * 
 * This module provides a standardized Result type and type guards to prevent
 * "error drift" where different parts of the codebase assume different result shapes.
 * 
 * Usage:
 *   import { isOk, isErr, errToString } from '@/lib/results/result'
 *   
 *   const result = await someOperation()
 *   if (isErr(result)) {
 *     logger.error(errToString(result.error))
 *     return
 *   }
 *   // TypeScript now knows result is Ok<T>
 *   use(result.data)
 */

export type Ok<T> = { ok: true; data: T }
export type Err<E = unknown> = { ok: false; error: E }

export type Result<T, E = unknown> = Ok<T> | Err<E>

/**
 * Type guard to check if a result is successful
 */
export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
  return r.ok === true
}

/**
 * Type guard to check if a result is an error
 */
export function isErr<T, E>(r: Result<T, E>): r is Err<E> {
  return r.ok === false
}

/**
 * Safe stringification for logs/UI
 * Handles various error shapes gracefully
 */
export function errToString(err: unknown): string {
  if (!err) return 'unknown_error'
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  
  // Handle structured error objects
  if (typeof err === 'object' && err !== null) {
    if ('message' in err && typeof err.message === 'string') {
      return err.message
    }
    if ('code' in err && typeof err.code === 'string') {
      return err.code
    }
  }
  
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

/**
 * Extract error details from a result for logging
 * Returns a safe string representation of the error
 */
export function getErrDetails<T, E>(result: Result<T, E>): string {
  if (isOk(result)) {
    return 'unexpected_ok_state'
  }
  return errToString(result.error)
}

