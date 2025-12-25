/**
 * Breadcrumb utilities for project pages
 * Provides consistent breadcrumb generation based on route structure
 * 
 * @deprecated Use breadcrumbsFor from @/lib/routes instead
 * This file is kept for backward compatibility during migration
 */

import { breadcrumbsFor, type BreadcrumbItem, type BreadcrumbParams } from '@/lib/routes'

export type { BreadcrumbItem }

/**
 * Generate breadcrumbs for a project route
 * 
 * @deprecated Use breadcrumbsFor from @/lib/routes instead
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
  const params: BreadcrumbParams = {
    projectName,
    opportunityTitle: options?.opportunityTitle,
    evidenceType: options?.evidenceType,
  }
  
  return breadcrumbsFor(pathname, projectId, params)
}

