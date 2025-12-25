/**
 * Canonical route map - single source of truth for all project routes
 * 
 * This file provides:
 * - Type-safe route builders (paths.*)
 * - Route matching utilities (matchProjectSection)
 * - Breadcrumb generation helpers
 * 
 * Rule: After this PR, no raw string concatenation for project links.
 * Everything must go through paths.*
 */

export type ProjectSectionId =
  | "decision"
  | "opportunities"
  | "competitors"
  | "scorecard"
  | "evidence"
  | "appendix"
  | "settings";

/**
 * Type-safe route builders for all project routes
 * 
 * Usage:
 * - paths.decision(projectId) → "/projects/{id}/decision"
 * - paths.opportunity(projectId, opportunityId) → "/projects/{id}/opportunities/{oppId}"
 */
export const paths = {
  projects: () => `/projects`,
  project: (projectId: string) => `/projects/${projectId}`,
  decision: (projectId: string) => `/projects/${projectId}/decision`,
  opportunities: (projectId: string) => `/projects/${projectId}/opportunities`,
  opportunity: (projectId: string, opportunityId: string) =>
    `/projects/${projectId}/opportunities/${opportunityId}`,
  competitors: (projectId: string) => `/projects/${projectId}/competitors`,
  scorecard: (projectId: string) => `/projects/${projectId}/scorecard`,
  evidence: (projectId: string) => `/projects/${projectId}/evidence`,
  appendix: (projectId: string) => `/projects/${projectId}/appendix`,
  settings: (projectId: string) => `/projects/${projectId}/settings`,
} as const;

/**
 * Route configuration for navigation and breadcrumbs
 */
export interface RouteConfig {
  id: ProjectSectionId
  label: string
  group?: "primary" | "details"
  path: (projectId: string) => string
}

export const ROUTES: Record<ProjectSectionId, RouteConfig> = {
  decision: {
    id: "decision",
    label: "Decision",
    group: "primary",
    path: paths.decision,
  },
  opportunities: {
    id: "opportunities",
    label: "Opportunities",
    group: "primary",
    path: paths.opportunities,
  },
  competitors: {
    id: "competitors",
    label: "Competitors",
    group: "details",
    path: paths.competitors,
  },
  scorecard: {
    id: "scorecard",
    label: "Scorecard",
    group: "details",
    path: paths.scorecard,
  },
  evidence: {
    id: "evidence",
    label: "Evidence",
    group: "details",
    path: paths.evidence,
  },
  appendix: {
    id: "appendix",
    label: "Appendix",
    group: "details",
    path: paths.appendix,
  },
  settings: {
    id: "settings",
    label: "Settings",
    group: "details",
    path: paths.settings,
  },
} as const;

/**
 * Match the active project section from a pathname
 * 
 * Handles detail routes (e.g., /opportunities/[id]) by returning their parent section.
 * 
 * @param pathname - The current pathname (e.g., "/projects/123/opportunities/456")
 * @returns The matching ProjectSectionId, or "decision" as default
 * 
 * Examples:
 * - "/projects/123/decision" → "decision"
 * - "/projects/123/opportunities" → "opportunities"
 * - "/projects/123/opportunities/456" → "opportunities" (detail route highlights parent)
 * - "/projects/123" → "decision" (default)
 */
export function matchProjectSection(pathname: string): ProjectSectionId {
  // Handle detail routes - they highlight their parent section
  if (pathname.includes("/opportunities/")) return "opportunities";
  
  // Match exact section routes
  if (pathname.endsWith("/decision")) return "decision";
  if (pathname.endsWith("/opportunities")) return "opportunities";
  if (pathname.endsWith("/competitors")) return "competitors";
  if (pathname.endsWith("/scorecard")) return "scorecard";
  if (pathname.endsWith("/evidence")) return "evidence";
  if (pathname.endsWith("/appendix")) return "appendix";
  if (pathname.endsWith("/settings")) return "settings";
  
  // Default to decision for project root
  return "decision";
}

/**
 * Generate breadcrumbs for a project route
 * 
 * @param pathname - Current pathname
 * @param projectId - Project ID
 * @param params - Optional params for detail routes (e.g., opportunityId, opportunityTitle)
 * @returns Array of breadcrumb items
 */
export interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

export interface BreadcrumbParams {
  projectName?: string
  opportunityId?: string
  opportunityTitle?: string
  evidenceType?: string
}

export function breadcrumbsFor(
  pathname: string,
  projectId: string,
  params?: BreadcrumbParams
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      label: "Projects",
      href: "/dashboard",
    },
  ]

  // Add project name if provided
  if (params?.projectName) {
    items.push({
      label: params.projectName,
      href: paths.decision(projectId),
    })
  }

  // Decision page (default route)
  if (
    pathname === paths.decision(projectId) ||
    pathname === paths.project(projectId) ||
    pathname === `${paths.project(projectId)}/`
  ) {
    items.push({
      label: "Decision",
      isActive: true,
    })
    return items
  }

  // Opportunities list
  if (pathname === paths.opportunities(projectId)) {
    items.push({
      label: "Opportunities",
      isActive: true,
    })
    return items
  }

  // Opportunity detail
  if (pathname.startsWith(`${paths.opportunities(projectId)}/`)) {
    items.push({
      label: "Opportunities",
      href: paths.opportunities(projectId),
    })
    if (params?.opportunityTitle) {
      items.push({
        label: params.opportunityTitle,
        isActive: true,
      })
    } else {
      items.push({
        label: "Opportunity",
        isActive: true,
      })
    }
    return items
  }

  // Evidence
  if (pathname === paths.evidence(projectId) || pathname.startsWith(`${paths.evidence(projectId)}/`)) {
    items.push({
      label: "Evidence",
      isActive: pathname === paths.evidence(projectId),
    })
    if (params?.evidenceType && pathname !== paths.evidence(projectId)) {
      items.push({
        label: params.evidenceType,
        isActive: true,
      })
    }
    return items
  }

  // Competitors
  if (pathname === paths.competitors(projectId)) {
    items.push({
      label: "Competitors",
      isActive: true,
    })
    return items
  }

  // Scorecard
  if (pathname === paths.scorecard(projectId)) {
    items.push({
      label: "Scorecard",
      isActive: true,
    })
    return items
  }

  // Appendix
  if (pathname === paths.appendix(projectId)) {
    items.push({
      label: "Appendix",
      isActive: true,
    })
    return items
  }

  // Settings
  if (pathname === paths.settings(projectId)) {
    items.push({
      label: "Settings",
      isActive: true,
    })
    return items
  }

  // Fallback: use the last segment of the path
  const segments = pathname.split("/").filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  if (lastSegment && lastSegment !== projectId) {
    items.push({
      label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1),
      isActive: true,
    })
  }

  return items
}

