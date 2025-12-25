/**
 * Breadcrumb utilities for project pages
 * Provides consistent breadcrumb generation based on route structure
 */

export interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

/**
 * Generate breadcrumbs for a project route
 * 
 * Rules:
 * - Decision page: Projects / {Project} / Decision
 * - Opportunities list: Projects / {Project} / Opportunities
 * - Opportunity detail: Projects / {Project} / Opportunities / {Opportunity}
 * - Evidence: Projects / {Project} / Evidence
 * - Other pages follow similar pattern
 */
export function generateBreadcrumbs(
  pathname: string,
  projectId: string,
  projectName: string,
  options?: {
    opportunityTitle?: string
    evidenceType?: string
  }
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      label: 'Projects',
      href: '/dashboard',
    },
    {
      label: projectName,
      href: `/projects/${projectId}/decision`,
    },
  ]

  // Decision page (default route)
  if (
    pathname === `/projects/${projectId}/decision` ||
    pathname === `/projects/${projectId}` ||
    (pathname === `/projects/${projectId}/` && !pathname.includes('/opportunities') && !pathname.includes('/evidence'))
  ) {
    items.push({
      label: 'Decision',
      isActive: true,
    })
    return items
  }

  // Opportunities list
  if (pathname === `/projects/${projectId}/opportunities`) {
    items.push({
      label: 'Opportunities',
      isActive: true,
    })
    return items
  }

  // Opportunity detail
  if (pathname.startsWith(`/projects/${projectId}/opportunities/`)) {
    items.push({
      label: 'Opportunities',
      href: `/projects/${projectId}/opportunities`,
    })
    if (options?.opportunityTitle) {
      items.push({
        label: options.opportunityTitle,
        isActive: true,
      })
    } else {
      items.push({
        label: 'Opportunity',
        isActive: true,
      })
    }
    return items
  }

  // Evidence
  if (pathname === `/projects/${projectId}/evidence` || pathname.startsWith(`/projects/${projectId}/evidence`)) {
    items.push({
      label: 'Evidence',
      isActive: pathname === `/projects/${projectId}/evidence`,
    })
    if (options?.evidenceType && pathname !== `/projects/${projectId}/evidence`) {
      items.push({
        label: options.evidenceType,
        isActive: true,
      })
    }
    return items
  }

  // Competitors
  if (pathname === `/projects/${projectId}/competitors`) {
    items.push({
      label: 'Competitors',
      isActive: true,
    })
    return items
  }

  // Scorecard
  if (pathname === `/projects/${projectId}/scorecard`) {
    items.push({
      label: 'Scorecard',
      isActive: true,
    })
    return items
  }

  // Appendix
  if (pathname === `/projects/${projectId}/appendix`) {
    items.push({
      label: 'Appendix',
      isActive: true,
    })
    return items
  }

  // Settings
  if (pathname === `/projects/${projectId}/settings`) {
    items.push({
      label: 'Settings',
      isActive: true,
    })
    return items
  }

  // Fallback: use the last segment of the path
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  if (lastSegment && lastSegment !== projectId) {
    items.push({
      label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1),
      isActive: true,
    })
  }

  return items
}

