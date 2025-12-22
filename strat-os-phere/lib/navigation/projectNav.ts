/**
 * Centralized project navigation configuration
 * This is the single source of truth for project navigation items
 */

import type { NavItem, NavItemId } from './appNav'
import { NAV_ITEMS } from './appNav'

/**
 * Get navigation item by ID
 */
export function getNavItem(id: NavItemId): NavItem | undefined {
  return NAV_ITEMS.find((item) => item.id === id)
}

/**
 * Get all navigation items
 */
export function getAllNavItems(): NavItem[] {
  return NAV_ITEMS
}

/**
 * Get navigation items that should be visible based on conditions
 * 
 * @param hasArtifacts - Whether the project has any artifacts
 * @param hasStrategicBets - Whether strategic bets artifact exists
 * @param hasEvidence - Whether evidence exists
 */
export function getVisibleNavItems(options: {
  hasArtifacts?: boolean
  hasStrategicBets?: boolean
  hasEvidence?: boolean
}): NavItem[] {
  const { hasArtifacts = false, hasStrategicBets = false, hasEvidence = false } = options

  return NAV_ITEMS.filter((item) => {
    // Always show non-conditional items
    if (!item.conditional) {
      return true
    }

    // Show conditional items based on availability
    if (item.id === 'strategic_bets') {
      return hasStrategicBets
    }

    if (item.id === 'evidence') {
      return hasEvidence
    }

    // For other conditional items, show if artifacts exist
    return hasArtifacts
  })
}

/**
 * Build href for a navigation item
 */
export function buildNavHref(projectId: string, navItemId: NavItemId): string {
  const item = getNavItem(navItemId)
  if (!item) {
    throw new Error(`Navigation item not found: ${navItemId}`)
  }
  return item.href(projectId)
}

/**
 * Check if a pathname matches a navigation item
 */
export function matchesNavItem(pathname: string, navItemId: NavItemId, projectId: string): boolean {
  const href = buildNavHref(projectId, navItemId)
  return pathname === href || pathname.startsWith(href + '/')
}

