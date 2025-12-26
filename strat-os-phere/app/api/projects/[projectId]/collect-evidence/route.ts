import 'server-only'
import { NextResponse } from 'next/server'
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
import {
  getOrCreateActiveRun,
  advanceRun,
  markStepCompleted,
  markStepFailed,
  getStepStatus,
  type StepName,
} from '@/lib/runs/orchestrator'
import { ok } from '@/lib/contracts/api'
import { RunIdSchema } from '@/lib/contracts/domain'
import { z } from 'zod'
import {
  generateRequestId,
  requireUser,
  requireProjectOwner,
  parseParams,
  parseBody,
  respondOk,
  respondError,
} from '@/lib/api/routeGuard'
import { mapErrorToApiResponse } from '@/lib/api/mapErrorToApiError'

/**
 * Response schema for collect-evidence endpoint
 */
const CollectEvidenceResponseSchema = z.object({
  runId: RunIdSchema,
  message: z.string(),
})

type CollectEvidenceResponse = z.infer<typeof CollectEvidenceResponseSchema>

/**
 * Request body schema (optional)
 */
const CollectEvidenceBodySchema = z.object({
  runId: RunIdSchema.optional(),
}).optional()

/**
 * POST /api/projects/[projectId]/collect-evidence
 * Collects evidence for all competitors in a project (evidence-only, no analysis)
 * 
 * Idempotent behavior:
 * - If evidence step already completed, return success immediately
 * - If evidence step is running, return current status (don't start another)
 * - If evidence step failed, allow retry (reset and re-run)
 * 
 * Returns ApiResponse<{ runId, message }>
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<{ ok: true; data: CollectEvidenceResponse } | { ok: false; error: { code: string; message: string; details?: Record<string, unknown>; requestId?: string } }>> {
  const requestId = generateRequestId()

  try {
    // Require authentication
    const authResult = await requireUser(requestId)
    if (!authResult.ok) {
      return authResult.response
    }
    const ctx = authResult.value

    // Validate projectId param
    const rawParams = await params
    const paramsResult = parseParams(
      z.object({ projectId: z.string().uuid() }),
      rawParams,
      requestId
    )
    if (!paramsResult.ok) {
      return paramsResult.response
    }
    const { projectId } = paramsResult.value

    // Require project ownership
    const ownershipResult = await requireProjectOwner(ctx, projectId)
    if (!ownershipResult.ok) {
      return ownershipResult.response
    }

    // Parse optional request body
    const bodyResult = await parseBody(
      CollectEvidenceBodySchema,
      request,
      requestId,
      false // body is optional
    )
    if (!bodyResult.ok) {
      return bodyResult.response
    }
    const body = bodyResult.value

    // Get or create active run (idempotent)
    const runResult = await getOrCreateActiveRun(ctx.supabase, projectId, ctx.user.id, {
      runId: body?.runId,
      allowCreate: true,
    })

    if (!runResult.ok) {
      // Map orchestrator error codes to contract error codes
      const errorCode = runResult.error.code === 'NO_ACTIVE_RUN' || runResult.error.code === 'NO_INPUTS'
        ? 'NOT_READY'
        : 'INTERNAL_ERROR'
      return respondError(errorCode, runResult.error.message, { projectId }, requestId)
    }

    const run = runResult.run
    const runId = run.id

    // Check evidence step status
    const evidenceStepStatus = getStepStatus(run, 'evidence')

    // If step already completed, return success immediately
    if (evidenceStepStatus.status === 'completed') {
      logger.info('[collect-evidence] Evidence step already completed', {
        requestId,
        projectId,
        runId,
      })
      const responseData: CollectEvidenceResponse = {
        runId,
        message: 'Evidence collection already completed',
      }
      const validated = CollectEvidenceResponseSchema.parse(responseData)
      return respondOk(validated, requestId)
    }

    // If step is running, return current status (don't start another)
    if (evidenceStepStatus.status === 'running') {
      logger.info('[collect-evidence] Evidence step already running', {
        requestId,
        projectId,
        runId,
      })
      const responseData: CollectEvidenceResponse = {
        runId,
        message: 'Evidence collection in progress',
      }
      const validated = CollectEvidenceResponseSchema.parse(responseData)
      return respondOk(validated, requestId)
    }

    // Advance run to evidence step (idempotent, handles retry if failed)
    const advanceResult = await advanceRun(ctx.supabase, runId, 'evidence')
    if (!advanceResult.ok) {
      return respondError('INTERNAL_ERROR', advanceResult.error.message, { projectId, runId }, requestId)
    }

    // Get all competitors for the project
    const competitors = await listCompetitorsForProject(ctx.supabase, projectId)

    if (competitors.length === 0) {
      // Mark step as failed
      await markStepFailed(ctx.supabase, runId, 'evidence', {
        code: 'NO_COMPETITORS',
        message: 'No competitors found. Please add competitors first.',
      })
      return respondError('NOT_READY', 'No competitors found. Please add competitors first.', { projectId }, requestId)
    }

    logger.info('[collect-evidence] Starting evidence collection', {
      requestId,
      projectId,
      runId,
      userId: ctx.user.id,
      competitorCount: competitors.length,
      action: advanceResult.action,
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
              ctx.supabase,
              urlsToFetch,
              {
                budgetMs: TOTAL_FETCH_BUDGET_MS_PER_COMPETITOR,
              }
            )

            const { shortlisted } = await performShortlist(
              ctx.supabase,
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

          // Store evidence sources (idempotent via upsertEvidenceSource)
          await Promise.all(
            sources
              .filter((page): page is FetchedPage & { extracted: NonNullable<FetchedPage['extracted']> } => 
                page.extracted !== undefined
              )
              .map(async (page) => {
                const result = await upsertEvidenceSource(ctx.supabase, {
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
    )
      .then(async () => {
        // Mark evidence step as completed
        await markStepCompleted(ctx.supabase, runId, 'evidence')
        logger.info('[collect-evidence] Evidence collection completed', {
          requestId,
          projectId,
          runId,
        })
      })
      .catch(async (error) => {
        // Mark evidence step as failed
        await markStepFailed(ctx.supabase, runId, 'evidence', {
          code: 'COLLECTION_ERROR',
          message: 'Failed to collect evidence',
          detail: error instanceof Error ? error.message : String(error),
        })
        logger.error('[collect-evidence] Background collection error', {
          requestId,
          error,
        })
      })

    // Return immediately - collection runs in background
    logger.info('[collect-evidence] Evidence collection initiated', {
      requestId,
      projectId,
      runId,
      userId: ctx.user.id,
      competitorCount: competitors.length,
    })

    const responseData: CollectEvidenceResponse = {
      runId,
      message: 'Evidence collection started',
    }
    
    // Validate outgoing payload
    const validated = CollectEvidenceResponseSchema.parse(responseData)
    return respondOk(validated, requestId)
  } catch (error) {
    logger.error('[collect-evidence] Failed to start evidence collection', {
      requestId,
      error,
    })
    const { response, statusCode } = mapErrorToApiResponse(
      error,
      requestId,
      { route: '/api/projects/[projectId]/collect-evidence' }
    )
    return NextResponse.json(response, { status: statusCode })
  }
}

