/**
 * Helper to harvest evidence bundle for a project and its competitors
 * Builds HarvestContext from project/competitor data and calls the harvester
 * 
 * NOTE: Do not reference drift columns that are not in Supabase schema/types:
 * market_context, hypothesis, decision_framing, starting_point, customer_profile, 
 * problem_statement, solution_idea, context_paste
 * 
 * Only use fields that exist on ProjectRow in database.types.ts
 */

import type { Project, Competitor } from '@/lib/supabase/types'
import { harvestEvidence } from './harvestEvidence'
import type { HarvestEvidenceCtx, HarvestEvidenceBundle } from './types'

export interface RunEvidenceBundleParams {
  project: Project
  competitors: Competitor[]
  runId: string
  userId?: string
}

export interface RunEvidenceBundleResult {
  bundle: HarvestEvidenceBundle
  stats: {
    totalSources: number
    uniqueUrls: number
    uniqueDomains: number
    byType: Record<string, number>
  }
}

/**
 * Build HarvestContext from project and competitor data
 */
function buildHarvestContext(
  project: Project,
  competitors: Competitor[]
): HarvestEvidenceCtx {
  // Extract company/product name from project
  // Prefer your_product, fallback to name, or use a default
  const companyName =
    project.your_product || project.name || 'Company'

  // Extract market/category
  const market = project.market ?? undefined

  // Extract decision/business goal for context
  // Note: hypothesis and problem_statement columns do not exist in production
  const decision =
    project.business_goal ||
    undefined

  // Build context string combining relevant fields
  const contextParts: string[] = []
  if (market) contextParts.push(`Market: ${market}`)
  if (decision) contextParts.push(`Goal: ${decision}`)
  // Note: customer_profile column doesn't exist in production, use target_customer
  if (project.target_customer) {
    contextParts.push(`Customer: ${project.target_customer}`)
  }
  const context = contextParts.length > 0 ? contextParts.join('. ') : undefined

  // Extract primary URL from first competitor (if available)
  // In the future, this could come from project.primary_url if that field exists
  const primaryUrl =
    competitors.length > 0 && competitors[0].url
      ? competitors[0].url
      : undefined

  return {
    company: companyName,
    url: primaryUrl,
    context,
    limitPerType: 5, // Default limit
  }
}

/**
 * Harvest evidence bundle for a project
 * Returns the bundle and computed stats
 */
export async function runEvidenceHarvestAndStore(
  params: RunEvidenceBundleParams
): Promise<RunEvidenceBundleResult> {
  const { project, competitors } = params

  // Build harvest context from project data
  const harvestCtx = buildHarvestContext(project, competitors)

  // Call the harvester
  const bundle = await harvestEvidence(harvestCtx)

  // Extract stats from bundle
  const stats = {
    totalSources: bundle.totals.sources,
    uniqueUrls: bundle.totals.uniqueUrls,
    uniqueDomains: bundle.totals.uniqueDomains,
    byType: bundle.totals.byType,
  }

  return {
    bundle,
    stats,
  }
}

