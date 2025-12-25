/**
 * Canonical route builders for project pages
 * Single source of truth for project navigation routes
 * 
 * @deprecated Use paths.* from @/lib/routes instead
 * This file is kept for backward compatibility during migration
 */

import { paths } from '@/lib/routes'

/**
 * @deprecated Use paths.* from @/lib/routes instead
 */
export const projectRoutes = {
  decision: paths.decision,
  opportunities: paths.opportunities,
  competitors: paths.competitors,
  scorecard: paths.scorecard,
  evidence: paths.evidence,
  settings: paths.settings,
  appendix: paths.appendix,
} as const

