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

  // Status: we don't have run status in the project data, so default to 'unknown'
  // This is safe and doesn't assume fields that don't exist
  const status: ProjectCardModel['status'] = 'unknown'

  // Primary action: default to project detail page
  // If we had artifact count, we could route to results, but we don't fetch that
  // to keep this UI-only and avoid extra queries
  const primaryAction: ProjectCardModel['primaryAction'] = {
    label: 'Open',
    href: `/projects/${project.id}`,
  }

  // Secondary action: link to competitors page for editing inputs
  const secondaryAction: ProjectCardModel['secondaryAction'] = {
    label: 'Edit inputs',
    href: `/projects/${project.id}/competitors`,
  }

  // Meta chips: status and recency
  const metaChips: ProjectCardModel['metaChips'] = []
  
  // Add status chip (always add one for consistency)
  metaChips.push({
    label: 'Project',
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

