import { describe, it, expect } from 'vitest'
import { buildProjectContext } from '@/lib/results/projectContext'
import type { ProjectRow } from '@/lib/supabase/database.types'

describe('buildProjectContext', () => {
  it('should build context for product lens with full fields', () => {
    const project: ProjectRow = {
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
      starting_point: 'product',
      hypothesis: 'Will we win against Asana by focusing on real-time collaboration?',
      problem_statement: null,
      customer_profile: null,
      market_context: null,
      solution_idea: null,
      created_at: new Date().toISOString(),
    }

    const result = buildProjectContext(project)

    expect(result.lens).toBe('product')
    expect(result.summaryText).toContain('Hypothesis: Will we win against Asana')
    expect(result.summaryText).toContain('Market: B2B SaaS')
    expect(result.summaryText).toContain('Target customer: Product managers')
    expect(result.fieldsUsed).toContain('hypothesis')
    expect(result.fieldsUsed).toContain('market')
    expect(result.fieldsUsed).toContain('target_customer')
  })

  it('should build context for problem lens with only hypothesis and problem_statement', () => {
    const project: ProjectRow = {
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
      starting_point: 'problem',
      hypothesis: 'Is scheduling the #1 pain for boutique gym owners?',
      problem_statement: 'Boutique gym owners struggle with manual scheduling',
      customer_profile: null,
      market_context: null,
      solution_idea: null,
      created_at: new Date().toISOString(),
    }

    const result = buildProjectContext(project)

    expect(result.lens).toBe('problem')
    expect(result.summaryText).toContain('Hypothesis: Is scheduling the #1 pain')
    expect(result.summaryText).toContain('Problem: Boutique gym owners struggle')
    expect(result.summaryText).toContain('Market: Fitness')
    expect(result.fieldsUsed).toContain('hypothesis')
    expect(result.fieldsUsed).toContain('problem_statement')
    expect(result.fieldsUsed).toContain('market')
  })

  it('should default to product lens for legacy projects with starting_point null', () => {
    const project: ProjectRow = {
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
      starting_point: null,
      hypothesis: null,
      problem_statement: null,
      customer_profile: null,
      market_context: null,
      solution_idea: null,
      created_at: new Date().toISOString(),
    }

    const result = buildProjectContext(project)

    expect(result.lens).toBe('product')
    expect(result.summaryText).toContain('Product: Shopping cart software')
    expect(result.summaryText).toContain('Market: E-commerce')
    expect(result.fieldsUsed).toContain('your_product')
    expect(result.fieldsUsed).toContain('market')
  })

  it('should handle customer lens with customer_profile', () => {
    const project: ProjectRow = {
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
      starting_point: 'customer',
      hypothesis: 'What do HR ops teams struggle with most in onboarding?',
      problem_statement: null,
      customer_profile: 'HR operations teams at mid-size companies',
      market_context: null,
      solution_idea: null,
      created_at: new Date().toISOString(),
    }

    const result = buildProjectContext(project)

    expect(result.lens).toBe('customer')
    expect(result.summaryText).toContain('Hypothesis: What do HR ops teams')
    expect(result.summaryText).toContain('Customer: HR operations teams')
    expect(result.fieldsUsed).toContain('hypothesis')
    expect(result.fieldsUsed).toContain('customer_profile')
  })

  it('should handle market lens with market_context', () => {
    const project: ProjectRow = {
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
      starting_point: 'market',
      hypothesis: 'Where is incident management overbuilt or underdelivering?',
      problem_statement: null,
      customer_profile: null,
      market_context: 'Incident management tools for engineering teams',
      solution_idea: null,
      created_at: new Date().toISOString(),
    }

    const result = buildProjectContext(project)

    expect(result.lens).toBe('market')
    expect(result.summaryText).toContain('Hypothesis: Where is incident management')
    expect(result.summaryText).toContain('Market: Incident management tools')
    expect(result.fieldsUsed).toContain('hypothesis')
    expect(result.fieldsUsed).toContain('market_context')
  })
})

