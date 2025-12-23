// Helper to build normalized project context for analysis generation
// Handles both legacy projects and new hypothesis-first projects

import type { ProjectRow } from '@/lib/supabase/database.types'
import type { StartingPoint } from '@/lib/supabase/database.types'

export type ProjectLens = 'product' | 'problem' | 'customer' | 'market'

export interface ProjectContextSummary {
  lens: ProjectLens
  summaryText: string
  fieldsUsed: string[]
}

/**
 * Builds a normalized project context for analysis generation.
 * Handles both legacy projects (with your_product) and new hypothesis-first projects.
 * 
 * Note: starting_point and customer_profile are not used as they don't exist in production.
 */
export function buildProjectContext(projectRow: ProjectRow): ProjectContextSummary {
  // Default to 'product' lens (starting_point column doesn't exist in production)
  const lens: ProjectLens = 'product'
  const fieldsUsed: string[] = []
  const sections: string[] = []

  // Primary anchor: hypothesis (preferred) or fallback to your_product/business_goal
  if (projectRow.hypothesis) {
    sections.push(`Hypothesis: ${projectRow.hypothesis}`)
    fieldsUsed.push('hypothesis')
  } else if (projectRow.your_product) {
    sections.push(`Product: ${projectRow.your_product}`)
    fieldsUsed.push('your_product')
  } else if (projectRow.business_goal) {
    sections.push(`Goal: ${projectRow.business_goal}`)
    fieldsUsed.push('business_goal')
  }

  // Market context
  if (projectRow.market_context) {
    sections.push(`Market: ${projectRow.market_context}`)
    fieldsUsed.push('market_context')
  } else if (projectRow.market) {
    sections.push(`Market: ${projectRow.market}`)
    fieldsUsed.push('market')
  }

  // Customer context
  // Note: customer_profile column doesn't exist in production, use target_customer instead
  if (projectRow.target_customer) {
    sections.push(`Target customer: ${projectRow.target_customer}`)
    fieldsUsed.push('target_customer')
  }

  // Problem statement (for problem lens)
  if (projectRow.problem_statement) {
    sections.push(`Problem: ${projectRow.problem_statement}`)
    fieldsUsed.push('problem_statement')
  }

  // Solution idea (for product lens, or when they have a solution)
  if (projectRow.solution_idea) {
    sections.push(`Solution: ${projectRow.solution_idea}`)
    fieldsUsed.push('solution_idea')
  } else if (projectRow.your_product && !projectRow.hypothesis) {
    // Legacy: your_product already added above, but include it here for completeness
    // (already added, so skip)
  }

  // Geography
  if (projectRow.geography) {
    sections.push(`Geography: ${projectRow.geography}`)
    fieldsUsed.push('geography')
  }

  // Constraints and framing
  if (projectRow.primary_constraint) {
    sections.push(`Constraint: ${projectRow.primary_constraint}`)
    fieldsUsed.push('primary_constraint')
  }

  if (projectRow.risk_posture) {
    const postureLabels: Record<string, string> = {
      near_term_traction: 'Near-term traction',
      long_term_defensibility: 'Long-term defensibility',
      balanced: 'Balanced',
    }
    sections.push(`Risk posture: ${postureLabels[projectRow.risk_posture] || projectRow.risk_posture}`)
    fieldsUsed.push('risk_posture')
  }

  if (projectRow.ambition_level) {
    const ambitionLabels: Record<string, string> = {
      core_optimization: 'Core optimization',
      adjacent_expansion: 'Adjacent expansion',
      category_redefinition: 'Category redefinition',
    }
    sections.push(`Ambition: ${ambitionLabels[projectRow.ambition_level] || projectRow.ambition_level}`)
    fieldsUsed.push('ambition_level')
  }

  if (projectRow.organizational_capabilities) {
    sections.push(`Capabilities: ${projectRow.organizational_capabilities}`)
    fieldsUsed.push('organizational_capabilities')
  }

  if (projectRow.decision_level) {
    sections.push(`Decision level: ${projectRow.decision_level}`)
    fieldsUsed.push('decision_level')
  }

  if (projectRow.explicit_non_goals) {
    sections.push(`Non-goals: ${projectRow.explicit_non_goals}`)
    fieldsUsed.push('explicit_non_goals')
  }

  if (projectRow.input_confidence) {
    const confidenceLabels: Record<string, string> = {
      very_confident: 'Very confident',
      some_assumptions: 'Some assumptions',
      exploratory: 'Exploring',
      exploring: 'Exploring', // Handle both old and new values
    }
    sections.push(`Confidence: ${confidenceLabels[projectRow.input_confidence] || projectRow.input_confidence}`)
    fieldsUsed.push('input_confidence')
  }

  // Build summary text (bulleted format)
  const summaryText = sections.length > 0 ? sections.join('\n') : 'No project context provided.'

  return {
    lens,
    summaryText,
    fieldsUsed,
  }
}

