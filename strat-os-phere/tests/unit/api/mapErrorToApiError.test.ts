/**
 * Error Mapping Tests
 * 
 * Tests for mapErrorToApiError function that maps various error types
 * to canonical ApiError responses
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  mapErrorToApiError,
  mapErrorToApiResponse,
} from '@/lib/api/mapErrorToApiError'
import {
  SchemaMismatchError,
  UnauthorizedError,
  NotFoundError,
  NotReadyError,
  ExternalFetchError,
} from '@/lib/errors/errors'
import { generateRequestId } from '@/lib/api/routeGuard'

describe('mapErrorToApiError', () => {
  const requestId = generateRequestId()

  describe('Zod errors', () => {
    it('maps Zod validation errors to VALIDATION_ERROR', () => {
      const schema = z.object({ projectId: z.string().uuid() })
      const result = schema.safeParse({ projectId: 'invalid' })
      
      if (!result.success) {
        const mapped = mapErrorToApiError(result.error, requestId)
        
        expect(mapped.code).toBe('VALIDATION_ERROR')
        expect(mapped.statusCode).toBe(400)
        expect(mapped.message).toBe('Request validation failed')
      }
    })
  })

  describe('AppError mapping', () => {
    it('maps UnauthorizedError to UNAUTHENTICATED', () => {
      const error = new UnauthorizedError('Not authenticated')
      const mapped = mapErrorToApiError(error, requestId)
      
      expect(mapped.code).toBe('UNAUTHENTICATED')
      expect(mapped.statusCode).toBe(401)
    })

    it('maps NotFoundError to NOT_FOUND', () => {
      const error = new NotFoundError('Not found')
      const mapped = mapErrorToApiError(error, requestId)
      
      expect(mapped.code).toBe('NOT_FOUND')
      expect(mapped.statusCode).toBe(404)
    })

    it('maps SchemaMismatchError to SCHEMA_MISMATCH', () => {
      const error = new SchemaMismatchError('Schema mismatch')
      const mapped = mapErrorToApiError(error, requestId)
      
      expect(mapped.code).toBe('SCHEMA_MISMATCH')
      expect(mapped.statusCode).toBe(400)
    })

    it('maps NotReadyError to NOT_READY', () => {
      const error = new NotReadyError('Not ready')
      const mapped = mapErrorToApiError(error, requestId)
      
      expect(mapped.code).toBe('NOT_READY')
      expect(mapped.statusCode).toBe(422)
    })

    it('maps ExternalFetchError with timeout to UPSTREAM_TIMEOUT', () => {
      const error = new ExternalFetchError('Request timeout')
      const mapped = mapErrorToApiError(error, requestId)
      
      expect(mapped.code).toBe('UPSTREAM_TIMEOUT')
      expect(mapped.statusCode).toBe(504)
    })

    it('maps ExternalFetchError with rate limit to UPSTREAM_RATE_LIMIT', () => {
      const error = new ExternalFetchError('Rate limit exceeded')
      const mapped = mapErrorToApiError(error, requestId)
      
      expect(mapped.code).toBe('UPSTREAM_RATE_LIMIT')
      expect(mapped.statusCode).toBe(504)
    })
  })

  describe('Generic errors', () => {
    it('maps generic Error to INTERNAL_ERROR', () => {
      const error = new Error('Something went wrong')
      const mapped = mapErrorToApiError(error, requestId)
      
      expect(mapped.code).toBe('INTERNAL_ERROR')
      expect(mapped.statusCode).toBe(500)
    })

    it('includes context in details', () => {
      const error = new Error('Error')
      const context = { projectId: '123', route: '/api/test' }
      const mapped = mapErrorToApiError(error, requestId, context)
      
      expect(mapped.details).toMatchObject(context)
    })
  })

  describe('mapErrorToApiResponse', () => {
    it('returns ApiError response with requestId', () => {
      const error = new UnauthorizedError('Not authenticated')
      const { response, statusCode } = mapErrorToApiResponse(error, requestId)
      
      expect(response.ok).toBe(false)
      expect(response.error.code).toBe('UNAUTHENTICATED')
      expect(response.error.requestId).toBe(requestId)
      expect(statusCode).toBe(401)
    })

    it('includes details in error response', () => {
      const error = new Error('Error')
      const context = { projectId: '123' }
      const { response } = mapErrorToApiResponse(error, requestId, context)
      
      expect(response.ok).toBe(false)
      expect(response.error.details).toMatchObject(context)
    })
  })
})

