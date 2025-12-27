/**
 * Canonical Project Navigation Schema
 * 
 * This is the SINGLE SOURCE OF TRUTH for project navigation structure.
 * 
 * Rules:
 * - Never hide steps conditionally. If unavailable, render disabled + status text.
 * - Never reorder steps based on state.
 * - Never conditionally render different group headings.
 * - Selection highlight is based only on current route.
 * - Status metadata is optional but must not change layout height significantly.
 * 
 * To add a new step:
 * 1. Add it to the PROJECT_NAV_STEPS array in the correct position
 * 2. Add the icon mapping in ProjectNav component
 * 3. Add the route in lib/routes.ts
 * 4. Update this comment if the structure changes
 */

import {
  Scale,
  Users,
  FileText,
  ClipboardList,
  Archive,
  Settings,
  ArrowLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { paths } from '@/lib/routes'

export type ProjectNavStepId =
  | 'decision'
  | 'competitors'
  | 'evidence'
  | 'scorecard'
  | 'appendix'
  | 'settings'

export interface ProjectNavStep {
  id: ProjectNavStepId
  label: string
  href: (projectId: string) => string
  icon: LucideIcon
  // Path matchers: paths that should count as active for this item
  matchers: (projectId: string) => string[]
}

/**
 * Canonical project navigation steps in display order
 * 
 * Structure:
 * - Top utility: Back to Projects (link)
 * - Project context: Project title
 * - WORKFLOW (project-scoped):
 *   1. Decision
 *   2. Competitors
 *   3. Evidence
 *   4. Scorecard
 *   5. Appendix
 * - META: Settings (pinned/sticky at bottom)
 */
export const PROJECT_NAV_STEPS: ProjectNavStep[] = [
  {
    id: 'decision',
    label: 'Decision',
    href: paths.decision,
    icon: Scale,
    matchers: (id) => [
      paths.project(id),
      paths.decision(id),
    ],
  },
  {
    id: 'competitors',
    label: 'Competitors',
    href: paths.competitors,
    icon: Users,
    matchers: (id) => [
      paths.competitors(id),
    ],
  },
  {
    id: 'evidence',
    label: 'Evidence',
    href: paths.evidence,
    icon: FileText,
    matchers: (id) => [
      paths.evidence(id),
      `${paths.evidence(id)}/`,
    ],
  },
  {
    id: 'scorecard',
    label: 'Scorecard',
    href: paths.scorecard,
    icon: ClipboardList,
    matchers: (id) => [
      paths.scorecard(id),
    ],
  },
  {
    id: 'appendix',
    label: 'Appendix',
    href: paths.appendix,
    icon: Archive,
    matchers: (id) => [
      paths.appendix(id),
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    href: paths.settings,
    icon: Settings,
    matchers: (id) => [
      paths.settings(id),
    ],
  },
] as const

/**
 * Get workflow steps (all except settings)
 */
export function getWorkflowSteps(): ProjectNavStep[] {
  return PROJECT_NAV_STEPS.filter(step => step.id !== 'settings')
}

/**
 * Get settings step (always last)
 */
export function getSettingsStep(): ProjectNavStep | undefined {
  return PROJECT_NAV_STEPS.find(step => step.id === 'settings')
}

/**
 * Get the active nav step ID based on the current pathname
 */
export function getActiveNavStep(
  pathname: string | null,
  projectId: string
): ProjectNavStepId | null {
  if (!pathname) return null

  // Check each step's matchers
  for (const step of PROJECT_NAV_STEPS) {
    const matchers = step.matchers(projectId)
    if (matchers.some(matcher => pathname === matcher || pathname.startsWith(matcher + '/'))) {
      return step.id
    }
  }

  return null
}

