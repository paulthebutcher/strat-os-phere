/**
 * Read Opportunities V1 from project run output
 * 
 * Helper function to extract opportunities_artifact_v1 from project_runs.output
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { getLatestRunForProject } from '@/lib/data/projectRuns'
import {
  OpportunitiesArtifactV1Schema,
  type OpportunitiesArtifactV1,
  type OpportunityV1,
} from './opportunityV1'

/**
 * Read opportunities V1 artifact from latest project run
 * 
 * @param supabase - Supabase client
 * @param projectId - Project ID
 * @returns Opportunities artifact or null if not found/invalid
 */
export async function readOpportunitiesV1FromLatestRun(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<OpportunitiesArtifactV1 | null> {
  try {
    // Get latest run
    const runResult = await getLatestRunForProject(supabase, projectId)
    
    if (!runResult.ok || !runResult.data) {
      return null
    }

    const run = runResult.data

    // Check if run succeeded and has output
    if (run.status !== 'succeeded' || !run.output) {
      return null
    }

    // Extract opportunities_artifact_v1 from output
    const artifact = run.output.opportunities_artifact_v1
    
    if (!artifact) {
      return null
    }

    // Validate with Zod schema
    const validationResult = OpportunitiesArtifactV1Schema.safeParse(artifact)
    
    if (!validationResult.success) {
      // Invalid artifact - return null
      return null
    }

    return validationResult.data
  } catch (error) {
    // Fail gracefully - return null on any error
    return null
  }
}

/**
 * Get opportunities array from latest run
 * 
 * @param supabase - Supabase client
 * @param projectId - Project ID
 * @returns Array of opportunities or empty array
 */
export async function getOpportunitiesV1FromLatestRun(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<OpportunityV1[]> {
  const artifact = await readOpportunitiesV1FromLatestRun(supabase, projectId)
  return artifact?.opportunities || []
}

