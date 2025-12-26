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
})

