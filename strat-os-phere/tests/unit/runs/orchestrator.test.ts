/**
 * Unit tests for run orchestrator
 * Tests idempotency, step status tracking, and resumability
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TypedSupabaseClient } from '@/lib/supabase/types'
import {
  getStepStatus,
  getOrCreateActiveRun,
  advanceRun,
  markStepCompleted,
  markStepFailed,
  type StepName,
} from '@/lib/runs/orchestrator'
import type { ProjectRun } from '@/lib/data/projectRuns'

// Mock the data access layer
vi.mock('@/lib/data/projectRuns', () => ({
  createProjectRun: vi.fn(),
  getLatestRunForProject: vi.fn(),
  updateRunMetrics: vi.fn(),
  setRunRunning: vi.fn(),
  setRunSucceeded: vi.fn(),
  setRunFailed: vi.fn(),
}))

vi.mock('@/lib/data/projectInputs', () => ({
  getLatestProjectInput: vi.fn(),
}))

vi.mock('@/lib/runs/runPersistence', () => ({
  tryMarkStepRunning: vi.fn(),
}))

describe('orchestrator', () => {
  let mockSupabase: TypedSupabaseClient
  let mockRun: ProjectRun

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis(),
    } as any

    mockRun = {
      id: 'run-123',
      project_id: 'project-123',
      input_version: 1,
      status: 'queued',
      started_at: null,
      finished_at: null,
      created_at: new Date().toISOString(),
      error_code: null,
      error_message: null,
      error_detail: null,
      output: null,
      metrics: {},
      idempotency_key: 'project-123:1:version',
    }
  })

  describe('getStepStatus', () => {
    it('should return pending status for step that does not exist', () => {
      const status = getStepStatus(mockRun, 'evidence')
      expect(status.status).toBe('pending')
    })

    it('should return step status from metrics', () => {
      const runWithSteps: ProjectRun = {
        ...mockRun,
        metrics: {
          step_status: {
            evidence: {
              status: 'completed',
              startedAt: '2024-01-01T00:00:00Z',
              finishedAt: '2024-01-01T00:01:00Z',
            },
          },
        },
      }

      const status = getStepStatus(runWithSteps, 'evidence')
      expect(status.status).toBe('completed')
      expect(status.startedAt).toBe('2024-01-01T00:00:00Z')
      expect(status.finishedAt).toBe('2024-01-01T00:01:00Z')
    })
  })

  describe('advanceRun', () => {
    it('should no-op if step already completed', async () => {
      const completedRun: ProjectRun = {
        ...mockRun,
        metrics: {
          step_status: {
            evidence: {
              status: 'completed',
              startedAt: '2024-01-01T00:00:00Z',
              finishedAt: '2024-01-01T00:01:00Z',
            },
          },
        },
      }

      ;(mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: completedRun, error: null }),
      })

      const result = await advanceRun(mockSupabase, 'run-123', 'evidence')
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.action).toBe('noop')
        expect(result.stepStatus.status).toBe('completed')
      }
    })

    it('should no-op if step already running', async () => {
      const runningRun: ProjectRun = {
        ...mockRun,
        metrics: {
          step_status: {
            evidence: {
              status: 'running',
              startedAt: '2024-01-01T00:00:00Z',
            },
          },
        },
      }

      ;(mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: runningRun, error: null }),
      })

      const result = await advanceRun(mockSupabase, 'run-123', 'evidence')
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.action).toBe('noop')
        expect(result.stepStatus.status).toBe('running')
      }
    })

    it('should allow retry if step failed', async () => {
      const failedRun: ProjectRun = {
        ...mockRun,
        status: 'queued',
        metrics: {
          step_status: {
            evidence: {
              status: 'failed',
              startedAt: '2024-01-01T00:00:00Z',
              finishedAt: '2024-01-01T00:01:00Z',
              error: {
                code: 'COLLECTION_ERROR',
                message: 'Failed to collect evidence',
              },
            },
          },
        },
      }

      ;(mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: failedRun, error: null }),
        update: vi.fn().mockReturnThis(),
      })

      // Mock updateRunMetrics
      const { updateRunMetrics } = await import('@/lib/data/projectRuns')
      vi.mocked(updateRunMetrics).mockResolvedValue({
        ok: true,
        data: failedRun,
      })

      // Mock setRunRunning
      const { setRunRunning } = await import('@/lib/data/projectRuns')
      vi.mocked(setRunRunning).mockResolvedValue({
        ok: true,
        data: { ...failedRun, status: 'running' },
      })

      const result = await advanceRun(mockSupabase, 'run-123', 'evidence')
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.action).toBe('resumed')
      }
    })
  })

  describe('step_status schema validation', () => {
    it('should normalize invalid metrics.step_status shape to empty map', () => {
      const runWithInvalidSteps: ProjectRun = {
        ...mockRun,
        metrics: {
          step_status: {
            evidence: {
              // Invalid: missing required 'status' field
              startedAt: '2024-01-01T00:00:00Z',
            },
            // Invalid: wrong type
            analysis: 'not-an-object',
          },
        },
      }

      // getStepStatus should handle invalid shape gracefully
      const status = getStepStatus(runWithInvalidSteps, 'evidence')
      // Should return pending as safe default for invalid entries
      expect(status.status).toBe('pending')
    })

    it('should parse valid step_status correctly', () => {
      const runWithValidSteps: ProjectRun = {
        ...mockRun,
        metrics: {
          step_status: {
            evidence: {
              status: 'running',
              startedAt: '2024-01-01T00:00:00Z',
            },
            analysis: {
              status: 'completed',
              startedAt: '2024-01-01T00:00:00Z',
              finishedAt: '2024-01-01T00:01:00Z',
            },
          },
        },
      }

      const evidenceStatus = getStepStatus(runWithValidSteps, 'evidence')
      expect(evidenceStatus.status).toBe('running')
      expect(evidenceStatus.startedAt).toBe('2024-01-01T00:00:00Z')

      const analysisStatus = getStepStatus(runWithValidSteps, 'analysis')
      expect(analysisStatus.status).toBe('completed')
      expect(analysisStatus.finishedAt).toBe('2024-01-01T00:01:00Z')
    })
  })

  describe('atomic double-start prevention', () => {
    it('should prevent double-start when two requests try to start the same step', async () => {
      const pendingRun: ProjectRun = {
        ...mockRun,
        status: 'queued',
        metrics: {
          step_status: {
            evidence: {
              status: 'pending',
            },
          },
        },
      }

      // Mock tryMarkStepRunning to simulate race condition
      const { tryMarkStepRunning } = await import('@/lib/runs/runPersistence')
      
      // First call succeeds
      vi.mocked(tryMarkStepRunning).mockResolvedValueOnce({
        ok: true,
        run: { ...pendingRun, status: 'running' },
      })

      // Second call fails (already running)
      vi.mocked(tryMarkStepRunning).mockResolvedValueOnce({
        ok: false,
        reason: 'already_running',
      })

      ;(mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({ data: pendingRun, error: null }) // First fetch
          .mockResolvedValueOnce({ data: { ...pendingRun, status: 'running' }, error: null }), // Second fetch for no-op
      })

      // First request - should succeed
      const result1 = await advanceRun(mockSupabase, 'run-123', 'evidence')
      expect(result1.ok).toBe(true)
      if (result1.ok) {
        expect(result1.action).toBe('started')
      }

      // Second request - should no-op
      const result2 = await advanceRun(mockSupabase, 'run-123', 'evidence')
      expect(result2.ok).toBe(true)
      if (result2.ok) {
        expect(result2.action).toBe('noop')
      }

      // Verify tryMarkStepRunning was called twice
      expect(tryMarkStepRunning).toHaveBeenCalledTimes(2)
    })
  })
})

