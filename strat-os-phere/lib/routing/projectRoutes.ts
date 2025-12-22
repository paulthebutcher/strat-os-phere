/**
 * Canonical route builders for project pages
 * Single source of truth for project navigation routes
 */

export const projectRoutes = {
  opportunities: (id: string) => `/projects/${id}/opportunities`,
  competitors: (id: string) => `/projects/${id}/competitors`,
  scorecard: (id: string) => `/projects/${id}/scorecard`,
  evidence: (id: string) => `/projects/${id}/evidence`,
  settings: (id: string) => `/projects/${id}/settings`,
  appendix: (id: string) => `/projects/${id}/appendix`,
  overview: (id: string) => `/projects/${id}/overview`,
} as const

