/**
 * Tab resolution helper for Results page
 * Ensures deterministic tab selection and canonical URL enforcement
 */

export const TAB_IDS = [
  'profiles',
  'themes',
  'positioning',
  'opportunities',
  'angles',
  'jobs',
  'scorecard',
  'opportunities_v2',
  'opportunities_v3',
  'strategic_bets',
] as const

export type TabId = typeof TAB_IDS[number]

export interface TabResolution {
  tab: TabId
  isValid: boolean
  needsRedirect: boolean
}

export interface TabAvailability {
  hasOpportunitiesV3: boolean
  hasStrategicBets: boolean
  hasOpportunitiesV2: boolean
  hasJobs: boolean
  hasScorecard: boolean
  hasProfiles: boolean
  hasSynthesis: boolean
}

/**
 * Safely narrows a string value to a valid TabId
 * Returns undefined if the value is not a valid tab ID
 */
export function asTabId(value: string | null | undefined): TabId | undefined {
  if (!value) return undefined
  return TAB_IDS.includes(value as TabId) ? (value as TabId) : undefined
}

/**
 * Determines which tabs are available based on data availability
 */
export function getAvailableTabs(availability: TabAvailability): TabId[] {
  const available: TabId[] = []
  
  if (availability.hasOpportunitiesV3) {
    available.push('opportunities_v3')
  }
  if (availability.hasStrategicBets) {
    available.push('strategic_bets')
  }
  if (availability.hasOpportunitiesV2) {
    available.push('opportunities_v2')
  }
  if (availability.hasScorecard) {
    available.push('scorecard')
  }
  if (availability.hasJobs) {
    available.push('jobs')
  }
  if (availability.hasSynthesis) {
    available.push('themes', 'positioning', 'opportunities', 'angles')
  }
  if (availability.hasProfiles) {
    available.push('profiles')
  }
  
  return available
}

/**
 * Computes the preferred default tab based on availability
 * Priority: opportunities_v3 > strategic_bets > opportunities_v2 > scorecard > jobs
 */
export function getPreferredDefaultTab(availability: TabAvailability): TabId {
  if (availability.hasOpportunitiesV3) {
    return 'opportunities_v3'
  }
  if (availability.hasStrategicBets) {
    return 'strategic_bets'
  }
  if (availability.hasOpportunitiesV2) {
    return 'opportunities_v2'
  }
  if (availability.hasScorecard) {
    return 'scorecard'
  }
  if (availability.hasJobs) {
    return 'jobs'
  }
  // Fallback to a tab that should always be available if any artifacts exist
  return 'profiles'
}

/**
 * Resolves the tab parameter to a valid TabId with canonicalization logic
 * 
 * @param tabParam - The tab parameter from URL searchParams
 * @param availability - Which tabs are available based on data
 * @returns TabResolution with the resolved tab, validity, and redirect requirement
 */
export function resolveResultsTab(
  tabParam: string | null | undefined,
  availability: TabAvailability
): TabResolution {
  const availableTabs = getAvailableTabs(availability)
  const preferredDefault = getPreferredDefaultTab(availability)
  
  // If no tab param provided, use default
  if (!tabParam) {
    return {
      tab: preferredDefault,
      isValid: true,
      needsRedirect: true, // Always redirect to canonical URL with tab
    }
  }
  
  // Try to parse as valid TabId
  const parsedTab = asTabId(tabParam)
  
  // If not a valid TabId, use default
  if (!parsedTab) {
    return {
      tab: preferredDefault,
      isValid: false,
      needsRedirect: true,
    }
  }
  
  // If tab is not available, use default
  if (!availableTabs.includes(parsedTab)) {
    return {
      tab: preferredDefault,
      isValid: false,
      needsRedirect: true,
    }
  }
  
  // Valid and available tab
  return {
    tab: parsedTab,
    isValid: true,
    needsRedirect: false,
  }
}

