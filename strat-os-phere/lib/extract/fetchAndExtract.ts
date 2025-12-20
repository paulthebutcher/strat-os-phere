/**
 * Fetch HTML from a URL and extract readable text content
 */

import { MAX_EXTRACTED_CHARS_PER_PAGE } from '@/lib/constants'

export interface ExtractedContent {
  url: string
  text: string
  title?: string
  truncated: boolean
  error?: string
}

/**
 * Fetch a URL and extract readable text content
 * Truncates to MAX_EXTRACTED_CHARS_PER_PAGE if needed
 */
export async function fetchAndExtract(url: string): Promise<ExtractedContent> {
  // Normalize URL - add https:// if no protocol
  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`
  }

  try {
    // Validate URL
    const urlObj = new URL(normalizedUrl)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are allowed')
    }

    // Fetch with timeout and user agent
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      const response = await fetch(normalizedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; PlinthBot/1.0; +https://plinth.ai)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return {
          url: normalizedUrl,
          text: '',
          truncated: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const html = await response.text()
      const extracted = extractTextFromHTML(html)

      // Extract title if available
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      const title = titleMatch ? titleMatch[1].trim() : undefined

      // Truncate if needed
      const truncated = extracted.length > MAX_EXTRACTED_CHARS_PER_PAGE
      const text = truncated
        ? extracted.slice(0, MAX_EXTRACTED_CHARS_PER_PAGE)
        : extracted

      return {
        url: normalizedUrl, // Return the normalized URL
        text,
        title,
        truncated,
      }
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        url: normalizedUrl,
        text: '',
        truncated: false,
        error: error.message,
      }
    }
    return {
      url: normalizedUrl,
      text: '',
      truncated: false,
      error: 'Unknown error occurred',
    }
  }
}

/**
 * Extract readable text from HTML
 * Removes script, style, and other non-content tags
 */
function extractTextFromHTML(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
  
  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '')

  // Replace block elements with newlines
  text = text.replace(/<\/?(div|p|br|li|h[1-6]|section|article|header|footer|nav|main|aside)[^>]*>/gi, '\n')
  
  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, '')
  
  // Decode HTML entities
  text = decodeHTMLEntities(text)
  
  // Normalize whitespace
  text = text.replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
  text = text.replace(/[ \t]+/g, ' ') // Collapse spaces
  text = text.replace(/[ \t]+\n/g, '\n') // Remove trailing spaces before newlines
  text = text.replace(/\n[ \t]+/g, '\n') // Remove leading spaces after newlines
  
  return text.trim()
}

/**
 * Decode HTML entities
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  }

  return text.replace(/&[#\w]+;/g, (entity) => {
    if (entities[entity]) {
      return entities[entity]
    }
    
    // Handle numeric entities like &#123; or &#x1F;
    const match = entity.match(/^&#(\d+);$/)
    if (match) {
      return String.fromCharCode(parseInt(match[1], 10))
    }
    
    const hexMatch = entity.match(/^&#x([0-9a-fA-F]+);$/)
    if (hexMatch) {
      return String.fromCharCode(parseInt(hexMatch[1], 16))
    }
    
    return entity // Return as-is if we can't decode
  })
}

