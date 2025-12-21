import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseStore, createMockSupabaseClient } from '../mocks/supabase'
import { assertHasCompetitors, assertHasCompetitorProfiles } from '@/lib/results/prerequisites'
import { AppError } from '@/lib/errors'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'

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
        type: 'profiles' as any,
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
        type: 'profiles' as any,
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
})

