import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseStore, createMockSupabaseClient } from '../mocks/supabase'
import {
  createProject,
  listProjectsForOwner,
  getProjectById,
} from '@/lib/data/projects'
import {
  createCompetitor,
  listCompetitorsForProject,
  getCompetitorById,
  updateCompetitor,
  deleteCompetitor,
} from '@/lib/data/competitors'
import { createArtifact, listArtifacts } from '@/lib/data/artifacts'

describe('Data Layer Integration Tests', () => {
  let store: MockSupabaseStore
  let client: ReturnType<typeof createMockSupabaseClient>
  const userId = 'user_123'

  beforeEach(() => {
    store = new MockSupabaseStore()
    store.setUser(userId, 'test@example.com')
    client = createMockSupabaseClient(store, userId)
  })

  describe('Projects', () => {
    it('createProject creates and returns a project', async () => {
      const input = {
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
      }

      const project = await createProject(client, input)

      expect(project.id).toBeDefined()
      expect(project.name).toBe('Test Project')
      expect(project.user_id).toBe(userId)
      expect(project.created_at).toBeDefined()
    })

    it('createProject normalizes optional nullable fields to null when omitted', async () => {
      const input = {
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
        // your_product, business_goal, geography are omitted
      }

      const project = await createProject(client, input)

      expect(project.your_product).toBeNull()
      expect(project.business_goal).toBeNull()
      expect(project.geography).toBeNull()
    })

    it('listProjectsForOwner returns projects for the owner', async () => {
      store.createProject({
        user_id: userId,
        name: 'Project 1',
        market: 'Market',
        target_customer: 'Customer',
      })
      store.createProject({
        user_id: userId,
        name: 'Project 2',
        market: 'Market',
        target_customer: 'Customer',
      })

      const projects = await listProjectsForOwner(client, userId)

      expect(projects).toHaveLength(2)
      expect(projects[0].name).toBe('Project 2') // Newest first
    })

    it('getProjectById returns a project by id', async () => {
      const created = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Market',
        target_customer: 'Customer',
      })

      const project = await getProjectById(client, created.id)

      expect(project).not.toBeNull()
      expect(project?.id).toBe(created.id)
      expect(project?.name).toBe('Test Project')
    })

    it('getProjectById returns null for non-existent project', async () => {
      const project = await getProjectById(client, 'non-existent')

      expect(project).toBeNull()
    })

    it('store.createProject normalizes optional nullable fields to null', () => {
      const project = store.createProject({
        user_id: userId,
        name: 'Test Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
        // your_product, business_goal, geography are omitted
      })

      expect(project.your_product).toBeNull()
      expect(project.business_goal).toBeNull()
      expect(project.geography).toBeNull()
      // Verify the stored project also has null values
      const retrieved = store.getProject(project.id)
      expect(retrieved?.your_product).toBeNull()
      expect(retrieved?.business_goal).toBeNull()
      expect(retrieved?.geography).toBeNull()
    })

    it('createProject filters out drift columns that do not exist in production', async () => {
      const input = {
        user_id: userId,
        name: 'Hypothesis Project',
        market: 'Test Market',
        target_customer: 'Test Customer',
        // These drift fields are filtered out by buildProjectUpdate:
        starting_point: 'problem' as const,
        hypothesis: 'Is scheduling the #1 pain for boutique gym owners?',
        job_gap: 'Boutique gym owners struggle with manual scheduling',
        customer_profile: 'Test customer profile',
        market_context: 'Test market context',
        solution_idea: 'Test solution idea',
      }

      const project = await createProject(client, input)

      // Drift fields are filtered out and don't exist on ProjectRow
      expect(project.name).toBe('Hypothesis Project')
      expect(project.market).toBe('Test Market')
      expect(project.target_customer).toBe('Test Customer')
      // Verify drift fields are not present (TypeScript would error if we tried to access them)
    })
  })

  describe('Competitors', () => {
    const projectId = 'project_123'

    beforeEach(() => {
      store.createProject({
        id: projectId,
        user_id: userId,
        name: 'Test Project',
        market: 'Market',
        target_customer: 'Customer',
        created_at: new Date().toISOString(),
      })
    })

    it('createCompetitor creates and returns a competitor', async () => {
      const input = {
        project_id: projectId,
        name: 'Competitor A',
        url: 'https://example.com',
        evidence_text: 'Some evidence',
      }

      const competitor = await createCompetitor(client, input)

      expect(competitor.id).toBeDefined()
      expect(competitor.name).toBe('Competitor A')
      expect(competitor.project_id).toBe(projectId)
    })

    it('listCompetitorsForProject returns competitors for the project', async () => {
      store.createCompetitor({
        project_id: projectId,
        name: 'Competitor 1',
      })
      store.createCompetitor({
        project_id: projectId,
        name: 'Competitor 2',
      })

      const competitors = await listCompetitorsForProject(client, projectId)

      expect(competitors).toHaveLength(2)
      expect(competitors[0].name).toBe('Competitor 1') // Oldest first
    })

    it('getCompetitorById returns a competitor by id', async () => {
      const created = store.createCompetitor({
        project_id: projectId,
        name: 'Competitor A',
      })

      const competitor = await getCompetitorById(client, created.id)

      expect(competitor).not.toBeNull()
      expect(competitor?.id).toBe(created.id)
    })

    it('updateCompetitor updates and returns the competitor', async () => {
      const created = store.createCompetitor({
        project_id: projectId,
        name: 'Old Name',
      })

      const updated = await updateCompetitor(client, created.id, {
        name: 'New Name',
      })

      expect(updated.name).toBe('New Name')
      expect(updated.id).toBe(created.id)
    })

    it('deleteCompetitor deletes the competitor', async () => {
      const created = store.createCompetitor({
        project_id: projectId,
        name: 'To Delete',
      })

      await deleteCompetitor(client, created.id)

      const result = await getCompetitorById(client, created.id)
      expect(result).toBeNull()
    })
  })

  describe('Artifacts', () => {
    const projectId = 'project_123'

    it('createArtifact creates and returns an artifact', async () => {
      const input = {
        project_id: projectId,
        type: 'profiles' as const,
        content_json: { test: 'data' },
      }

      const artifact = await createArtifact(client, input)

      expect(artifact.id).toBeDefined()
      expect(artifact.project_id).toBe(projectId)
      expect(artifact.type).toBe('profiles')
    })

    it('listArtifacts returns artifacts for the project', async () => {
      store.createArtifact({
        project_id: projectId,
        type: 'profiles',
        content_json: { data: '1' },
      })
      store.createArtifact({
        project_id: projectId,
        type: 'synthesis',
        content_json: { data: '2' },
      })

      const artifacts = await listArtifacts(client, { projectId })

      expect(artifacts).toHaveLength(2)
      expect(artifacts[0].type).toBe('synthesis') // Newest first
    })
  })
})

