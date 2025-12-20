/**
 * Build a list of target URLs to scrape for a competitor
 * Generates common page paths based on the domain
 */

export interface TargetUrl {
  url: string
  label: string // e.g., "Homepage", "Pricing", "Features"
}

/**
 * Build target URLs for a given domain
 * Returns up to MAX_PAGES_PER_COMPETITOR URLs
 */
export function buildTargetUrls(domainOrUrl: string): TargetUrl[] {
  // Normalize to domain
  let domain = domainOrUrl.trim()
  
  // If it's already a full URL, extract domain
  try {
    const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`)
    domain = url.hostname.replace(/^www\./, '')
  } catch {
    // If URL parsing fails, assume it's already a domain
    domain = domain.replace(/^www\./, '').replace(/^https?:\/\//, '').split('/')[0]
  }

  const baseUrl = `https://${domain}`
  
  const targets: TargetUrl[] = [
    { url: baseUrl, label: 'Homepage' },
    { url: `${baseUrl}/pricing`, label: 'Pricing' },
    { url: `${baseUrl}/features`, label: 'Features' },
    { url: `${baseUrl}/security`, label: 'Security' },
    { url: `${baseUrl}/docs`, label: 'Documentation' },
    { url: `${baseUrl}/about`, label: 'About' },
    { url: `${baseUrl}/solutions`, label: 'Solutions' },
    { url: `${baseUrl}/product`, label: 'Product' },
  ]

  return targets.slice(0, 5) // MAX_PAGES_PER_COMPETITOR
}

