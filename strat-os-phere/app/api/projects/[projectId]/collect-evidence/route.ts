import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { buildTargetUrls } from '@/lib/extract/targets'
import { extractWithSourceType } from '@/lib/extract/specialized'
import { upsertEvidenceSource } from '@/lib/evidence/evidenceWriter'
import { getSearchProvider } from '@/lib/search'
import { MAX_PAGES_PER_COMPETITOR } from '@/lib/constants'
import { logger } from '@/lib/logger'
import { fetchUrlsParallel, TOTAL_FETCH_BUDGET_MS_PER_COMPETITOR, type FetchedPage } from '@/lib/evidence/parallelFetch'
import { performShortlist, DEFAULT_SHORTLIST_QUOTA } from '@/lib/evidence/shortlist'
import { toFetchedPage } from '@/lib/evidence/normalizeToFetchedPage'
import { FLAGS } from '@/lib/flags'
import { resolveActiveRunId } from '@/lib/runs/activeRun'
import { ok, fail } from '@/lib/contracts/api'
import { appErrorToCode, errorCodeToStatus } from '@/lib/contracts/errors'
import { toAppError } from '@/lib/errors/errors'
import { RunIdSchema } from '@/lib/contracts/domain'
import { z } from 'zod'

/**
 * Response schema for collect-evidence endpoint
 */
const CollectEvidenceResponseSchema = z.object({
  runId: RunIdSchema,
  message: z.string(),
})

type CollectEvidenceResponse = z.infer<typeof CollectEvidenceResponseSchema>

