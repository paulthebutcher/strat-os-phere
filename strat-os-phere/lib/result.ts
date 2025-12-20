import { AppError } from './errors'

/**
 * Result type for operations that can succeed or fail
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError }

export function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function err(error: AppError | string, code = 'UNKNOWN_ERROR'): Result<never> {
  if (typeof error === 'string') {
    return { ok: false, error: new AppError(code, error) }
  }
  return { ok: false, error }
}

