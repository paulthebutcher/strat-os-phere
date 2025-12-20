/**
 * Specialized extractors for different source types
 * Each extractor is designed to extract specific information from different page types
 */

import { fetchAndExtract } from './fetchAndExtract'
import type { EvidenceSourceType, EvidenceSourceConfidence } from '@/lib/supabase/types'
import { MAX_EXTRACTED_CHARS_PER_PAGE } from '@/lib/constants'

export interface ExtractedSource {
  url: string
  text: string
  title?: string
  sourceType: EvidenceSourceType
  confidence: EvidenceSourceConfidence
  dateRange?: string
}

/**
 * Detect source type from URL and page content
 */
export function detectSourceType(url: string, title?: string, text?: string): EvidenceSourceType {
  const urlLower = url.toLowerCase()
  const titleLower = (title || '').toLowerCase()
  const textLower = (text || '').toLowerCase()

  // Changelog detection
  if (
    urlLower.includes('changelog') ||
    urlLower.includes('release') ||
    urlLower.includes('updates') ||
    titleLower.includes('changelog') ||
    titleLower.includes('release notes')
  ) {
    return 'changelog'
  }

  // Pricing detection
  if (
    urlLower.includes('pricing') ||
    urlLower.includes('price') ||
    urlLower.includes('plan') ||
    titleLower.includes('pricing')
  ) {
    return 'pricing'
  }

  // Reviews detection (usually external sites)
  if (
    urlLower.includes('g2.com') ||
    urlLower.includes('capterra') ||
    urlLower.includes('trustpilot') ||
    urlLower.includes('reviews') ||
    textLower.includes('customer review')
  ) {
    return 'reviews'
  }

  // Jobs detection
  if (
    urlLower.includes('careers') ||
    urlLower.includes('jobs') ||
    urlLower.includes('hiring') ||
    urlLower.includes('openings') ||
    titleLower.includes('careers') ||
    titleLower.includes('jobs')
  ) {
    return 'jobs'
  }

  // Docs detection
  if (
    urlLower.includes('/docs') ||
    urlLower.includes('/documentation') ||
    urlLower.includes('/api') ||
    titleLower.includes('documentation') ||
    titleLower.includes('api reference')
  ) {
    return 'docs'
  }

  // Status page detection
  if (
    urlLower.includes('status') ||
    urlLower.includes('uptime') ||
    titleLower.includes('status')
  ) {
    return 'status'
  }

  // Default to marketing_site
  return 'marketing_site'
}

/**
 * Extract changelog entries from the last 6-12 months
 * Filters content by date patterns and limits to recent entries
 */
export async function extractChangelog(
  url: string
): Promise<ExtractedSource | null> {
  const extracted = await fetchAndExtract(url)
  
  if (extracted.error || !extracted.text) {
    return null
  }

  // Filter to last 6-12 months
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate())

  // Try to extract date-based sections
  const lines = extracted.text.split('\n')
  const recentLines: string[] = []
  let inRecentSection = false

  for (const line of lines) {
    // Look for date patterns: "January 2024", "2024-01-15", "Jan 15, 2024", etc.
    const datePatterns = [
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i,
      /\b\d{4}-\d{2}-\d{2}\b/,
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i,
    ]

    for (const pattern of datePatterns) {
      const match = line.match(pattern)
      if (match) {
        // Try to parse the date
        try {
          const dateStr = match[0]
          const parsedDate = new Date(dateStr)
          if (!isNaN(parsedDate.getTime()) && parsedDate >= twelveMonthsAgo) {
            inRecentSection = parsedDate >= sixMonthsAgo
            if (inRecentSection) {
              recentLines.push(line)
            }
            break
          }
        } catch {
          // If date parsing fails, include the line if we're in a recent section
          if (inRecentSection) {
            recentLines.push(line)
          }
        }
      } else if (inRecentSection) {
        recentLines.push(line)
      }
    }

    // If no date pattern found but we're in a recent section, include it
    if (inRecentSection && !datePatterns.some(p => p.test(line))) {
      recentLines.push(line)
    }
  }

  const filteredText = recentLines.length > 0 
    ? recentLines.join('\n').slice(0, MAX_EXTRACTED_CHARS_PER_PAGE)
    : extracted.text.slice(0, MAX_EXTRACTED_CHARS_PER_PAGE)

  return {
    url: extracted.url,
    text: filteredText,
    title: extracted.title,
    sourceType: 'changelog',
    confidence: recentLines.length > 0 ? 'high' : 'medium',
    dateRange: 'last 6-12 months',
  }
}