/**
 * POST /api/projects/[projectId]/collect-evidence
 * Collects evidence for all competitors in a project (evidence-only, no analysis)
 * This is a "soft start" that runs in the background
 * 
 * Requires runId (via body or resolved from active run)
 * Returns ApiResponse<{ runId, message }>
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<{ ok: true; data: CollectEvidenceResponse } | { ok: false; error: { code: string; message: string; details?: Record<string, unknown> } }>> {
  const { projectId } = await params

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        fail('UNAUTHENTICATED', 'You must be signed in to collect evidence'),
        { status: 401 }
      )
    }

    // Parse request body to get optional runId
    let body: { runId?: string } | null = null
    try {
      const rawBody = await request.text()
      if (rawBody) {
        body = JSON.parse(rawBody)
      }
    } catch {
      // Body is optional, so ignore parse errors
    }

    // Resolve active run ID (prefer explicit runId from body, else latest, don't create)
    const runResolution = await resolveActiveRunId(supabase, projectId, {
      runIdOverride: body?.runId ?? null,
      allowCreate: false,
    })

    if (!runResolution.runId) {
      logger.error('[collect-evidence] No run found and cannot create', {
        projectId,
        userId: user.id,
      })
      return NextResponse.json(
        fail('NOT_READY', 'No analysis run found. Please generate an analysis first.', {
          code: 'NO_RUN',
        }),
        { status: 400 }
      )
    }

    const runId = runResolution.runId

    // Get all competitors for the project
    const competitors = await listCompetitorsForProject(supabase, projectId)

    if (competitors.length === 0) {
      return NextResponse.json(
        fail('NOT_READY', 'No competitors found. Please add competitors first.'),
        { status: 400 }
      )
    }

    logger.info('[collect-evidence] Starting evidence collection', {
      projectId,
      runId,
      userId: user.id,
      competitorCount: competitors.length,
      runSource: runResolution.source,
    })

    // Collect evidence for each competitor (non-blocking, fire and forget)
    // We don't await this - it runs in the background
    Promise.all(
      competitors.map(async (competitor) => {
        try {
          if (!competitor.url) {
            logger.warn('[collect-evidence] Competitor has no URL', {
              competitorId: competitor.id,
              name: competitor.name,
            })
            return
          }

          // Extract domain
          let domain: string
          try {
            const url = new URL(competitor.url.startsWith('http') ? competitor.url : `https://${competitor.url}`)
            domain = url.hostname.replace(/^www\./, '')
          } catch {
            domain = competitor.url.replace(/^www\./, '').replace(/^https?:\/\//, '').split('/')[0]
          }

          logger.info('[collect-evidence] Collecting for competitor', {
            competitorId: competitor.id,
            name: competitor.name,
            domain,
          })

          let sources: Awaited<ReturnType<typeof fetchUrlsParallel>>['results']

          if (FLAGS.evidenceOptimize) {
            // Optimized path
            const targetUrls = buildTargetUrls(domain)
            const urlsToFetch = targetUrls.slice(0, MAX_PAGES_PER_COMPETITOR).map((t) => ({
              url: t.url,
              label: t.label,
            }))

            // Add review search URLs
            try {
              const searchProvider = getSearchProvider()
              const reviewQuery = `${competitor.name} reviews G2 Capterra Trustpilot`
              const reviewResults = await searchProvider.search(reviewQuery, 2)
              for (const review of reviewResults) {
                if (review.url) {
                  urlsToFetch.push({ url: review.url, label: 'Review' })
                }
              }
            } catch (error) {
              logger.warn('[collect-evidence] Review search failed', error)
            }

            const { results: fetchedPages } = await fetchUrlsParallel(
              supabase,
              urlsToFetch,
              {
                budgetMs: TOTAL_FETCH_BUDGET_MS_PER_COMPETITOR,
              }
            )

            const { shortlisted } = await performShortlist(
              supabase,
              fetchedPages,
              DEFAULT_SHORTLIST_QUOTA
            )

            sources = shortlisted.map(toFetchedPage)
          } else {
            // Legacy path
            const targetUrls = buildTargetUrls(domain)
            const extractionResults = await Promise.all(
              targetUrls.slice(0, MAX_PAGES_PER_COMPETITOR).map(async (target) => {
                const extracted = await extractWithSourceType(target.url, target.label)
                if (!extracted) {
                  return null
                }
                return {
                  url: extracted.url,
                  title: extracted.title || target.label,
                  extracted: {
                    text: extracted.text,
                    title: extracted.title || target.label,
                    sourceType: extracted.sourceType,
                    confidence: extracted.confidence || null,
                  },
                }
              })
            )

            sources = extractionResults.filter((s) => s !== null) as typeof sources
          }

          // Store evidence sources
          await Promise.all(
            sources
              .filter((page): page is FetchedPage & { extracted: NonNullable<FetchedPage['extracted']> } => 
                page.extracted !== undefined
              )
              .map(async (page) => {
                const result = await upsertEvidenceSource(supabase, {
                  projectId,
                  runId,
                  competitorId: competitor.id,
                  url: page.url,
                  sourceType: page.extracted.sourceType,
                  pageTitle: page.title || page.extracted.title || null,
                  extractedText: page.extracted.text,
                  extractedAt: new Date().toISOString(),
                  sourceConfidence: page.extracted.confidence || null,
                })

              if (!result.ok) {
                logger.error(`[collect-evidence] Failed to store evidence source`, {
                  error: result.error,
                  projectId,
                  competitorId: competitor.id,
                  url: page.url,
                })
              }
            })
          )

          logger.info('[collect-evidence] Completed for competitor', {
            projectId,
            runId,
            competitorId: competitor.id,
            sourcesCount: sources.length,
          })
        } catch (error) {
          logger.error('[collect-evidence] Error collecting for competitor', {
            competitorId: competitor.id,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      })
    ).catch((error) => {
      logger.error('[collect-evidence] Background collection error', error)
    })

    // Return immediately - collection runs in background
    logger.info('[collect-evidence] Evidence collection initiated', {
      projectId,
      runId,
      userId: user.id,
      competitorCount: competitors.length,
      runSource: runResolution.source,
    })

    const responseData: CollectEvidenceResponse = {
      runId,
      message: 'Evidence collection started',
    }
    
    // Validate outgoing payload
    const validated = CollectEvidenceResponseSchema.parse(responseData)
    return NextResponse.json(ok(validated))
  } catch (error) {
    logger.error('[collect-evidence] Failed to start evidence collection', error)
    const appError = toAppError(error, { projectId, route: '/api/projects/[projectId]/collect-evidence' })
    const errorCode = appErrorToCode(appError)
    const statusCode = errorCodeToStatus(errorCode)
    
    return NextResponse.json(
      fail(errorCode, appError.userMessage, {
        details: appError.details,
      }),
      { status: statusCode }
    )
  }
}

