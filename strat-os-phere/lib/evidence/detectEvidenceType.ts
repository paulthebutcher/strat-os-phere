/**
 * PR4.5: Evidence type detection based on URL, title, and snippet analysis
 * Deterministic, priority-based classifier for evidence type detection
 */

export type EvidenceType =
  | 'pricing'
  | 'docs'
  | 'changelog'
  | 'reviews'
  | 'community'
  | 'security'
  | 'jobs'
  | 'case_studies'
  | 'other'

export interface DetectEvidenceTypeInput {
  url: string
  title?: string
  snippet?: string
}

/**
 * Detect evidence type from URL, title, and snippet
 * Uses priority-based matching (first match wins)
 */
export function detectEvidenceType(input: DetectEvidenceTypeInput): EvidenceType {
  const { url, title = '', snippet = '' } = input

  // Normalize inputs for matching
  const urlLower = url.toLowerCase()
  const titleLower = title.toLowerCase()
  const snippetLower = snippet.toLowerCase()
  const combinedText = `${titleLower} ${snippetLower}`.trim()

  // Priority 1: URL path/hostname signals (most reliable)
  let urlPath = ''
  let hostname = ''
  
  try {
    // Ensure URL has protocol for parsing
    const urlToParse = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`
    const urlObj = new URL(urlToParse)
    urlPath = urlObj.pathname.toLowerCase()
    hostname = urlObj.hostname.toLowerCase()
  } catch {
    // If URL parsing fails, fall back to keyword matching only
    urlPath = ''
    hostname = ''
  }

  // Pricing signals
  if (
    urlPath.includes('/pricing') ||
    urlPath.includes('/plans') ||
    urlPath.includes('/billing') ||
    urlPath.includes('/price')
  ) {
    return 'pricing'
  }

  // Docs signals
  if (
    urlPath.includes('/docs') ||
    urlPath.includes('/documentation') ||
    urlPath.includes('/api') ||
    urlPath.includes('/guide') ||
    urlPath.includes('/guides')
  ) {
    return 'docs'
  }

  // Changelog signals
  if (
    urlPath.includes('/changelog') ||
    urlPath.includes('/release-notes') ||
    urlPath.includes('/releases') ||
    urlPath.includes('/updates') ||
    urlPath.includes('/whats-new') ||
    urlPath.includes('/what-s-new')
  ) {
    return 'changelog'
  }

  // Reviews/community signals (hostname-based)
  if (
    hostname.includes('g2.com') ||
    hostname.includes('capterra.com') ||
    hostname.includes('trustpilot.com') ||
    hostname.includes('trustradius.com') ||
    hostname.includes('reddit.com') ||
    hostname.includes('producthunt.com')
  ) {
    // Distinguish between reviews and community
    if (hostname.includes('reddit.com') || hostname.includes('producthunt.com')) {
      return 'community'
    }
    return 'reviews'
  }

  // Security signals
  if (
    urlPath.includes('/security') ||
    urlPath.includes('/trust') ||
    urlPath.includes('/compliance') ||
    urlPath.includes('/soc-2') ||
    urlPath.includes('/soc2') ||
    urlPath.includes('/gdpr') ||
    urlPath.includes('/privacy-policy')
  ) {
    return 'security'
  }

  // Jobs signals
  if (
    urlPath.includes('/careers') ||
    urlPath.includes('/jobs') ||
    urlPath.includes('/hiring') ||
    urlPath.includes('/openings') ||
    hostname.includes('greenhouse.io') ||
    hostname.includes('lever.co') ||
    hostname.includes('workable.com')
  ) {
    return 'jobs'
  }

  // Case studies signals
  if (
    urlPath.includes('/case-study') ||
    urlPath.includes('/case-studies') ||
    urlPath.includes('/customers') ||
    urlPath.includes('/customer-stories') ||
    urlPath.includes('/success-stories')
  ) {
    return 'case_studies'
  }

  // Priority 2: Title/snippet keyword fallback
  // Pricing keywords
  if (
    combinedText.includes('pricing') ||
    combinedText.includes('plans') ||
    combinedText.includes('cost') ||
    combinedText.includes('price') ||
    combinedText.includes('tier') ||
    combinedText.includes('subscription')
  ) {
    return 'pricing'
  }

  // Docs keywords
  if (
    combinedText.includes('how to') ||
    combinedText.includes('guide') ||
    combinedText.includes('api') ||
    combinedText.includes('documentation') ||
    combinedText.includes('tutorial') ||
    combinedText.includes('getting started')
  ) {
    return 'docs'
  }

  // Changelog keywords
  if (
    combinedText.includes("what's new") ||
    combinedText.includes('release') ||
    combinedText.includes('changelog') ||
    combinedText.includes('update') ||
    combinedText.includes('announcement')
  ) {
    return 'changelog'
  }

  // Reviews keywords
  if (
    combinedText.includes('review') ||
    combinedText.includes('rating') ||
    combinedText.includes('feedback') ||
    combinedText.includes('testimonial')
  ) {
    return 'reviews'
  }

  // Community keywords
  if (
    combinedText.includes('forum') ||
    combinedText.includes('community') ||
    combinedText.includes('discussion') ||
    combinedText.includes('thread') ||
    combinedText.includes('discord') ||
    combinedText.includes('slack')
  ) {
    return 'community'
  }

  // Security keywords
  if (
    combinedText.includes('security') ||
    combinedText.includes('compliance') ||
    combinedText.includes('soc 2') ||
    combinedText.includes('gdpr') ||
    combinedText.includes('encryption')
  ) {
    return 'security'
  }

  // Jobs keywords
  if (
    combinedText.includes('careers') ||
    combinedText.includes('hiring') ||
    combinedText.includes('job opening') ||
    combinedText.includes('we are hiring')
  ) {
    return 'jobs'
  }

  // Case studies keywords
  if (
    combinedText.includes('case study') ||
    combinedText.includes('customer story') ||
    combinedText.includes('success story') ||
    combinedText.includes('how ') && combinedText.includes(' uses ')
  ) {
    return 'case_studies'
  }

  // Default: other
  return 'other'
}

