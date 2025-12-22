import type { PageId } from './content'

/**
 * Maps a pathname to a page ID for guidance content.
 * Provides safe defaults for unknown routes.
 */
export function routeToPageId(pathname: string): PageId {
  // Remove leading/trailing slashes and normalize
  const normalized = pathname.replace(/^\/|\/$/g, '')

  // Landing page
  if (normalized === '' || normalized === 'login') {
    return 'landing'
  }

  // Dashboard
  if (normalized === 'dashboard') {
    return 'dashboard'
  }

  // New project
  if (normalized === 'projects/new') {
    return 'new_project'
  }

  // Competitors page
  if (normalized.match(/^projects\/[^/]+\/competitors$/)) {
    return 'competitors'
  }

  // Results/Opportunities page
  if (
    normalized.match(/^projects\/[^/]+\/(results|opportunities)$/) ||
    normalized.match(/^projects\/[^/]+\/results\?/)
  ) {
    return 'results'
  }

  // Default to dashboard for authenticated routes
  if (normalized.startsWith('projects/')) {
    return 'dashboard'
  }

  // Default fallback
  return 'landing'
}