/**
 * Extract pricing information: plan names and feature constraints
 */
export async function extractPricing(url: string): Promise<ExtractedSource | null> {
  const extracted = await fetchAndExtract(url)
  
  if (extracted.error || !extracted.text) {
    return null
  }

  // Pricing pages are usually well-structured, so we can use the full text
  // The LLM will extract plan names and constraints from the structured content
  const text = extracted.text.slice(0, MAX_EXTRACTED_CHARS_PER_PAGE)

  return {
    url: extracted.url,
    text,
    title: extracted.title,
    sourceType: 'pricing',
    confidence: 'high',
  }
}

/**
 * Extract review summaries from search snippets
 * Only extracts from publicly available review sites (no login required)
 */
export async function extractReviews(url: string): Promise<ExtractedSource | null> {
  const extracted = await fetchAndExtract(url)
  
  if (extracted.error || !extracted.text) {
    return null
  }

  // Look for review-specific patterns: ratings, pros/cons, complaints, praises
  const text = extracted.text.slice(0, MAX_EXTRACTED_CHARS_PER_PAGE)

  // Confidence is medium for reviews since they're user-generated
  return {
    url: extracted.url,
    text,
    title: extracted.title,
    sourceType: 'reviews',
    confidence: 'medium',
  }
}

/**
 * Extract job postings: role titles and required skills
 */
export async function extractJobs(url: string): Promise<ExtractedSource | null> {
  const extracted = await fetchAndExtract(url)
  
  if (extracted.error || !extracted.text) {
    return null
  }

  // Jobs pages typically list roles and requirements
  // Extract the full text and let the LLM identify roles and skills
  const text = extracted.text.slice(0, MAX_EXTRACTED_CHARS_PER_PAGE)

  return {
    url: extracted.url,
    text,
    title: extracted.title,
    sourceType: 'jobs',
    confidence: 'high',
  }
}

/**
 * Extract documentation content
 */
export async function extractDocs(url: string): Promise<ExtractedSource | null> {
  const extracted = await fetchAndExtract(url)
  
  if (extracted.error || !extracted.text) {
    return null
  }

  const text = extracted.text.slice(0, MAX_EXTRACTED_CHARS_PER_PAGE)

  return {
    url: extracted.url,
    text,
    title: extracted.title,
    sourceType: 'docs',
    confidence: 'high',
  }
}

/**
 * Extract status page information
 */
export async function extractStatus(url: string): Promise<ExtractedSource | null> {
  const extracted = await fetchAndExtract(url)
  
  if (extracted.error || !extracted.text) {
    return null
  }

  const text = extracted.text.slice(0, MAX_EXTRACTED_CHARS_PER_PAGE)

  return {
    url: extracted.url,
    text,
    title: extracted.title,
    sourceType: 'status',
    confidence: 'high',
  }
}

/**
 * Extract from a URL with automatic source type detection
 */
export async function extractWithSourceType(
  url: string,
  label?: string
): Promise<ExtractedSource | null> {
  // First, fetch the page to detect source type
  const extracted = await fetchAndExtract(url)
  
  if (extracted.error || !extracted.text) {
    return null
  }

  // Detect source type
  const sourceType = detectSourceType(url, extracted.title, extracted.text)

  // Use specialized extractor if available
  switch (sourceType) {
    case 'changelog':
      return extractChangelog(url)
    case 'pricing':
      return extractPricing(url)
    case 'reviews':
      return extractReviews(url)
    case 'jobs':
      return extractJobs(url)
    case 'docs':
      return extractDocs(url)
    case 'status':
      return extractStatus(url)
    case 'marketing_site':
    default:
      return {
        url: extracted.url,
        text: extracted.text.slice(0, MAX_EXTRACTED_CHARS_PER_PAGE),
        title: extracted.title,
        sourceType: 'marketing_site',
        confidence: 'medium',
      }
  }
}

