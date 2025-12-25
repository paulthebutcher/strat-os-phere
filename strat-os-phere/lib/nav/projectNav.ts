/**
 * Canonical project navigation configuration
 * Single source of truth for project-level navigation items
 */

import {
  Scale,
  Target,
  ClipboardList,
  Users,
  FileText,
  Settings,
  Archive,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { projectRoutes } from '@/lib/routing/projectRoutes'

export type ProjectNavItemId =
  | 'decision'
  | 'opportunities'
  | 'competitors'
  | 'scorecard'
  | 'evidence'
  | 'appendix'
  | 'settings'

export type NavItemCategory = 'primary' | 'supporting'

export interface ProjectNavItem {
  id: ProjectNavItemId
  label: string
  href: (projectId: string) => string
  icon: LucideIcon
  // Path matchers: paths that should count as active for this item
  matchers: (projectId: string) => string[]
  // Category: primary (main destinations) vs supporting (drill-down)
  category: NavItemCategory
  // Optional group for collapsible sections (e.g., "Appendix")
  group?: string
}

/**
 * Canonical project navigation items in display order
 * Organized by hierarchy: Primary (main destinations) vs Supporting (drill-down)
 */
export const PROJECT_NAV_ITEMS: ProjectNavItem[] = [
  // Primary: Main destinations - where users start and make decisions
  {
    id: 'decision',
    label: 'Decision',
    href: projectRoutes.decision,
    icon: Scale, // Scale = judgment/verdict
    category: 'primary',
    matchers: (id) => [
      `/projects/${id}`,
      `/projects/${id}/decision`,
    ],
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    href: projectRoutes.opportunities,
    icon: Target, // Target = candidates/opportunities (scanning for strategic options)
    category: 'primary',
    matchers: (id) => [
      `/projects/${id}/opportunities`,
      `/projects/${id}/results`, // Legacy results route
    ],
  },
  // Supporting: Drill-down details and reference
  {
    id: 'competitors',
    label: 'Competitors',
    href: projectRoutes.competitors,
    icon: Users,
    category: 'supporting',
    matchers: (id) => [
      `/projects/${id}/competitors`,
    ],
  },
  {
    id: 'scorecard',
    label: 'Scorecard',
    href: projectRoutes.scorecard,
    icon: ClipboardList,
    category: 'supporting',
    matchers: (id) => [
      `/projects/${id}/scorecard`,
    ],
  },
  {
    id: 'evidence',
    label: 'Evidence',
    href: projectRoutes.evidence,
    icon: FileText, // FileText = evidence/sources (changed from LinkIcon per PR requirements)
    category: 'supporting',
    matchers: (id) => [
      `/projects/${id}/evidence`,
      // Include evidence subpages if any
      `/projects/${id}/evidence/`,
    ],
  },
  {
    id: 'appendix',
    label: 'Appendix',
    href: projectRoutes.appendix,
    icon: Archive, // Archive = reference/storage (more semantic than FileCode)
    category: 'supporting',
    matchers: (id) => [
      `/projects/${id}/appendix`,
    ],
    group: 'appendix', // Can be made collapsible later
  },
  {
    id: 'settings',
    label: 'Settings',
    href: projectRoutes.settings,
    icon: Settings,
    category: 'supporting',
    matchers: (id) => [
      `/projects/${id}/settings`,
    ],
  },
]

/**
 * Get primary navigation items (Decision, Opportunities)
 */
export function getPrimaryNavItems(): ProjectNavItem[] {
  return PROJECT_NAV_ITEMS.filter(item => item.category === 'primary')
}

/**
 * Get supporting navigation items (Competitors, Scorecard, Evidence, Appendix, Settings)
 */
export function getSupportingNavItems(): ProjectNavItem[] {
  return PROJECT_NAV_ITEMS.filter(item => item.category === 'supporting')
}

/**
 * Get the active nav item ID based on the current pathname
 */
export function getActiveNavItem(
  pathname: string | null,
  projectId: string
): ProjectNavItemId | null {
  if (!pathname) return null

  for (const item of PROJECT_NAV_ITEMS) {
    const matchers = item.matchers(projectId)
    // Check exact match or if pathname starts with matcher followed by / or end of string
    if (matchers.some((matcher) => {
      if (pathname === matcher) return true
      // For opportunities, also match detail routes like /projects/{id}/opportunities/{opportunityId}
      if (item.id === 'opportunities' && pathname.startsWith(matcher + '/')) return true
      // For evidence, also match subpages
      if (item.id === 'evidence' && pathname.startsWith(matcher + '/')) return true
      // For other routes, only exact match or direct child
      if (pathname.startsWith(matcher + '/')) return true
      return false
    })) {
      return item.id
    }
  }

  return null
}

