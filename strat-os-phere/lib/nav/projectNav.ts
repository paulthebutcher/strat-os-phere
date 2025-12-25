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
import { paths, matchProjectSection } from '@/lib/routes'

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
    href: paths.decision,
    icon: Scale, // Scale = judgment/verdict
    category: 'primary',
    matchers: (id) => [
      paths.project(id),
      paths.decision(id),
    ],
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    href: paths.opportunities,
    icon: Target, // Target = candidates/opportunities (scanning for strategic options)
    category: 'primary',
    matchers: (id) => [
      paths.opportunities(id),
      `/projects/${id}/results`, // Legacy results route
    ],
  },
  // Supporting: Drill-down details and reference
  {
    id: 'competitors',
    label: 'Competitors',
    href: paths.competitors,
    icon: Users,
    category: 'supporting',
    matchers: (id) => [
      paths.competitors(id),
    ],
  },
  {
    id: 'scorecard',
    label: 'Scorecard',
    href: paths.scorecard,
    icon: ClipboardList,
    category: 'supporting',
    matchers: (id) => [
      paths.scorecard(id),
    ],
  },
  {
    id: 'evidence',
    label: 'Evidence',
    href: paths.evidence,
    icon: FileText, // FileText = evidence/sources (changed from LinkIcon per PR requirements)
    category: 'supporting',
    matchers: (id) => [
      paths.evidence(id),
      // Include evidence subpages if any
      `${paths.evidence(id)}/`,
    ],
  },
  {
    id: 'appendix',
    label: 'Appendix',
    href: paths.appendix,
    icon: Archive, // Archive = reference/storage (more semantic than FileCode)
    category: 'supporting',
    matchers: (id) => [
      paths.appendix(id),
    ],
    group: 'appendix', // Can be made collapsible later
  },
  {
    id: 'settings',
    label: 'Settings',
    href: paths.settings,
    icon: Settings,
    category: 'supporting',
    matchers: (id) => [
      paths.settings(id),
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
 * 
 * Uses matchProjectSection for consistent matching logic
 */
export function getActiveNavItem(
  pathname: string | null,
  projectId: string
): ProjectNavItemId | null {
  if (!pathname) return null

  // Use the canonical matchProjectSection function for consistency
  const section = matchProjectSection(pathname)
  
  // Verify the section is a valid nav item ID
  const validNavItemIds: ProjectNavItemId[] = [
    'decision',
    'opportunities',
    'competitors',
    'scorecard',
    'evidence',
    'appendix',
    'settings',
  ]
  
  if (validNavItemIds.includes(section as ProjectNavItemId)) {
    return section as ProjectNavItemId
  }

  return null
}

