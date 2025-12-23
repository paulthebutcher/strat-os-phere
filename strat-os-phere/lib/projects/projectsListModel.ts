/**
 * View model for projects table/list view
 */

import type { ProjectWithCounts } from '@/lib/data/projects'

export type EvidenceStrength = "None" | "Weak" | "Medium" | "Strong";

export type ProjectsListRow = {
  projectId: string;
  name: string;
  subtitle?: string; // market/industry
  status: "Draft" | "Ready" | "Has results";
  evidenceStrength: EvidenceStrength;
  evidenceScore: number; // 0-100
  lastRunAt?: string; // ISO date string
  lastTouchedAt?: string; // ISO date string
  primaryCta: "Generate Analysis" | "View Opportunities";
  primaryHref?: string; // for View Opportunities
};

// Re-export for convenience
export type { ProjectWithCounts };

/**
 * Calculate evidence score from counts
 */
export function calculateEvidenceScore(
  competitorCount: number,
  competitorsWithEvidenceCount: number,
  evidenceSourceCount: number
): number {
  // If we have competitor counts, use that ratio
  if (competitorCount > 0) {
    const ratio = competitorsWithEvidenceCount / competitorCount;
    return Math.round(100 * ratio);
  }
  
  // Fallback: if we have evidence sources, give a base score
  if (evidenceSourceCount > 0) {
    // Simple heuristic: 1-2 sources = 30, 3-5 = 60, 6+ = 80
    if (evidenceSourceCount >= 6) return 80;
    if (evidenceSourceCount >= 3) return 60;
    return 30;
  }
  
  return 0;
}

/**
 * Map evidence score to strength label
 */
export function mapEvidenceStrength(score: number): EvidenceStrength {
  if (score === 0) return "None";
  if (score >= 80) return "Strong";
  if (score >= 50) return "Medium";
  return "Weak";
}

/**
 * Determine primary CTA based on project state
 */
export function determinePrimaryCta(
  hasSuccessfulRun: boolean,
  hasRun: boolean,
  hasEvidence: boolean
): "Generate Analysis" | "View Opportunities" {
  // Prefer "View Opportunities" when in doubt (trust-forward)
  if (hasSuccessfulRun || hasRun || hasEvidence) {
    return "View Opportunities";
  }
  return "Generate Analysis";
}

/**
 * Convert ProjectWithCounts to ProjectsListRow
 */
export function toProjectsListRow(project: ProjectWithCounts): ProjectsListRow {
  const evidenceScore = calculateEvidenceScore(
    project.competitorCount,
    project.competitorsWithEvidenceCount,
    project.evidenceSourceCount
  );
  
  const evidenceStrength = mapEvidenceStrength(evidenceScore);
  
  const hasSuccessfulRun = !!project.latest_successful_run_id;
  const hasRun = !!project.latest_run_id;
  const hasEvidence = project.evidenceSourceCount > 0 || project.competitorsWithEvidenceCount > 0;
  
  const primaryCta = determinePrimaryCta(hasSuccessfulRun, hasRun, hasEvidence);
  
  // Determine status
  let status: "Draft" | "Ready" | "Has results";
  if (hasSuccessfulRun) {
    status = "Has results";
  } else if (hasRun || hasEvidence) {
    status = "Ready";
  } else {
    status = "Draft";
  }
  
  // Get last touched (updated_at or created_at)
  const lastTouchedAt = project.updated_at ?? project.created_at;
  
  return {
    projectId: project.id,
    name: project.name,
    subtitle: project.market || undefined,
    status,
    evidenceStrength,
    evidenceScore,
    lastRunAt: project.latestRunCreatedAt || undefined,
    lastTouchedAt: lastTouchedAt || undefined,
    primaryCta,
    primaryHref: primaryCta === "View Opportunities" 
      ? `/projects/${project.id}/results`
      : undefined,
  };
}

