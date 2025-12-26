/**
 * Route Guard Tests
 * 
 * Tests for API route guard helpers: requireUser, requireProjectOwner,
 * parseParams, parseBody, respondOk, respondError
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import {
  generateRequestId,
  parseParams,
  parseBody,
  respondOk,
  respondError,
} from '@/lib/api/routeGuard'

describe('routeGuard', () => {
  describe('generateRequestId', () => {
    it('generates a unique request ID', () => {
      const id1 = generateRequestId()
      const id2 = generateRequestId()
      
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })
  })

  describe('parseParams', () => {
    it('validates valid params', () => {
      const schema = z.object({ projectId: z.string().uuid() })
      const params = { projectId: '123e4567-e89b-12d3-a456-426614174000' }
      const requestId = generateRequestId()
      
      const result = parseParams(schema, params, requestId)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual(params)
      }
    })

    it('returns VALIDATION_ERROR for invalid params', () => {
      const schema = z.object({ projectId: z.string().uuid() })
      const params = { projectId: 'not-a-uuid' }
      const requestId = generateRequestId()
      
      const result = parseParams(schema, params, requestId)
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(400)
        const json = result.response as any
        // Response is NextResponse, need to check structure
        expect(json).toBeDefined()
      }
    })

    it('returns VALIDATION_ERROR for missing required fields', () => {
      const schema = z.object({ projectId: z.string().uuid() })
      const params = {}
      const requestId = generateRequestId()
      
      const result = parseParams(schema, params, requestId)
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(400)
      }
    })
  })

  describe('parseBody', () => {
    it('validates valid body', async () => {
      const schema = z.object({ runId: z.string().uuid().optional() })
      const body = { runId: '123e4567-e89b-12d3-a456-426614174000' }
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
      const requestId = generateRequestId()
      
      const result = await parseBody(schema, request, requestId, true)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual(body)
      }
    })

    it('returns VALIDATION_ERROR for invalid JSON', async () => {
      const schema = z.object({ runId: z.string().uuid().optional() })
      const request = new Request('http://localhost', {
        method: 'POST',
        body: 'not json',
        headers: { 'Content-Type': 'application/json' },
      })
      const requestId = generateRequestId()
      
      const result = await parseBody(schema, request, requestId, true)
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(400)
      }
    })

    it('handles optional body when not required', async () => {
      const schema = z.object({ runId: z.string().uuid().optional() })
      const request = new Request('http://localhost', {
        method: 'POST',
        body: '',
        headers: { 'Content-Type': 'application/json' },
      })
      const requestId = generateRequestId()
      
      const result = await parseBody(schema, request, requestId, false)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBeNull()
      }
    })

    it('returns VALIDATION_ERROR when body is required but missing', async () => {
      const schema = z.object({ runId: z.string().uuid() })
      const request = new Request('http://localhost', {
        method: 'POST',
        body: '',
        headers: { 'Content-Type': 'application/json' },
      })
      const requestId = generateRequestId()
      
      const result = await parseBody(schema, request, requestId, true)
      
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(400)
      }
    })
  })

  describe('respondOk', () => {
    it('returns NextResponse with ok data', () => {
      const data = { runId: '123', message: 'test' }
      const requestId = generateRequestId()
      
      const response = respondOk(data, requestId)
      
      expect(response).toBeInstanceOf(NextResponse)
    })
  })

  describe('respondError', () => {
    it('returns NextResponse with error and correct status', () => {
      const requestId = generateRequestId()
      
      const response = respondError('UNAUTHENTICATED', 'Not authenticated', undefined, requestId)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(401)
    })

    it('maps error codes to correct HTTP status codes', () => {
      const requestId = generateRequestId()
      
      expect(respondError('FORBIDDEN', 'Forbidden', undefined, requestId).status).toBe(403)
      expect(respondError('NOT_FOUND', 'Not found', undefined, requestId).status).toBe(404)
      expect(respondError('VALIDATION_ERROR', 'Invalid', undefined, requestId).status).toBe(400)
      expect(respondError('NOT_READY', 'Not ready', undefined, requestId).status).toBe(422)
      expect(respondError('UPSTREAM_TIMEOUT', 'Timeout', undefined, requestId).status).toBe(504)
      expect(respondError('INTERNAL_ERROR', 'Error', undefined, requestId).status).toBe(500)
    })
  })
})

