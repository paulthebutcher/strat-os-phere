/**
 * Type-level test to ensure GenerateCompetitorProfilesResult is a valid discriminated union
 * This test verifies that TypeScript can properly narrow the union based on the 'ok' discriminator
 */

import { describe, it } from 'vitest'
import type { GenerateCompetitorProfilesResult } from '@/lib/results/generateCompetitorProfiles'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'

describe('GenerateCompetitorProfilesResult discriminated union', () => {
  /**
   * This function tests that TypeScript can properly narrow the union type
   * It should compile successfully if the discriminated union is correctly defined
   */
  function testDiscriminatedUnion(result: GenerateCompetitorProfilesResult): void {
    if (result.ok) {
      // On the true branch, we should be able to access success properties
      const _profilesArtifactId: string = result.profilesArtifactId
      const _snapshots: CompetitorSnapshot[] = result.snapshots
      const _runId: string = result.runId

      // @ts-expect-error - Should not be able to access error properties on success branch
      const _errorCode: string = result.error.code

      // Ensure we're using the variables to avoid unused variable warnings
      void _profilesArtifactId
      void _snapshots
      void _runId
      void _errorCode
    } else {
      // On the false branch, we should be able to access error properties
      const _errorCode: string = result.error.code
      const _errorMessage: string = result.error.message
      const _details: Record<string, unknown> | undefined = result.details

      // @ts-expect-error - Should not be able to access success properties on failure branch
      const _profilesArtifactId: string = result.profilesArtifactId

      // @ts-expect-error - Should not be able to access snapshots on failure branch
      const _snapshots: CompetitorSnapshot[] = result.snapshots

      // Ensure we're using the variables to avoid unused variable warnings
      void _errorCode
      void _errorMessage
      void _details
      void _profilesArtifactId
      void _snapshots
    }
  }

  it('should properly narrow the union type based on ok discriminator', () => {
    // This test passes if the code compiles
    // The function above will fail to compile if the discriminated union is not properly structured
    const successResult: GenerateCompetitorProfilesResult = {
      ok: true,
      runId: 'test-run-id',
      profilesArtifactId: 'artifact-123',
      snapshots: [],
    }

    const failureResult: GenerateCompetitorProfilesResult = {
      ok: false,
      error: {
        code: 'TEST_ERROR',
        message: 'Test error message',
      },
      details: { test: 'data' },
    }

    // These calls will fail TypeScript compilation if the discriminated union is broken
    testDiscriminatedUnion(successResult)
    testDiscriminatedUnion(failureResult)

    // If we get here, the type narrowing works correctly
    expect(true).toBe(true)
  })
})

