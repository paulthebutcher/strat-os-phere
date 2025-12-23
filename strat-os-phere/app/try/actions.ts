'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { createProject } from '@/lib/data/projects'
import { createCompetitorForProject } from '@/app/projects/[projectId]/competitors/actions'
import { generateAnalysis } from '@/app/projects/[projectId]/results/actions'
import type { TryDraft } from '@/lib/tryDraft'
import { logger } from '@/lib/logger'

interface CreateProjectFromTryDraftResult {
  success: boolean
  projectId?: string
  message?: string
}

/**
 * Create a project from a try draft and start the analysis run
 */
export async function createProjectFromTryDraft(
  draft: TryDraft
): Promise<CreateProjectFromTryDraftResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/try/continue')
  }

  try {
    // Create project
    const project = await createProject(supabase, {
      user_id: user.id,
      name: `Competitive analysis: ${draft.primaryCompanyName}`,
      market: draft.marketCategory || 'Competitive analysis',
      target_customer: draft.targetCustomer || 'Target customers',
      your_product: draft.product ?? null,
      business_goal: draft.contextText ?? null,
      // Set other fields to null/defaults
      geography: null,
      primary_constraint: null,
      risk_posture: null,
      ambition_level: null,
      organizational_capabilities: null,
      decision_level: null,
      explicit_non_goals: null,
      input_confidence: null,
      starting_point: 'product',
      hypothesis: null,
      problem_statement: null,
      customer_profile: null,
      market_context: null,
      solution_idea: null,
      decision_framing: null,
    })

    const projectId = project.id

    // Add competitors if any
    if (draft.selectedCompetitors && draft.selectedCompetitors.length > 0) {
      for (const competitor of draft.selectedCompetitors) {
        try {
          await createCompetitorForProject(projectId, {
            name: competitor.name,
            website: competitor.url,
            evidence: `## ${competitor.name}\n\nEvidence generation in progress.`,
          })
        } catch (err) {
          logger.error('Failed to create competitor from try draft', {
            projectId,
            competitor: competitor.name,
            error: err,
          })
          // Continue with other competitors
        }
      }
    }

    // Start the analysis run
    try {
      const runResult = await generateAnalysis(projectId)
      if (!runResult.ok) {
        logger.warn('Failed to start analysis run from try draft', {
          projectId,
          error: runResult.message,
        })
        // Continue anyway - user can manually trigger the run
      }
    } catch (err) {
      logger.error('Error starting analysis run from try draft', {
        projectId,
        error: err,
      })
      // Continue anyway - user can manually trigger the run
    }

    return { success: true, projectId }
  } catch (error) {
    logger.error('Failed to create project from try draft', error)

    const message =
      error instanceof Error ? error.message : 'Failed to create project.'

    return { success: false, message }
  }
}

