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

  // Determine status based on artifacts (latest_successful_run_id doesn't exist in production schema)
  // Check if project has artifacts as indicator of successful run
  // For now, default to 'draft' - status can be enhanced later with artifact checks
  const status: ProjectCardModel['status'] = 'draft'

  // Primary action: route to opportunities (can be enhanced later with artifact checks)
  // Note: "Generating..." status would require checking analysis_runs table for running status
  // For now, we conservatively show "Generate results"
  const primaryAction: ProjectCardModel['primaryAction'] = {
    label: 'Generate results',
    href: `/projects/${project.id}/opportunities`,
  }

  // Secondary action: link to competitors page for editing inputs
  const secondaryAction: ProjectCardModel['secondaryAction'] = {
    label: 'Edit inputs',
    href: `/projects/${project.id}/competitors`,
  }

  // Meta chips: status and recency
  const metaChips: ProjectCardModel['metaChips'] = []
  
  // Add status chip based on run status
  // Note: latest_successful_run_id doesn't exist in production schema
  // Status chips can be enhanced later with artifact checks
  metaChips.push({
    label: 'Draft',
    tone: 'neutral',
  })

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

