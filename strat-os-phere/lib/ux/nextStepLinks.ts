/**
 * Next Step Links - Maps confidence increase items to actionable routes
 * 
 * Provides safe route suggestions based on text content heuristics.
 * Returns null if no confident mapping can be made (no broken links).
 */

/**
 * Suggest a route href based on text content
 * 
 * Uses simple heuristics to map confidence increase items to existing routes.
 * Returns null if no confident mapping can be made.
 * 
 * @param text - The confidence increase item text
 * @param projectId - Optional project ID for building routes
 * @returns Route href or null
 */
export function suggestNextStepHref(
  text: string,
  projectId?: string
): string | null {
  if (!projectId) {
    return null
  }

  const lowerText = text.toLowerCase()

  // Map to competitors route
  if (
    lowerText.includes('competitor') ||
    lowerText.includes('add competitor') ||
    lowerText.includes('more competitors')
  ) {
    return `/projects/${projectId}/competitors`
  }

  // Map to evidence route
  if (
    lowerText.includes('evidence') ||
    lowerText.includes('sources') ||
    lowerText.includes('coverage') ||
    lowerText.includes('add evidence') ||
    lowerText.includes('more evidence') ||
    lowerText.includes('data')
  ) {
    return `/projects/${projectId}/evidence`
  }

  // Map to rerun/generate (anchor to opportunities page with scroll)
  if (
    lowerText.includes('rerun') ||
    lowerText.includes('run again') ||
    lowerText.includes('regenerate') ||
    lowerText.includes('generate')
  ) {
    // Return opportunities page - user can trigger rerun from there
    return `/projects/${projectId}/opportunities`
  }

  // No confident mapping
  return null
}

