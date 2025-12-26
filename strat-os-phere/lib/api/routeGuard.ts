/**
 * API Route Guard and Validation Helpers
 * 
 * Centralized helpers for securing API endpoints:
 * - Auth enforcement (requireUser)
 * - Ownership verification (requireProjectOwner)
 * - Request validation (parseParams, parseBody)
 * - Consistent responses (respondOk, respondError)
 * - Request ID generation for debugging
 */

import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { ok, fail } from '@/lib/contracts/api'
import type { ApiResponse } from '@/lib/contracts/api.types'
import type { ErrorCode } from '@/lib/contracts/errors'
import { getProjectById } from '@/lib/data/projects'
import { logger } from '@/lib/logger'
import { randomUUID } from 'crypto'

/**
 * Generate a unique request ID for tracking requests in logs/errors
 */
export function generateRequestId(): string {
  return randomUUID()
}

/**
 * Authenticated user context
 */
export interface AuthenticatedContext {
  user: { id: string }
  supabase: TypedSupabaseClient
  requestId: string
}

/**
 * Require user authentication
 * Returns authenticated context or ApiError response
 */
export async function requireUser(
  requestId: string
): Promise<
  | { ok: true; value: AuthenticatedContext }
  | { ok: false; response: NextResponse<ApiResponse<never>> }
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser()

    if (getUserError || !user) {
      logger.warn('[requireUser] Unauthenticated request', {
        requestId,
        error: getUserError?.message,
      })
      return {
        ok: false,
        response: NextResponse.json(
          fail('UNAUTHENTICATED', 'You must be signed in to access this endpoint', undefined, requestId),
          { status: 401 }
        ),
      }
    }

    return {
      ok: true,
      value: {
        user: { id: user.id },
        supabase,
        requestId,
      },
    }
  } catch (error) {
    logger.error('[requireUser] Error checking authentication', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return {
      ok: false,
      response: NextResponse.json(
        fail('INTERNAL_ERROR', 'Failed to verify authentication', undefined, requestId),
        { status: 500 }
      ),
    }
  }
}

/**
 * Require project ownership
 * Checks that the user owns the project via RLS-safe query
 */
export async function requireProjectOwner(
  ctx: AuthenticatedContext,
  projectId: string
): Promise<
  | { ok: true }
  | { ok: false; response: NextResponse<ApiResponse<never>> }
> {
  try {
    const project = await getProjectById(ctx.supabase, projectId)

    if (!project) {
      logger.warn('[requireProjectOwner] Project not found', {
        requestId: ctx.requestId,
        projectId,
        userId: ctx.user.id,
      })
      return {
        ok: false,
        response: NextResponse.json(
          fail('NOT_FOUND', 'Project not found', { projectId }, ctx.requestId),
          { status: 404 }
        ),
      }
    }

    if (project.user_id !== ctx.user.id) {
      logger.warn('[requireProjectOwner] Access denied - not owner', {
        requestId: ctx.requestId,
        projectId,
        userId: ctx.user.id,
        projectOwnerId: project.user_id,
      })
      return {
        ok: false,
        response: NextResponse.json(
          fail('FORBIDDEN', 'You do not have access to this project', { projectId }, ctx.requestId),
          { status: 403 }
        ),
      }
    }

    return { ok: true }
  } catch (error) {
    logger.error('[requireProjectOwner] Error checking ownership', {
      requestId: ctx.requestId,
      projectId,
      error: error instanceof Error ? error.message : String(error),
    })
    return {
      ok: false,
      response: NextResponse.json(
        fail('INTERNAL_ERROR', 'Failed to verify project ownership', { projectId }, ctx.requestId),
        { status: 500 }
      ),
    }
  }
}

/**
 * Parse and validate route params against a Zod schema
 */
