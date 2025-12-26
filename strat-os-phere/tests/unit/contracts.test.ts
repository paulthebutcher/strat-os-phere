/**
 * Contract Tests
 * 
 * Minimal tests to ensure contracts are working correctly.
 * These tests should fail loudly if contracts break.
 */

import { describe, it, expect } from 'vitest'
import {
  RunStatusSchema,
  OpportunitySchema,
  EvidenceSourceSchema,
  ArtifactSchema,
} from '@/lib/contracts/domain'
import { ok, fail, parseOrFail } from '@/lib/contracts/api'
import { ErrorCodeSchema } from '@/lib/contracts/errors'

describe('Domain Contracts', () => {
  describe('RunStatusSchema', () => {
    it('validates a valid run status', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        projectId: '123e4567-e89b-12d3-a456-426614174001',
        state: 'running',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:35:00Z',
      }
      
      const result = RunStatusSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })
    
    it('rejects invalid state', () => {
      const invalid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        projectId: '123e4567-e89b-12d3-a456-426614174001',
        state: 'invalid',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:35:00Z',
      }
      
      const result = RunStatusSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
  
  describe('OpportunitySchema', () => {
    it('validates a minimal opportunity', () => {
      const valid = {
        id: 'test-opportunity',
        title: 'Test Opportunity',
      }
      
      const result = OpportunitySchema.safeParse(valid)
      expect(result.success).toBe(true)
    })
    
    it('validates a full opportunity', () => {
      const valid = {
        id: 'test-opportunity',
        title: 'Test Opportunity',
        oneLiner: 'A test opportunity',
        whyNow: 'Market conditions changed',
        confidence: {
          coverage_score: 75,
          evidence_strength: 80,
        },
        score: 85,
        assumptions: ['Assumption 1'],
        risks: ['Risk 1'],
      }
      
      const result = OpportunitySchema.safeParse(valid)
      expect(result.success).toBe(true)
    })
  })
  
  describe('EvidenceSourceSchema', () => {
    it('validates a valid evidence source', () => {
      const valid = {
        url: 'https://example.com',
        title: 'Example Page',
        snippet: 'Some content',
      }
      
      const result = EvidenceSourceSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })
    
    it('rejects invalid URL', () => {
      const invalid = {
        url: 'not-a-url',
      }
      
      const result = EvidenceSourceSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
  
  describe('ArtifactSchema', () => {
    it('validates a valid artifact', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        projectId: '123e4567-e89b-12d3-a456-426614174001',
        type: 'opportunities_v3',
        createdAt: '2024-01-15T10:30:00Z',
        payload: { meta: {}, opportunities: [] },
      }
      
      const result = ArtifactSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })
  })
})

describe('API Contracts', () => {
  describe('ok()', () => {
    it('creates a success response', () => {
      const response = ok({ data: 'test' })
      expect(response).toEqual({
        ok: true,
        data: { data: 'test' },
      })
    })
  })
  
  describe('fail()', () => {
    it('creates an error response', () => {
      const response = fail('NOT_FOUND', 'Resource not found', { id: '123' })
      expect(response).toEqual({
        ok: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          details: { id: '123' },
        },
      })
    })
  })
  
  describe('parseOrFail()', () => {
    it('returns success for valid data', () => {
      const schema = RunStatusSchema
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        projectId: '123e4567-e89b-12d3-a456-426614174001',
        state: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:35:00Z',
      }
      
      const result = parseOrFail(schema, valid)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.state).toBe('completed')
      }
    })
    
    it('returns error for invalid data', () => {
      const schema = RunStatusSchema
      const invalid = { invalid: 'data' }
      
      const result = parseOrFail(schema, invalid)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('SCHEMA_MISMATCH')
      }
    })
  })
})

describe('Error Codes', () => {
  it('validates all error codes', () => {
    const validCodes = [
      'UNAUTHENTICATED',
      'FORBIDDEN',
      'NOT_FOUND',
      'VALIDATION_ERROR',
      'SCHEMA_MISMATCH',
      'NOT_READY',
      'UPSTREAM_TIMEOUT',
      'UPSTREAM_RATE_LIMIT',
      'INTERNAL_ERROR',
    ]
    
    for (const code of validCodes) {
      const result = ErrorCodeSchema.safeParse(code)
      expect(result.success).toBe(true)
    }
  })
  
  it('rejects invalid error codes', () => {
    const invalid = 'INVALID_CODE'
    const result = ErrorCodeSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

