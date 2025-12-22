import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { buildTargetUrls } from '@/lib/extract/targets'
import { extractWithSourceType } from '@/lib/extract/specialized'
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
import { getSearchProvider } from '@/lib/search'
import { FLAGS } from '@/lib/flags'
import { fetchUrlsParallel, TOTAL_FETCH_BUDGET_MS_PER_COMPETITOR } from '@/lib/evidence/parallelFetch'
import { performShortlist, DEFAULT_SHORTLIST_QUOTA } from '@/lib/evidence/shortlist'

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

    const fetchStartTime = Date.now()

    // Use optimized path if flag is enabled
    let sources: Awaited<ReturnType<typeof getEvidenceSourcesForDomain>>

    if (FLAGS.evidenceOptimize) {
      logger.info('[evidence/generate] Using optimized evidence fetch', { domain })

      // Build target URLs
      const targetUrls = buildTargetUrls(domain)
      const urlsToFetch = targetUrls.slice(0, MAX_PAGES_PER_COMPETITOR).map((t) => ({
        url: t.url,
        label: t.label,
      }))

      // Add review search URLs if available
      try {
        const searchProvider = getSearchProvider()
        const reviewQuery = `${competitorName} reviews G2 Capterra Trustpilot`
        const reviewResults = await searchProvider.search(reviewQuery, 2)
        for (const review of reviewResults) {
          if (review.url) {
            urlsToFetch.push({ url: review.url, label: 'Review' })
          }
        }
      } catch (error) {
        logger.warn('[evidence/generate] Review search failed', error)
      }

      // Parallel fetch with caching
      const { results: fetchedPages, stats: fetchStats } = await fetchUrlsParallel(
        supabase,
        urlsToFetch,
        {
          budgetMs: TOTAL_FETCH_BUDGET_MS_PER_COMPETITOR,
        }
      )

      logger.info('[evidence/generate] Fetch completed', {
        total: fetchStats.total,
        cacheHits: fetchStats.cacheHits,
        cacheMisses: fetchStats.cacheMisses,
        successes: fetchStats.successes,
        failures: fetchStats.failures,
        totalTimeMs: fetchStats.totalTimeMs,
        cacheHitRate: fetchStats.total > 0 ? (fetchStats.cacheHits / fetchStats.total).toFixed(2) : '0.00',
      })

      // Two-pass shortlist
      const shortlistStartTime = Date.now()
      const { shortlisted, stats: shortlistStats } = await performShortlist(
        supabase,
        fetchedPages,
        DEFAULT_SHORTLIST_QUOTA
      )
      const shortlistTimeMs = Date.now() - shortlistStartTime

      logger.info('[evidence/generate] Shortlist completed', {
        totalFetched: shortlistStats.totalFetched,
        summariesGenerated: shortlistStats.summariesGenerated,
        shortlistedCount: shortlistStats.shortlistedCount,
        passATimeMs: shortlistStats.passATimeMs,
        shortlistTimeMs,
      })

      // Convert shortlisted pages to evidence sources format
      const extractionResults = await Promise.all(
        shortlisted.map(async (page) => {
          try {
            const source = await createEvidenceSource(supabase, {
              project_id: projectId,
              competitor_id: null,
              domain,
              url: page.url,
              extracted_text: page.extracted.text,
              page_title: page.title || page.extracted.title || null,
              source_type: page.extracted.sourceType,
              source_confidence: page.extracted.confidence,
              source_date_range: page.extracted.dateRange || null,
              extracted_at: new Date().toISOString(),
            })
            return source
          } catch (error) {
            logger.error(`Failed to store evidence source for ${page.url}`, error)
            // Return a temporary source structure
            return {
              id: `temp-${Date.now()}-${Math.random()}`,
              project_id: projectId,
              competitor_id: null,
              domain,
              url: page.url,
              extracted_text: page.extracted.text,
              page_title: page.title || page.extracted.title || null,
              source_type: page.extracted.sourceType,
              source_confidence: page.extracted.confidence,
              source_date_range: page.extracted.dateRange || null,
              extracted_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            } as Awaited<ReturnType<typeof getEvidenceSourcesForDomain>>[0]
          }
        })
      )

      sources = extractionResults.filter((s) => s !== null)
      
      const totalTimeMs = Date.now() - fetchStartTime
      logger.info('[evidence/generate] Optimized path completed', {
        totalTimeMs,
        sourcesCount: sources.length,
      })
    } else {
      // Legacy path (original implementation)
      logger.info('[evidence/generate] Using legacy evidence fetch', { domain })

      const cachedSources = await getEvidenceSourcesForDomain(
        supabase,
        projectId,
        domain
      )

      sources = cachedSources.filter((s) => isCacheValid(s.extracted_at))

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

            const extracted = await extractWithSourceType(target.url, target.label)

            if (!extracted) {
              logger.warn(`Failed to extract ${target.url}`)
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
                source_type: extracted.sourceType,
                source_confidence: extracted.confidence,
                source_date_range: extracted.dateRange || null,
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
                source_type: extracted.sourceType,
                source_confidence: extracted.confidence,
                source_date_range: extracted.dateRange || null,
                extracted_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              } as typeof sources[0]
            }
          })
        )

        // Also search for reviews (limited to 2-3 results to stay within page limits)
        try {
          const searchProvider = getSearchProvider()
          const reviewQuery = `${competitorName} reviews G2 Capterra Trustpilot`
          logger.info('[evidence/generate] Searching for reviews', { query: reviewQuery })
          
          const reviewResults = await searchProvider.search(reviewQuery, 2)
          
          for (const review of reviewResults) {
            if (review.url) {
              const extracted = await extractWithSourceType(review.url)
              if (extracted && extracted.sourceType === 'reviews') {
                try {
                  const source = await createEvidenceSource(supabase, {
                    project_id: projectId,
                    competitor_id: null,
                    domain,
                    url: extracted.url,
                    extracted_text: extracted.text,
                    page_title: extracted.title || review.title || null,
                    source_type: 'reviews',
                    source_confidence: 'medium',
                    source_date_range: null,
                    extracted_at: new Date().toISOString(),
                  })
                  extractionResults.push(source)
                } catch (error) {
                  logger.warn(`Failed to store review source: ${review.url}`, error)
                }
              }
            }
          }
        } catch (error) {
          // Don't fail if review search fails - it's optional
          logger.warn('[evidence/generate] Review search failed', error)
        }

        sources = extractionResults.filter(
          (s): s is typeof sources[0] => s !== null
        )
      } else {
        logger.info('[evidence/generate] Using cached sources', {
          domain,
          sourceCount: sources.length,
        })
      }
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

    // Build LLM prompt with source type information
    const extractedContent = sources.map((source) => ({
      url: source.url,
      text: source.extracted_text,
      title: source.page_title || undefined,
      sourceType: source.source_type || 'marketing_site',
      confidence: source.source_confidence || null,
      dateRange: source.source_date_range || null,
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
