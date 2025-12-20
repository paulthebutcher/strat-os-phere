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
    expect(event.message).toBe('Checking evidence quality...')
    expect(event.detail).toBe('Evidence quality check in progress')
    expect(event.runId).toBe('test-run-id')
    expect(event.timestamp).toBeDefined()
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

