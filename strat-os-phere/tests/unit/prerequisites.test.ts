import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseStore, createMockSupabaseClient } from '../mocks/supabase'
import { assertHasCompetitors, assertHasCompetitorProfiles, COMPETITOR_PROFILE_ARTIFACT_TYPES } from '@/lib/results/prerequisites'
import { AppError } from '@/lib/errors'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import type { ArtifactType } from '@/lib/artifacts/registry'

describe('Prerequisites', () => {
  let store: MockSupabaseStore
  let client: ReturnType<typeof createMockSupabaseClient>
  const userId = 'test-user-123'

  beforeEach(() => {
    store = new MockSupabaseStore()
    store.setUser(userId, 'test@example.com')
    client = createMockSupabaseClient(store, userId)
  })

  describe('assertHasCompetitors', () => {
    it('should pass when project has enough competitors', async () => {
      const project = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
      })

      // Create minimum required competitors
      for (let i = 0; i < MIN_COMPETITORS_FOR_ANALYSIS; i++) {
        store.createCompetitor({
          project_id: project.id,
          name: `Competitor ${i + 1}`,
          url: `https://competitor${i + 1}.com`,
        })
      }

      // Should not throw
      await expect(assertHasCompetitors(client, project.id)).resolves.toBeUndefined()
    })

    it('should throw AppError with INSUFFICIENT_COMPETITORS when project has too few competitors', async () => {
      const project = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
      })

      // Create fewer than required
      store.createCompetitor({
        project_id: project.id,
        name: 'Competitor 1',
        url: 'https://competitor1.com',
      })

      try {
        await assertHasCompetitors(client, project.id)
        expect.fail('Expected assertHasCompetitors to throw')
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        expect((error as AppError).code).toBe('INSUFFICIENT_COMPETITORS')
      }
    })
  })

  describe('assertHasCompetitorProfiles', () => {
    it('should pass when profiles artifact exists with snapshots', async () => {
      const project = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
      })

      // Create competitors
      for (let i = 0; i < MIN_COMPETITORS_FOR_ANALYSIS; i++) {
        store.createCompetitor({
          project_id: project.id,
          name: `Competitor ${i + 1}`,
          url: `https://competitor${i + 1}.com`,
        })
      }

      // Create profiles artifact with snapshots
      store.createArtifact({
        project_id: project.id,
        type: 'profiles' as ArtifactType,
        content_json: {
          run_id: 'test-run-123',
          generated_at: new Date().toISOString(),
          competitor_count: MIN_COMPETITORS_FOR_ANALYSIS,
          snapshots: [
            {
              competitor_name: 'Competitor 1',
              positioning: 'Test positioning',
              differentiation_themes: [],
              customer_struggles: [],
            },
          ],
        },
      })

      // Should not throw
      await expect(assertHasCompetitorProfiles(client, project.id)).resolves.toBeUndefined()
    })

    it('should throw AppError with MISSING_COMPETITOR_PROFILES when profiles artifact does not exist', async () => {
      const project = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
      })

      // Create competitors but no profiles
      for (let i = 0; i < MIN_COMPETITORS_FOR_ANALYSIS; i++) {
        store.createCompetitor({
          project_id: project.id,
          name: `Competitor ${i + 1}`,
          url: `https://competitor${i + 1}.com`,
        })
      }

      try {
        await assertHasCompetitorProfiles(client, project.id)
        expect.fail('Expected assertHasCompetitorProfiles to throw')
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        expect((error as AppError).code).toBe('MISSING_COMPETITOR_PROFILES')
      }
    })

    it('should throw AppError with NO_SNAPSHOTS when profiles artifact exists but has no snapshots', async () => {
      const project = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
      })

      // Create competitors
      for (let i = 0; i < MIN_COMPETITORS_FOR_ANALYSIS; i++) {
        store.createCompetitor({
          project_id: project.id,
          name: `Competitor ${i + 1}`,
          url: `https://competitor${i + 1}.com`,
        })
      }

      // Create profiles artifact without snapshots
      store.createArtifact({
        project_id: project.id,
        type: 'profiles' as ArtifactType,
        content_json: {
          run_id: 'test-run-123',
          generated_at: new Date().toISOString(),
          competitor_count: 0,
          snapshots: [],
        },
      })

      try {
        await assertHasCompetitorProfiles(client, project.id)
        expect.fail('Expected assertHasCompetitorProfiles to throw')
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        expect((error as AppError).code).toBe('NO_SNAPSHOTS')
      }
    })
  })

  describe('COMPETITOR_PROFILE_ARTIFACT_TYPES constant', () => {
    it('should include the artifact type used by the generator', () => {
      // The generator uses type: 'profiles' (see app/projects/[projectId]/results/actions.ts:309)
      expect(COMPETITOR_PROFILE_ARTIFACT_TYPES).toContain('profiles')
    })

    it('should be used consistently in the gate function', async () => {
      const project = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
      })

      // Create competitors
      for (let i = 0; i < MIN_COMPETITORS_FOR_ANALYSIS; i++) {
        store.createCompetitor({
          project_id: project.id,
          name: `Competitor ${i + 1}`,
          url: `https://competitor${i + 1}.com`,
        })
      }

      // Create profiles artifact with type from constant
      const artifactType = COMPETITOR_PROFILE_ARTIFACT_TYPES[0]
      store.createArtifact({
        project_id: project.id,
        type: artifactType as ArtifactType,
        content_json: {
          run_id: 'test-run-123',
          generated_at: new Date().toISOString(),
          competitor_count: MIN_COMPETITORS_FOR_ANALYSIS,
          snapshots: [
            {
              competitor_name: 'Competitor 1',
              positioning: 'Test positioning',
              differentiation_themes: [],
              customer_struggles: [],
            },
          ],
        },
      })

      // Gate should pass because artifact type matches constant
      await expect(assertHasCompetitorProfiles(client, project.id)).resolves.toBeUndefined()
    })
  })

  describe('assertHasCompetitorProfiles - diagnostic details', () => {
    it('should include competitor counts in error details', async () => {
      const project = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
      })

      // Create 3 competitors
      for (let i = 0; i < 3; i++) {
        store.createCompetitor({
          project_id: project.id,
          name: `Competitor ${i + 1}`,
          url: `https://competitor${i + 1}.com`,
        })
      }

      try {
        await assertHasCompetitorProfiles(client, project.id)
        expect.fail('Expected assertHasCompetitorProfiles to throw')
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        const appError = error as AppError
        expect(appError.code).toBe('MISSING_COMPETITOR_PROFILES')
        expect(appError.cause).toBeDefined()
        const cause = appError.cause as Record<string, unknown>
        expect(cause.competitorCount).toBe(3)
        expect(cause.profilesFoundCount).toBe(0)
        expect(Array.isArray(cause.competitorIds)).toBe(true)
        expect(Array.isArray(cause.competitorNames)).toBe(true)
      }
    })

    it('should accept profiles from previous runs (not require specific run_id)', async () => {
      const project = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
      })

      // Create competitors
      for (let i = 0; i < MIN_COMPETITORS_FOR_ANALYSIS; i++) {
        store.createCompetitor({
          project_id: project.id,
          name: `Competitor ${i + 1}`,
          url: `https://competitor${i + 1}.com`,
        })
      }

      // Create profiles artifact with different run_id (old run)
      store.createArtifact({
        project_id: project.id,
        type: 'profiles' as ArtifactType,
        content_json: {
          run_id: 'old-run-456', // Different from any current run
          generated_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          competitor_count: MIN_COMPETITORS_FOR_ANALYSIS,
          snapshots: [
            {
              competitor_name: 'Competitor 1',
              positioning: 'Test positioning',
              differentiation_themes: [],
              customer_struggles: [],
            },
          ],
        },
      })

      // Gate should pass - profiles from previous runs are valid
      await expect(assertHasCompetitorProfiles(client, project.id)).resolves.toBeUndefined()
    })

    it('should handle multiple profile artifact formats', async () => {
      const project = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
      })

      // Create competitors
      for (let i = 0; i < MIN_COMPETITORS_FOR_ANALYSIS; i++) {
        store.createCompetitor({
          project_id: project.id,
          name: `Competitor ${i + 1}`,
          url: `https://competitor${i + 1}.com`,
        })
      }

      // Test format 1: { snapshots: [...] } - current format
      store.createArtifact({
        project_id: project.id,
        type: 'profiles' as ArtifactType,
        content_json: {
          run_id: 'test-run-123',
          snapshots: [
            {
              competitor_name: 'Competitor 1',
              positioning: 'Test positioning',
              differentiation_themes: [],
              customer_struggles: [],
            },
          ],
        },
      })

      // Gate should pass
      await expect(assertHasCompetitorProfiles(client, project.id)).resolves.toBeUndefined()
    })
  })
})

