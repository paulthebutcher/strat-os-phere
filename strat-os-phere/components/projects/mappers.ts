import type { Project } from '@/lib/supabase/types'
import type { ProjectCardModel } from './types'

/**
 * Safely maps a Project from the database to a ProjectCardModel for UI display.
 * Does not assume optional fields exist (e.g., updated_at).
 */
export function toProjectCardModel(project: Project): ProjectCardModel {
  // Safely extract timestamps
  const createdAt = project.created_at ?? null
  
  // Check for updated_at at runtime (it may not exist in the type but could be in the data)
  // Use type assertion to safely check if the field exists
  const updatedAt = 'updated_at' in project && typeof (project as any).updated_at === 'string'
    ? (project as any).updated_at
    : null

  // Compute lastTouchedAt with fallback: updatedAt ?? createdAt ?? null
  const lastTouchedAt = updatedAt ?? createdAt ?? null

  // Extract title - use name field from project
  const title = project.name || 'Untitled Project'

  // Extract market
  const market = project.market || null

  // Determine status based on latest_successful_run_id
  // Check if latest_successful_run_id exists (may not be in type but could be in data)
  const hasSuccessfulRun = 'latest_successful_run_id' in project && 
    typeof (project as any).latest_successful_run_id === 'string' &&
    (project as any).latest_successful_run_id !== null

  const status: ProjectCardModel['status'] = hasSuccessfulRun ? 'ready' : 'draft'

  // Primary action: route to results if successful run exists, otherwise to overview
  // Note: "Generating..." status would require checking analysis_runs table for running status
  // For now, we conservatively show "Generate results" when no successful run exists
  const primaryAction: ProjectCardModel['primaryAction'] = hasSuccessfulRun
    ? {
        label: 'View results',
        href: `/projects/${project.id}/results`,
      }
    : {
        label: 'Generate results',
        href: `/projects/${project.id}/overview`,
      }

  // Secondary action: link to competitors page for editing inputs
  const secondaryAction: ProjectCardModel['secondaryAction'] = {
    label: 'Edit inputs',
    href: `/projects/${project.id}/competitors`,
  }

  // Meta chips: status and recency
  const metaChips: ProjectCardModel['metaChips'] = []
  
  // Add status chip based on run status
  if (hasSuccessfulRun) {
    metaChips.push({
      label: 'Ready',
      tone: 'good',
    })
  } else {
    metaChips.push({
      label: 'Draft',
      tone: 'neutral',
    })
  }

  return {
    id: project.id,
    title,
    market,
    createdAt,
    updatedAt,
    lastTouchedAt,
    status,
    primaryAction,
    secondaryAction,
    metaChips,
  }
}

