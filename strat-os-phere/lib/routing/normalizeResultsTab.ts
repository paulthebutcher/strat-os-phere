/**
 * Routing normalization helper for Results page
 * Prevents tab explosion and redirect loops
 */

import type { TabId } from '@/lib/ui/resultsTab'

/**
 * Legacy tab values that should be mapped to canonical tabs
 */
const LEGACY_TAB_MAP: Record<string, TabId> = {
  'opportunities_legacy': 'opportunities_v3',
  'opportunities_v2_legacy': 'opportunities_v3',
  'opps': 'opportunities_v3',
  'opp': 'opportunities_v3',
}

/**
 * Canonical tab for Opportunities (preferred)
 */
const CANONICAL_OPPORTUNITIES_TAB: TabId = 'opportunities_v3'

/**
 * Normalize a tab parameter to a canonical tab value
 * 
 * Rules:
 * - If tab is missing, return null (use default from resolveResultsTab)
 * - If legacy tab values exist, map them to canonical tab
 * - Avoid redirects that cause loops (only redirect if URL is truly different)
 * 
 * @param tabParam - The tab parameter from URL
 * @returns Normalized tab ID or null if should use default
 */
export function normalizeResultsTab(tabParam: string | null | undefined): TabId | null {
  if (!tabParam) {
    return null // Use default from resolveResultsTab
  }

  // Check if it's a legacy tab value
  const normalized = LEGACY_TAB_MAP[tabParam.toLowerCase()]
  if (normalized) {
    return normalized
  }

  // If it's already a valid tab ID, return as-is
  // (validation happens in resolveResultsTab)
  return tabParam as TabId
}

/**
 * Check if a tab parameter needs normalization
 * Returns true if the tab should be normalized (redirect needed)
 */
export function needsTabNormalization(tabParam: string | null | undefined): boolean {
  if (!tabParam) {
    return false
  }

  const normalized = normalizeResultsTab(tabParam)
  return normalized !== null && normalized !== tabParam
}

/**
 * Get canonical tab URL for Opportunities
 * Use this when redirecting from legacy opportunities routes
 */
export function getCanonicalOpportunitiesUrl(projectId: string, basePath: string = '/results'): string {
  return `/projects/${projectId}${basePath}?tab=${CANONICAL_OPPORTUNITIES_TAB}`
}

