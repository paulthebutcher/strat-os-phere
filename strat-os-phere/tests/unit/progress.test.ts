import { describe, it, expect } from 'vitest'
import type { ResultsV2Phase } from '@/lib/results/progress'
import { makeProgressEvent } from '@/lib/results/progress'

describe('ResultsV2Phase', () => {
  it('includes evidence_quality_check as a valid phase', () => {
    // TypeScript will fail at compile time if this is not a valid phase
    const phase: ResultsV2Phase = 'evidence_quality_check'
    expect(phase).toBe('evidence_quality_check')
  })

  it('allows makeProgressEvent to be called with evidence_quality_check', () => {
    const event = makeProgressEvent(
      'test-run-id',
      'evidence_quality_check',
      'Checking evidence quality...',
      {
        detail: 'Evidence quality check in progress',
      }
    )

    expect(event.phase).toBe('evidence_quality_check')
    expect(event.status).toBe('started') // Default status
    expect(event.message).toBe('Checking evidence quality...')
    expect(event.detail).toBe('Evidence quality check in progress')
    expect(event.runId).toBe('test-run-id')
    expect(event.timestamp).toBeDefined()
  })

  it('supports status field in progress events', () => {
    const event1 = makeProgressEvent(
      'test-run-id',
      'jobs_generate',
      'Starting jobs generation...',
      {
        status: 'started',
      }
    )
    expect(event1.status).toBe('started')

    const event2 = makeProgressEvent(
      'test-run-id',
      'jobs_generate',
      'Processing competitor 2 of 5...',
      {
        status: 'progress',
        meta: {
          current: 2,
          total: 5,
          substep: 'competitor_analysis',
        },
      }
    )
    expect(event2.status).toBe('progress')
    expect(event2.meta?.current).toBe(2)
    expect(event2.meta?.total).toBe(5)
    expect(event2.meta?.substep).toBe('competitor_analysis')

    const event3 = makeProgressEvent(
      'test-run-id',
      'jobs_generate',
      'Jobs generation complete',
      {
        status: 'completed',
      }
    )
    expect(event3.status).toBe('completed')
  })

  it('defaults to started status when status is not provided', () => {
    const event = makeProgressEvent(
      'test-run-id',
      'load_input',
      'Loading data...',
      {}
    )
    expect(event.status).toBe('started')
  })

  it('includes all expected phases', () => {
    const expectedPhases: ResultsV2Phase[] = [
      'load_input',
      'evidence_quality_check',
      'jobs_generate',
      'jobs_validate',
      'scorecard_generate',
      'scorecard_validate',
      'opportunities_generate',
      'opportunities_validate',
      'strategic_bets_generate',
      'strategic_bets_validate',
      'scoring_compute',
      'save_artifacts',
      'finalize',
    ]

    // Verify each phase can be assigned to ResultsV2Phase
    expectedPhases.forEach((phase) => {
      const testPhase: ResultsV2Phase = phase
      expect(testPhase).toBe(phase)
    })
  })
})

