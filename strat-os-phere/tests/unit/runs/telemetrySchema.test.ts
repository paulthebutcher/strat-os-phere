/**
 * Tests for telemetry schema validation and merging
 */

import { describe, it, expect } from 'vitest'
import {
  parseTelemetry,
  mergeTelemetry,
  serializeTelemetry,
  sanitizeTelemetryError,
  type RunTelemetry,
} from '@/lib/runs/telemetrySchema'

describe('telemetrySchema', () => {
  describe('parseTelemetry', () => {
    it('returns default telemetry for null/undefined', () => {
      const result1 = parseTelemetry(null)
      expect(result1.timeline.createdAt).toBeDefined()
      
      const result2 = parseTelemetry(undefined, '2024-01-01T00:00:00Z')
      expect(result2.timeline.createdAt).toBe('2024-01-01T00:00:00Z')
    })

    it('parses valid telemetry', () => {
      const valid = {
        timeline: {
          createdAt: '2024-01-01T00:00:00Z',
          startedAt: '2024-01-01T00:01:00Z',
        },
        counters: {
          evidence: {
            sourcesFound: 10,
            sourcesFetched: 8,
            sourcesSaved: 8,
          },
        },
      }
      const result = parseTelemetry(valid)
      expect(result.timeline.createdAt).toBe('2024-01-01T00:00:00Z')
      expect(result.timeline.startedAt).toBe('2024-01-01T00:01:00Z')
      expect(result.counters?.evidence?.sourcesFound).toBe(10)
    })
  })

  describe('sanitizeTelemetryError', () => {
    it('truncates long messages', () => {
      const longMessage = 'a'.repeat(2000)
      const result = sanitizeTelemetryError({
        code: 'ERROR',
        message: longMessage,
      })
      expect(result.message.length).toBeLessThanOrEqual(1000)
      expect(result.message.endsWith('...')).toBe(true)
    })

    it('truncates long codes', () => {
      const longCode = 'a'.repeat(200)
      const result = sanitizeTelemetryError({
        code: longCode,
        message: 'test',
      })
      expect(result.code.length).toBeLessThanOrEqual(100)
    })

    it('preserves structure', () => {
      const error = {
        code: 'TEST_ERROR',
        message: 'Test message',
        requestId: 'req-123',
        step: 'evidence',
        upstream: 'tavily',
        details: { key: 'value' },
      }
      const result = sanitizeTelemetryError(error)
      expect(result.code).toBe('TEST_ERROR')
      expect(result.message).toBe('Test message')
      expect(result.requestId).toBe('req-123')
      expect(result.step).toBe('evidence')
      expect(result.upstream).toBe('tavily')
      expect(result.details).toBeDefined()
      expect(result.at).toBeDefined()
    })
  })

  describe('mergeTelemetry', () => {
    it('merges timeline steps', () => {
      const current: RunTelemetry = {
        timeline: {
          createdAt: '2024-01-01T00:00:00Z',
          steps: {
            evidence: {
              status: 'running',
              startedAt: '2024-01-01T00:01:00Z',
              attempts: 1,
            },
          },
        },
      }
      const patch: Partial<RunTelemetry> = {
        timeline: {
          createdAt: '2024-01-01T00:00:00Z',
          steps: {
            evidence: {
              status: 'completed',
              startedAt: '2024-01-01T00:01:00Z',
              finishedAt: '2024-01-01T00:02:00Z',
              durationMs: 60000,
              attempts: 1,
            },
          },
        },
      }
      const result = mergeTelemetry(current, patch)
      expect(result.timeline.steps?.evidence?.status).toBe('completed')
      expect(result.timeline.steps?.evidence?.durationMs).toBe(60000)
      expect(result.timeline.createdAt).toBe('2024-01-01T00:00:00Z') // Preserved from current
    })

    it('merges counters', () => {
      const current: RunTelemetry = {
        timeline: {
          createdAt: '2024-01-01T00:00:00Z',
        },
        counters: {
          evidence: {
            sourcesFound: 5,
            sourcesFetched: 4,
          },
        },
      }
      const patch: Partial<RunTelemetry> = {
        counters: {
          evidence: {
            sourcesSaved: 4,
          },
        },
      }
      const result = mergeTelemetry(current, patch)
      expect(result.counters?.evidence?.sourcesFound).toBe(5) // From current
      expect(result.counters?.evidence?.sourcesFetched).toBe(4) // From current
      expect(result.counters?.evidence?.sourcesSaved).toBe(4) // From patch
    })
  })

  describe('serializeTelemetry', () => {
    it('returns valid telemetry structure', () => {
      const telemetry: RunTelemetry = {
        timeline: {
          createdAt: '2024-01-01T00:00:00Z',
          startedAt: '2024-01-01T00:01:00Z',
          steps: {
            evidence: {
              status: 'completed',
              startedAt: '2024-01-01T00:01:00Z',
              finishedAt: '2024-01-01T00:02:00Z',
              durationMs: 60000,
              attempts: 1,
            },
          },
        },
        counters: {
          evidence: {
            sourcesFound: 10,
          },
        },
      }
      const result = serializeTelemetry(telemetry)
      expect(result.timeline.createdAt).toBe('2024-01-01T00:00:00Z')
      expect(result.timeline.steps?.evidence?.status).toBe('completed')
    })
  })
})

