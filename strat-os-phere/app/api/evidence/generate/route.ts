import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
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

export const runtime = 'nodejs'

// Request validation schema
const GenerateEvidenceRequestSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  competitorName: z.string().min(1, 'competitorName is required'),
  domainOrUrl: z.string().min(1, 'domainOrUrl is required'),
})

interface GenerateEvidenceResponse {
  ok: true
  draft: EvidenceDraft
}

interface GenerateEvidenceError {
  ok: false
  error: string
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
 * POST /api/evidence/generate
 */
export async function POST(request: Request) {
  try {
    logger.info('[evidence/generate] Starting evidence generation')

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON in request body' } as GenerateEvidenceError,
        { status: 400 }
      )
    }

    const validationResult = GenerateEvidenceRequestSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      return NextResponse.json(
        { ok: false, error: `Validation failed: ${errorMessage}` } as GenerateEvidenceError,
        { status: 400 }
      )
    }

    const { projectId, competitorName, domainOrUrl } = validationResult.data

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' } as GenerateEvidenceError,
        { status: 401 }
      )
    }

    // Extract domain
    const domain = extractDomain(domainOrUrl)

    logger.info('[evidence/generate] Domain extracted', { domain, competitorName })

    // Check for cached sources
    const cachedSources = await getEvidenceSourcesForDomain(
      supabase,
      projectId,
      domain
    )

    let sources = cachedSources.filter((s) => isCacheValid(s.extracted_at))

    if (sources.length === 0) {
      // Need to fetch new sources
      logger.info('[evidence/generate] No cache hit, fetching pages', { domain })

      const targetUrls = buildTargetUrls(domain)
      const extractionResults = await Promise.all(
        targetUrls.slice(0, MAX_PAGES_PER_COMPETITOR).map(async (target, index) => {
          logger.info(
            `[evidence/generate] Fetching page ${index + 1}/${targetUrls.length}`,
            { url: target.url, label: target.label }
          )

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
      logger.info('[evidence/generate] Using cached sources', {
        domain,
        sourceCount: sources.length,
      })
    }

    if (sources.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'Could not extract any content from the provided domain. Please try manual entry.',
      } as GenerateEvidenceError)
    }

    logger.info('[evidence/generate] Generating evidence draft from sources', {
      sourceCount: sources.length,
    })

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
    const parseResult = safeParseLLMJson(llmResponse.text, EvidenceDraftSchema)

    if (!parseResult.ok) {
      logger.error('Failed to parse evidence draft', parseResult.error)
      return NextResponse.json({
        ok: false,
        error: `Failed to generate evidence draft: ${parseResult.error}`,
      } as GenerateEvidenceError)
    }

    logger.info('[evidence/generate] Evidence draft generated successfully')

    const response: GenerateEvidenceResponse = {
      ok: true,
      draft: parseResult.data,
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Failed to generate evidence draft', error)
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate evidence draft. Please try again.',
      } as GenerateEvidenceError,
      { status: 500 }
    )
  }
}
