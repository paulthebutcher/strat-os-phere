/**
 * Type-level test to ensure ProgressEvent meta type allows profilesCount
 * and rejects invalid types, while remaining extensible
 */

import { describe, it } from 'vitest'
import type { ProgressEvent } from '@/lib/results/progress'
import { makeProgressEvent } from '@/lib/results/progress'

describe('ProgressEvent meta type', () => {
  /**
   * Test that profilesCount is a valid meta field and is properly typed as number
   */
  function testProfilesCountInMeta(event: ProgressEvent): void {
    if (event.meta?.profilesCount !== undefined) {
      // Should be able to access profilesCount as a number
      const _profilesCount: number = event.meta.profilesCount
      void _profilesCount
    }
  }

  /**
   * Helper function that only accepts number - used to verify type checking
   */
  function requireNumber(value: number): number {
    return value
  }

  /**
   * Helper function that only accepts string - used to verify type checking rejects invalid types
   */
  function requireString(value: string): string {
    return value
  }

  /**
   * Test that meta remains extensible with additional fields
   */
  function testExtensibleMeta(event: ProgressEvent): void {
    if (event.meta) {
      // Known fields should be typed
      const _competitorCount: number | undefined = event.meta.competitorCount
      const _profilesCount: number | undefined = event.meta.profilesCount

      // Additional fields should be allowed (extensibility)
      const _customField: unknown = event.meta.customField
      const _anotherField: unknown = event.meta.anotherField

      void _competitorCount
      void _profilesCount
      void _customField
      void _anotherField
    }
  }

  it('should accept profilesCount in meta', () => {
    // This should compile successfully
    const event = makeProgressEvent('run-123', 'competitor_profiles', 'Test message', {
      meta: {
        profilesCount: 3,
        competitorCount: 5,
      },
    })

    testProfilesCountInMeta(event)
    expect(event.meta?.profilesCount).toBe(3)
  })

  it('should properly type profilesCount as number', () => {
    const event = makeProgressEvent('run-123', 'competitor_profiles', 'Test message', {
      meta: {
        profilesCount: 3,
      },
    })

    // Verify it's a number type at runtime
    if (event.meta?.profilesCount !== undefined) {
      const count: number = event.meta.profilesCount
      expect(typeof count).toBe('number')
      expect(count).toBe(3)
      
      // This should compile - profilesCount is a number
      requireNumber(event.meta.profilesCount)
    }
  })

  it('should reject invalid types for profilesCount at compile time', () => {
    // This test verifies TypeScript type checking rejects invalid types
    // The @ts-expect-error directive ensures we're testing that invalid usage is caught
    
    // Create a helper that forces type checking
    function testInvalidType(): void {
      const event = makeProgressEvent('run-123', 'competitor_profiles', 'Test message', {
        meta: {
          profilesCount: 3, // Valid number
        },
      })

      if (event.meta?.profilesCount !== undefined) {
        // This should work - profilesCount is a number
        requireNumber(event.meta.profilesCount)
        
        // @ts-expect-error - profilesCount should be number, not string
        requireString(event.meta.profilesCount)
      }
    }
    
    // Just verify the function exists - TypeScript compilation is the real test
    expect(typeof testInvalidType).toBe('function')
  })

  it('should allow extensible meta fields', () => {
    // This should compile successfully - meta should accept additional fields
    const event = makeProgressEvent('run-123', 'load_input', 'Test message', {
      meta: {
        competitorCount: 3,
        profilesCount: 2,
        customField: 'custom value',
        anotherField: 123,
      },
    })

    testExtensibleMeta(event)
    expect(event.meta?.customField).toBe('custom value')
    expect(event.meta?.anotherField).toBe(123)
  })

  it('should maintain backwards compatibility with existing meta fields', () => {
    // All existing meta fields should still work
    const event = makeProgressEvent('run-123', 'jobs_generate', 'Test message', {
      meta: {
        competitorCount: 5,
        artifactCount: 4,
        llmCallsDone: 1,
        llmCallsTotal: 3,
        repairsUsed: 0,
        writesDone: 2,
        writesTotal: 4,
        durationMs: 1000,
        substep: 'validation',
        current: 1,
        total: 3,
        competitorId: 'comp-123',
        competitorName: 'Competitor Name',
      },
    })

    expect(event.meta?.competitorCount).toBe(5)
    expect(event.meta?.artifactCount).toBe(4)
    expect(event.meta?.substep).toBe('validation')
  })
})

