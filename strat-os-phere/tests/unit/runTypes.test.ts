import { describe, it, expect } from 'vitest'
import {
  getErrorKindFromCode,
  getErrorKindFromStatus,
  type RunErrorKind,
} from '@/lib/results/runTypes'

describe('RunErrorKind helpers', () => {
  describe('getErrorKindFromCode', () => {
    it('returns "blocked" for MISSING_COMPETITOR_PROFILES', () => {
      const kind = getErrorKindFromCode('MISSING_COMPETITOR_PROFILES')
      expect(kind).toBe('blocked')
      const typedKind: RunErrorKind = kind
      expect(typedKind).toBe('blocked')
    })

    it('returns "blocked" for NO_SNAPSHOTS', () => {
      const kind = getErrorKindFromCode('NO_SNAPSHOTS')
      expect(kind).toBe('blocked')
    })

    it('returns "failed" for other error codes', () => {
      expect(getErrorKindFromCode('UNKNOWN_ERROR')).toBe('failed')
      expect(getErrorKindFromCode('INTERNAL_ERROR')).toBe('failed')
      expect(getErrorKindFromCode('VALIDATION_FAILED')).toBe('failed')
    })

    it('returns "failed" for undefined code', () => {
      expect(getErrorKindFromCode(undefined)).toBe('failed')
    })
  })

  describe('getErrorKindFromStatus', () => {
    it('returns "blocked" for 409 status', () => {
      const kind = getErrorKindFromStatus(409)
      expect(kind).toBe('blocked')
      const typedKind: RunErrorKind = kind
      expect(typedKind).toBe('blocked')
    })

    it('returns "failed" for other status codes', () => {
      expect(getErrorKindFromStatus(400)).toBe('failed')
      expect(getErrorKindFromStatus(500)).toBe('failed')
      expect(getErrorKindFromStatus(401)).toBe('failed')
      expect(getErrorKindFromStatus(403)).toBe('failed')
    })
  })
})

