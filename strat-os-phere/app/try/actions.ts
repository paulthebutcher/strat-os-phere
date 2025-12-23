'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { createProjectSafe } from '@/lib/data/projectsContract'
import {
  createDraftProjectInput,
  finalizeProjectInput,
} from '@/lib/data/projectInputs'
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

  // Create project with only stable fields
  const projectResult = await createProjectSafe(supabase, {
    user_id: user.id,
    name: `Competitive analysis: ${draft.primaryCompanyName}`,
    // Do NOT write evolving fields to projects table
    // All evolving fields go to project_inputs instead
  })

  if (!projectResult.ok) {
    logger.error('Failed to create project from try draft', {
      error: projectResult.error,
    })
    return {
      success: false,
      message: projectResult.error.message || 'Failed to create project.',
    }
  }

  const projectId = projectResult.data.id

  // Save all evolving fields to project_inputs
  const inputJson: Record<string, any> = {
    marketCategory: draft.marketCategory,
    targetCustomer: draft.targetCustomer,
    product: draft.product,
    contextText: draft.contextText,
    primaryCompanyName: draft.primaryCompanyName,
    selectedCompetitors: draft.selectedCompetitors,
  }

  // Remove undefined values
  const cleanedInputJson: Record<string, any> = {}
  for (const [key, value] of Object.entries(inputJson)) {
    if (value !== undefined) {
      cleanedInputJson[key] = value
    }
  }

  // Create and finalize project input
  if (Object.keys(cleanedInputJson).length > 0) {
    const inputResult = await createDraftProjectInput(
      supabase,
      projectId,
      cleanedInputJson
    )

    if (inputResult.ok) {
      await finalizeProjectInput(supabase, inputResult.data.id)
    } else {
      logger.warn('Failed to create project input from try draft', {
        projectId,
        error: inputResult.error,
      })
    }
  }

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
}

