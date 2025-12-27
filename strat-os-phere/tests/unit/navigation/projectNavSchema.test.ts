import { describe, it, expect } from 'vitest'
import {
  PROJECT_NAV_STEPS,
  getWorkflowSteps,
  getSettingsStep,
  getActiveNavStep,
  type ProjectNavStepId,
} from '@/lib/navigation/projectNavSchema'
import { paths } from '@/lib/routes'

describe('projectNavSchema', () => {
  describe('PROJECT_NAV_STEPS', () => {
    it('should have exactly 6 steps', () => {
      expect(PROJECT_NAV_STEPS).toHaveLength(6)
    })

    it('should have steps in canonical order', () => {
      const stepIds = PROJECT_NAV_STEPS.map(step => step.id)
      expect(stepIds).toEqual([
        'decision',
        'competitors',
        'evidence',
        'scorecard',
        'appendix',
        'settings',
      ])
    })

    it('should have all canonical labels', () => {
      const labels = PROJECT_NAV_STEPS.map(step => step.label)
      expect(labels).toEqual([
        'Decision',
        'Competitors',
        'Evidence',
        'Scorecard',
        'Appendix',
        'Settings',
      ])
    })

    it('should have icons for all steps', () => {
      PROJECT_NAV_STEPS.forEach(step => {
        expect(step.icon).toBeDefined()
        expect(typeof step.icon).toBe('function')
      })
    })

    it('should have href functions that return correct paths', () => {
      const projectId = 'test-project-123'
      
      expect(PROJECT_NAV_STEPS[0].href(projectId)).toBe(paths.decision(projectId))
      expect(PROJECT_NAV_STEPS[1].href(projectId)).toBe(paths.competitors(projectId))
      expect(PROJECT_NAV_STEPS[2].href(projectId)).toBe(paths.evidence(projectId))
      expect(PROJECT_NAV_STEPS[3].href(projectId)).toBe(paths.scorecard(projectId))
      expect(PROJECT_NAV_STEPS[4].href(projectId)).toBe(paths.appendix(projectId))
      expect(PROJECT_NAV_STEPS[5].href(projectId)).toBe(paths.settings(projectId))
    })

    it('should have matchers for all steps', () => {
      const projectId = 'test-project-123'
      
      PROJECT_NAV_STEPS.forEach(step => {
        const matchers = step.matchers(projectId)
        expect(Array.isArray(matchers)).toBe(true)
        expect(matchers.length).toBeGreaterThan(0)
        // Each matcher should include the step's href
        expect(matchers).toContain(step.href(projectId))
      })
    })
  })

  describe('getWorkflowSteps', () => {
    it('should return all steps except settings', () => {
      const workflowSteps = getWorkflowSteps()
      expect(workflowSteps).toHaveLength(5)
      expect(workflowSteps.map(s => s.id)).not.toContain('settings')
      expect(workflowSteps.map(s => s.id)).toEqual([
        'decision',
        'competitors',
        'evidence',
        'scorecard',
        'appendix',
      ])
    })
  })

  describe('getSettingsStep', () => {
    it('should return the settings step', () => {
      const settingsStep = getSettingsStep()
      expect(settingsStep).toBeDefined()
      expect(settingsStep?.id).toBe('settings')
      expect(settingsStep?.label).toBe('Settings')
    })
  })

  describe('getActiveNavStep', () => {
    const projectId = 'test-project-123'

    it('should return null for null pathname', () => {
      expect(getActiveNavStep(null, projectId)).toBeNull()
    })

    it('should match decision step', () => {
      expect(getActiveNavStep(paths.decision(projectId), projectId)).toBe('decision')
      expect(getActiveNavStep(paths.project(projectId), projectId)).toBe('decision')
    })

    it('should match competitors step', () => {
      expect(getActiveNavStep(paths.competitors(projectId), projectId)).toBe('competitors')
    })

    it('should match evidence step', () => {
      expect(getActiveNavStep(paths.evidence(projectId), projectId)).toBe('evidence')
      expect(getActiveNavStep(`${paths.evidence(projectId)}/`, projectId)).toBe('evidence')
    })

    it('should match scorecard step', () => {
      expect(getActiveNavStep(paths.scorecard(projectId), projectId)).toBe('scorecard')
    })

    it('should match appendix step', () => {
      expect(getActiveNavStep(paths.appendix(projectId), projectId)).toBe('appendix')
    })

    it('should match settings step', () => {
      expect(getActiveNavStep(paths.settings(projectId), projectId)).toBe('settings')
    })

    it('should return null for unmatched paths', () => {
      expect(getActiveNavStep('/projects/other-project/unknown', projectId)).toBeNull()
      expect(getActiveNavStep('/dashboard', projectId)).toBeNull()
    })
  })
})

