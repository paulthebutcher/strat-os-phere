import type { Project, Competitor } from '@/lib/supabase/types'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'

export interface ReadinessItem {
  id: string
  label: string
  status: 'complete' | 'incomplete'
  fixHref?: string
  details?: string
}

export interface ProjectReadiness {
  items: ReadinessItem[]
  allComplete: boolean
  nextAction: {
    type: 'add_competitors' | 'generate_evidence' | 'generate_analysis' | 'edit_project'
    label: string
    href: string
    disabled?: boolean
    disabledReason?: string
  }
}

/**
 * Compute project readiness status based on project, competitors, and artifacts
 * This is UI-only logic - does not change backend validation
 */
export function getProjectReadiness(
  project: Project,
  competitors: Competitor[]
): ProjectReadiness {
  const items: ReadinessItem[] = []
  const competitorCount = competitors.length

  // 1. Project basics
  const hasBasics = Boolean(
    project.name &&
    project.market
  )
  items.push({
    id: 'basics',
    label: 'Project basics completed',
    status: hasBasics ? 'complete' : 'incomplete',
    fixHref: hasBasics ? undefined : '/projects', // Link to projects list (can be enhanced with edit modal later)
  })

  // 2. Competitors count
  const hasEnoughCompetitors = competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS
  items.push({
    id: 'competitors',
    label: `Competitors added: ${competitorCount} / ${MIN_COMPETITORS_FOR_ANALYSIS} minimum`,
    status: hasEnoughCompetitors ? 'complete' : 'incomplete',
    fixHref: hasEnoughCompetitors ? undefined : '/competitors',
    details: hasEnoughCompetitors
      ? `${competitorCount} competitor${competitorCount !== 1 ? 's' : ''} added`
      : `Add ${MIN_COMPETITORS_FOR_ANALYSIS - competitorCount} more`,
  })

  // 3. Evidence present (check if competitors have evidence_text)
  const competitorsWithEvidence = competitors.filter(
    (c) => c.evidence_text && c.evidence_text.trim().length > 0
  )
  const evidenceCount = competitorsWithEvidence.length
  const hasEvidence = evidenceCount > 0
  // Consider evidence "complete" if at least half of competitors have evidence
  const evidenceComplete = evidenceCount >= Math.ceil(competitorCount / 2) && competitorCount > 0

  items.push({
    id: 'evidence',
    label: 'Evidence present',
    status: evidenceComplete ? 'complete' : 'incomplete',
    fixHref: evidenceComplete ? undefined : '/competitors',
    details:
      competitorCount > 0
        ? `${evidenceCount} of ${competitorCount} competitor${competitorCount !== 1 ? 's' : ''} have evidence`
        : 'Add competitors first',
  })

  // 4. Optional: Sharpening context (primary_constraint, risk_posture, ambition_level)
  const hasSharpeningContext = Boolean(
    project.primary_constraint || project.risk_posture || project.ambition_level
  )
  items.push({
    id: 'context',
    label: 'Sharpening context (optional)',
    status: hasSharpeningContext ? 'complete' : 'incomplete',
    fixHref: hasSharpeningContext ? undefined : '/projects', // Can be enhanced with edit modal later
    details: hasSharpeningContext
      ? 'Context added'
      : 'Optional: Add constraints, risk posture, or ambition level',
  })

  const allComplete = items.every((item) => item.status === 'complete')

  // Determine next action
  let nextAction: ProjectReadiness['nextAction']

  if (!hasBasics) {
    nextAction = {
      type: 'edit_project',
      label: 'Complete project basics',
      href: '/projects', // Can be enhanced with edit modal later
    }
  } else if (!hasEnoughCompetitors) {
    nextAction = {
      type: 'add_competitors',
      label: 'Add competitors',
      href: '/competitors',
    }
  } else if (!evidenceComplete && competitorCount > 0) {
    nextAction = {
      type: 'generate_evidence',
      label: 'Add evidence to competitors',
      href: '/competitors',
    }
  } else {
    nextAction = {
      type: 'generate_analysis',
      label: 'Generate analysis',
      href: '/opportunities',
      disabled: !allComplete,
      disabledReason: !allComplete ? 'Complete all requirements first' : undefined,
    }
  }

  return {
    items,
    allComplete,
    nextAction,
  }
}

