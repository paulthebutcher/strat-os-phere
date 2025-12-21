import { describe, it, expect } from 'vitest'
import { ANALYSIS_STAGES } from '@/components/results/analysisRunStages'

describe('analysisRunStages', () => {
  describe('ANALYSIS_STAGES', () => {
    it('should have unique phase labels (no duplicates)', () => {
      const labels = ANALYSIS_STAGES.map((stage) => stage.label)
      const uniqueLabels = new Set(labels)
      
      expect(uniqueLabels.size).toBe(labels.length)
      
      // If there are duplicates, find and report them
      const duplicates = labels.filter((label, index) => labels.indexOf(label) !== index)
      if (duplicates.length > 0) {
        const duplicateSet = new Set(duplicates)
        expect.fail(
          `Found duplicate phase labels: ${Array.from(duplicateSet).join(', ')}`
        )
      }
    })

    it('should have unique phase IDs', () => {
      const ids = ANALYSIS_STAGES.map((stage) => stage.id)
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should not contain the duplicate "Reviewing live competitor signals" label', () => {
      const labels = ANALYSIS_STAGES.map((stage) => stage.label)
      const count = labels.filter((label) => label === 'Reviewing live competitor signals').length
      
      // This label should appear at most once (if at all)
      expect(count).toBeLessThanOrEqual(1)
    })
  })
})

