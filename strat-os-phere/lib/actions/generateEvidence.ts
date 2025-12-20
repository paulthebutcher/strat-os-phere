/**
 * Server action for generating evidence drafts from web search and scraping
 */

'use server'

import { buildTargetUrls } from '@/lib/extract/targets'
import { fetchAndExtract } from '@/lib/extract/fetchAndExtract'
import { buildEvidenceMessages } from '@/lib/prompts/evidence'
import { callLLM } from '@/lib/llm/callLLM'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'
import { EvidenceDraftSchema, type EvidenceDraft } from '@/lib/schemas/evidenceDraft'
import {
  createEvidenceSource,
  getEvidenceSourcesForDomain,
} from '@/lib/data/evidenceSources'
import { createClient } from '@/lib/supabase/server'
import { MAX_PAGES_PER_COMPETITOR, EVIDENCE_CACHE_TTL_HOURS } from '@/lib/constants'
import { logger } from '@/lib/logger'

export interface GenerateEvidenceResult {
  success: boolean
  draft?: EvidenceDraft
  error?: string
  progress?: string
}

/**
 * Extract domain from URL or use as-is if already a domain
 */
function extractDomain(input: string): string {
  try {
    const url = new URL(input.startsWith('http') ? input : `https://${input}`)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return input.replace(/^www\./, '').replace(/^https?:\/\//, '').split('/')[0]
  }
}

/**
 * Check if cached sources are still fresh (within TTL)
 */
function isCacheValid(extractedAt: string): boolean {
  const extracted = new Date(extractedAt)
  const now = new Date()
  const hoursDiff = (now.getTime() - extracted.getTime()) / (1000 * 60 * 60)
  return hoursDiff < EVIDENCE_CACHE_TTL_HOURS
}

/**
 * Generate evidence draft from a competitor name or URL
 */
export async function generateEvidenceDraft(
  projectId: string,
  competitorName: string,
  domainOrUrl: string,
  onProgress?: (message: string) => void
): Promise<GenerateEvidenceResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Extract domain
    const domain = extractDomain(domainOrUrl)

    onProgress?.(`Searching for ${competitorName}...`)

    // Check for cached sources
    const cachedSources = await getEvidenceSourcesForDomain(
      supabase,
      projectId,
      domain
    )

    let sources = cachedSources.filter((s) => isCacheValid(s.extracted_at))

    if (sources.length === 0) {
      // Need to fetch new sources
      onProgress?.(`Fetching pages for ${domain}...`)

      const targetUrls = buildTargetUrls(domain)
      const extractionResults = await Promise.all(
        targetUrls.slice(0, MAX_PAGES_PER_COMPETITOR).map(async (target, index) => {
          onProgress?.(`Fetching ${index + 1}/${targetUrls.length} pages: ${target.label}...`)
          
          const extracted = await fetchAndExtract(target.url)
          
          if (extracted.error || !extracted.text) {
            logger.warn(`Failed to extract ${target.url}: ${extracted.error}`)
            return null
          }

          // Store in database
          try {
            const source = await createEvidenceSource(supabase, {
              project_id: projectId,
              competitor_id: null, // Will be linked when competitor is created
              domain,
              url: extracted.url,
              extracted_text: extracted.text,
              page_title: extracted.title || null,
              extracted_at: new Date().toISOString(),
            })
            return source
          } catch (error) {
            logger.error(`Failed to store evidence source for ${target.url}`, error)
            // Continue even if storage fails - we can still use the extracted content
            return {
              id: `temp-${Date.now()}-${index}`,
              project_id: projectId,
              competitor_id: null,
              domain,
              url: extracted.url,
              extracted_text: extracted.text,
              page_title: extracted.title || null,
              extracted_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            } as typeof sources[0]
          }
        })
      )

      sources = extractionResults.filter(
        (s): s is typeof sources[0] => s !== null
      )
    } else {
      onProgress?.(`Using cached sources for ${domain}...`)
    }

    if (sources.length === 0) {
      return {
        success: false,
        error: 'Could not extract any content from the provided domain. Please try manual entry.',
      }
    }

    onProgress?.(`Generating evidence draft from ${sources.length} sources...`)

    // Build LLM prompt
    const extractedContent = sources.map((source) => ({
      url: source.url,
      text: source.extracted_text,
      title: source.page_title || undefined,
    }))

    const messages = buildEvidenceMessages({
      competitorName,
      domain,
      extractedContent,
    })

    // Call LLM
    const llmResponse = await callLLM({
      messages,
      requestId: `evidence-${projectId}-${Date.now()}`,
    })

    // Parse response
    const parseResult = safeParseLLMJson(llmResponse.content, EvidenceDraftSchema)

    if (!parseResult.ok) {
      logger.error('Failed to parse evidence draft', parseResult.error)
      return {
        success: false,
        error: `Failed to generate evidence draft: ${parseResult.error}`,
      }
    }

    onProgress?.(`Evidence draft generated successfully`)

    return {
      success: true,
      draft: parseResult.data,
    }
  } catch (error) {
    logger.error('Failed to generate evidence draft', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate evidence draft. Please try again.',
    }
  }
}

