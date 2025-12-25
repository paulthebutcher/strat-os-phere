/**
 * Canonical project navigation configuration
 * Single source of truth for project-level navigation items
 */

import {
  Target,
  ClipboardList,
  Users,
  FileText,
  Settings,
  FileCode,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { projectRoutes } from '@/lib/routing/projectRoutes'

export type ProjectNavItemId =
  | 'opportunities'
  | 'competitors'
  | 'scorecard'
  | 'evidence'
  | 'appendix'
  | 'settings'

export interface ProjectNavItem {
  id: ProjectNavItemId
  label: string
  href: (projectId: string) => string
  icon: LucideIcon
  // Path matchers: paths that should count as active for this item
  matchers: (projectId: string) => string[]
  // Optional group for collapsible sections (e.g., "Appendix")
  group?: string
}

/**
 * Canonical project navigation items in display order
 */
export const PROJECT_NAV_ITEMS: ProjectNavItem[] = [
  {
    id: 'opportunities',
    label: 'Opportunities',
    href: projectRoutes.opportunities,
    icon: Target,
    matchers: (id) => [
      `/projects/${id}`,
      `/projects/${id}/opportunities`,
      `/projects/${id}/results`, // Legacy results route
    ],
  },
  {
    id: 'competitors',
    label: 'Competitors',
    href: projectRoutes.competitors,
    icon: Users,
    matchers: (id) => [
      `/projects/${id}/competitors`,
    ],
  },
  {
    id: 'scorecard',
    label: 'Scorecard',
    href: projectRoutes.scorecard,
    icon: ClipboardList,
    matchers: (id) => [
      `/projects/${id}/scorecard`,
    ],
  },
  {
    id: 'evidence',
    label: 'Evidence',
    href: projectRoutes.evidence,
    icon: FileText,
    matchers: (id) => [
      `/projects/${id}/evidence`,
    ],
  },
  {
    id: 'appendix',
    label: 'Appendix',
    href: projectRoutes.appendix,
    icon: FileCode,
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
    matchers: (id) => [
      `/projects/${id}/settings`,
    ],
  },
]

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
    if (matchers.some((matcher) => pathname === matcher || pathname.startsWith(matcher + '/'))) {
      return item.id
    }
  }

  return null
}

