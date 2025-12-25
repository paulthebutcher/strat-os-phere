import { PAGE_IDS, type PageId } from './content'

/**
 * Maps a pathname to a page ID for guidance content.
 * Provides safe defaults for unknown routes.
 */
export function routeToPageId(pathname: string): PageId {
  // Remove leading/trailing slashes and normalize
  const normalized = pathname.replace(/^\/|\/$/g, '')

  // Landing page
  if (normalized === '' || normalized === 'login') {
    return PAGE_IDS.landing
  }

  // Dashboard
  if (normalized === 'dashboard') {
    return PAGE_IDS.dashboard
  }

  // New project
  if (normalized === 'projects/new') {
    return PAGE_IDS.newProject
  }

  // Opportunity detail page
  if (normalized.match(/^projects\/[^/]+\/opportunities\/[^/]+$/)) {
    return PAGE_IDS.opportunityDetail
  }

  // Competitors page
  if (normalized.match(/^projects\/[^/]+\/competitors$/)) {
    return PAGE_IDS.competitors
  }

  // Decision page (primary entry point)
  if (
    normalized.match(/^projects\/[^/]+\/decision$/) ||
    normalized.match(/^projects\/[^/]+\/decision\?/) ||
    normalized.match(/^projects\/[^/]+$/) // Root project route now redirects to decision
  ) {
    return PAGE_IDS.decision
  }

  // Results/Opportunities page
  if (
    normalized.match(/^projects\/[^/]+\/(results|opportunities)$/) ||
    normalized.match(/^projects\/[^/]+\/results\?/)
  ) {
    return PAGE_IDS.results
  }

  // Default to dashboard for authenticated routes
  if (normalized.startsWith('projects/')) {
    return PAGE_IDS.dashboard
  }

  // Default fallback
  return PAGE_IDS.landing
}