export function parseParams<T>(
  schema: z.ZodSchema<T>,
  params: unknown,
  requestId: string
): { ok: true; value: T } | { ok: false; response: NextResponse<ApiResponse<never>> } {
  try {
    const result = schema.safeParse(params)

    if (!result.success) {
      logger.warn('[parseParams] Validation failed', {
        requestId,
        errors: result.error.errors,
      })
      return {
        ok: false,
        response: NextResponse.json(
          fail(
            'VALIDATION_ERROR',
            'Invalid request parameters',
            { errors: result.error.errors },
            requestId
          ),
          { status: 400 }
        ),
      }
    }

    return { ok: true, value: result.data }
  } catch (error) {
    logger.error('[parseParams] Error parsing params', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return {
      ok: false,
      response: NextResponse.json(
        fail('INTERNAL_ERROR', 'Failed to parse parameters', undefined, requestId),
        { status: 500 }
      ),
    }
  }
}

/**
 * Parse and validate request body against a Zod schema
 * Handles empty/optional bodies gracefully
 */
export async function parseBody<T>(
  schema: z.ZodSchema<T>,
  request: Request,
  requestId: string,
  required = true
): Promise<
  | { ok: true; value: T | null }
  | { ok: false; response: NextResponse<ApiResponse<never>> }
> {
  try {
    const rawBody = await request.text()

    // Handle empty body
    if (!rawBody || rawBody.trim() === '') {
      if (required) {
        return {
          ok: false,
          response: NextResponse.json(
            fail('VALIDATION_ERROR', 'Request body is required', undefined, requestId),
            { status: 400 }
          ),
        }
      }
      return { ok: true, value: null }
    }

    // Parse JSON
    let jsonBody: unknown
    try {
      jsonBody = JSON.parse(rawBody)
    } catch (parseError) {
      logger.warn('[parseBody] Invalid JSON', {
        requestId,
        error: parseError instanceof Error ? parseError.message : String(parseError),
      })
      return {
        ok: false,
        response: NextResponse.json(
          fail('VALIDATION_ERROR', 'Invalid JSON in request body', undefined, requestId),
          { status: 400 }
        ),
      }
    }

    // Validate against schema
    const result = schema.safeParse(jsonBody)

    if (!result.success) {
      logger.warn('[parseBody] Validation failed', {
        requestId,
        errors: result.error.errors,
      })
      return {
        ok: false,
        response: NextResponse.json(
          fail(
            'VALIDATION_ERROR',
            'Invalid request body',
            { errors: result.error.errors },
            requestId
          ),
          { status: 400 }
        ),
      }
    }

    return { ok: true, value: result.data }
  } catch (error) {
    logger.error('[parseBody] Error parsing body', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return {
      ok: false,
      response: NextResponse.json(
        fail('INTERNAL_ERROR', 'Failed to parse request body', undefined, requestId),
        { status: 500 }
      ),
    }
  }
}

/**
 * Respond with success (200 OK)
 */
export function respondOk<T>(
  data: T,
  requestId?: string
): NextResponse<ApiResponse<T>> {
  // Note: requestId is included in error responses, not success responses
  // But we can log it for correlation
  if (requestId) {
    logger.debug('[respondOk]', { requestId })
  }
  return NextResponse.json(ok(data))
}

/**
 * Respond with error
 */
export function respondError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string,
  statusCode?: number
): NextResponse<ApiResponse<never>> {
  logger.warn('[respondError]', {
    code,
    message,
    requestId,
    details,
  })

  const status = statusCode || getStatusForErrorCode(code)
  return NextResponse.json(fail(code, message, details, requestId), { status })
}

/**
 * Helper to map error code to HTTP status
 */
function getStatusForErrorCode(code: ErrorCode): number {
  switch (code) {
    case 'UNAUTHENTICATED':
      return 401
    case 'FORBIDDEN':
      return 403
    case 'NOT_FOUND':
      return 404
    case 'VALIDATION_ERROR':
    case 'SCHEMA_MISMATCH':
      return 400
    case 'NOT_READY':
      return 422
    case 'UPSTREAM_TIMEOUT':
    case 'UPSTREAM_RATE_LIMIT':
      return 504
    case 'INTERNAL_ERROR':
    default:
      return 500
  }
}

