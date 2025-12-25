/**
 * Canonical route builders for project pages
 * Single source of truth for project navigation routes
 */

export const projectRoutes = {
  decision: (id: string) => `/projects/${id}/decision`,
  opportunities: (id: string) => `/projects/${id}/opportunities`,
  competitors: (id: string) => `/projects/${id}/competitors`,
  scorecard: (id: string) => `/projects/${id}/scorecard`,
  evidence: (id: string) => `/projects/${id}/evidence`,
  settings: (id: string) => `/projects/${id}/settings`,
  appendix: (id: string) => `/projects/${id}/appendix`,
} as const

