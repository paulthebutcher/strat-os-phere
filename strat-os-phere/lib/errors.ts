/**
 * Application error types and utilities for consistent error handling
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public cause?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function toAppError(error: unknown, defaultCode = 'UNKNOWN_ERROR'): AppError {
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(defaultCode, error.message, error)
  }
  
  return new AppError(defaultCode, String(error), error)
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

