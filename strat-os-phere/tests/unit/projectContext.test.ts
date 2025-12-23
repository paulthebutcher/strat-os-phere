import { describe, it, expect } from 'vitest'
import { buildProjectContext } from '@/lib/results/projectContext'
import type { ProjectRow } from '@/lib/supabase/database.types'

describe('buildProjectContext', () => {
  it('should build context for product lens with full fields', () => {
    const project = {
      id: 'test-1',
      user_id: 'user-1',
      name: 'Test Project',
      market: 'B2B SaaS',
      target_customer: 'Product managers',
      your_product: 'Project management tool',
      business_goal: 'Increase market share',
      geography: 'North America',
      primary_constraint: 'time',
      risk_posture: 'balanced',
      ambition_level: 'adjacent_expansion',
      organizational_capabilities: 'Strong engineering',
      decision_level: 'VP',
      explicit_non_goals: 'Enterprise sales',
      input_confidence: 'very_confident',
      latest_successful_run_id: null,
      latest_run_id: null,
      created_at: new Date().toISOString(),
    } as ProjectRow

    const result = buildProjectContext(project)

    expect(result.lens).toBe('product')
    expect(result.summaryText).toContain('Product: Project management tool')
    expect(result.summaryText).toContain('Market: B2B SaaS')
    expect(result.summaryText).toContain('Target customer: Product managers')
    expect(result.fieldsUsed).toContain('your_product')
    expect(result.fieldsUsed).toContain('market')
    expect(result.fieldsUsed).toContain('target_customer')
  })

  it('should build context for problem lens with only market and target_customer', () => {
    const project = {
      id: 'test-2',
      user_id: 'user-1',
      name: 'Test Project',
      market: 'Fitness',
      target_customer: 'Gym owners',
      your_product: null,
      business_goal: null,
      geography: null,
      primary_constraint: null,
      risk_posture: null,
      ambition_level: null,
      organizational_capabilities: null,
      decision_level: null,
      explicit_non_goals: null,
      input_confidence: null,
      latest_successful_run_id: null,
      latest_run_id: null,
      created_at: new Date().toISOString(),
    } as ProjectRow

    const result = buildProjectContext(project)

    expect(result.lens).toBe('product')
    expect(result.summaryText).toContain('Market: Fitness')
    expect(result.summaryText).toContain('Target customer: Gym owners')
    expect(result.fieldsUsed).toContain('market')
    expect(result.fieldsUsed).toContain('target_customer')
  })

  it('should default to product lens for legacy projects', () => {
    const project = {
      id: 'test-3',
      user_id: 'user-1',
      name: 'Legacy Project',
      market: 'E-commerce',
      target_customer: 'Online retailers',
      your_product: 'Shopping cart software',
      business_goal: 'Reduce cart abandonment',
      geography: null,
      primary_constraint: null,
      risk_posture: null,
      ambition_level: null,
      organizational_capabilities: null,
      decision_level: null,
      explicit_non_goals: null,
      input_confidence: null,
      latest_successful_run_id: null,
      latest_run_id: null,
      created_at: new Date().toISOString(),
    } as ProjectRow

    const result = buildProjectContext(project)

    expect(result.lens).toBe('product')
    expect(result.summaryText).toContain('Product: Shopping cart software')
    expect(result.summaryText).toContain('Market: E-commerce')
    expect(result.fieldsUsed).toContain('your_product')
    expect(result.fieldsUsed).toContain('market')
  })

  it('should handle customer context with target_customer', () => {
    const project = {
      id: 'test-4',
      user_id: 'user-1',
      name: 'Customer Project',
      market: 'HR Tech',
      target_customer: 'HR teams',
      your_product: null,
      business_goal: null,
      geography: null,
      primary_constraint: null,
      risk_posture: null,
      ambition_level: null,
      organizational_capabilities: null,
      decision_level: null,
      explicit_non_goals: null,
      input_confidence: null,
      latest_successful_run_id: null,
      latest_run_id: null,
      created_at: new Date().toISOString(),
    } as ProjectRow

    const result = buildProjectContext(project)

    expect(result.lens).toBe('product')
    expect(result.summaryText).toContain('Market: HR Tech')
    expect(result.summaryText).toContain('Target customer: HR teams')
    expect(result.fieldsUsed).toContain('market')
    expect(result.fieldsUsed).toContain('target_customer')
  })

  it('should handle market context with market field', () => {
    const project = {
      id: 'test-5',
      user_id: 'user-1',
      name: 'Market Project',
      market: 'Incident Management',
      target_customer: 'DevOps teams',
      your_product: null,
      business_goal: null,
      geography: null,
      primary_constraint: null,
      risk_posture: null,
      ambition_level: null,
      organizational_capabilities: null,
      decision_level: null,
      explicit_non_goals: null,
      input_confidence: null,
      latest_successful_run_id: null,
      latest_run_id: null,
      created_at: new Date().toISOString(),
    } as ProjectRow

    const result = buildProjectContext(project)

    expect(result.lens).toBe('product')
    expect(result.summaryText).toContain('Market: Incident Management')
    expect(result.summaryText).toContain('Target customer: DevOps teams')
    expect(result.fieldsUsed).toContain('market')
    expect(result.fieldsUsed).toContain('target_customer')
  })
})

