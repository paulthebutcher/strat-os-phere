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
import {
  getOrCreateActiveRun,
  advanceRun,
  markStepCompleted,
  markStepFailed,
  getStepStatus,
  type StepName,
} from '@/lib/runs/orchestrator'
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

    // Get or create active run (idempotent)
    const runResult = await getOrCreateActiveRun(supabase, projectId, user.id, {
      runId: body?.runId,
      allowCreate: true,
    })

    if (!runResult.ok) {
      // Map orchestrator error codes to contract error codes
      const errorCode = runResult.error.code === 'NO_ACTIVE_RUN' || runResult.error.code === 'NO_INPUTS'
        ? 'NOT_READY'
        : 'INTERNAL_ERROR'
      return NextResponse.json(
        fail(errorCode, runResult.error.message),
        { status: 400 }
      )
    }

    const run = runResult.run
    const runId = run.id

    // Check evidence step status
    const evidenceStepStatus = getStepStatus(run, 'evidence')

    // If step already completed, return success immediately
    if (evidenceStepStatus.status === 'completed') {
      logger.info('[collect-evidence] Evidence step already completed', {
        projectId,
        runId,
      })
      const responseData: CollectEvidenceResponse = {
        runId,
        message: 'Evidence collection already completed',
      }
      const validated = CollectEvidenceResponseSchema.parse(responseData)
      return NextResponse.json(ok(validated))
    }

    // If step is running, return current status (don't start another)
    if (evidenceStepStatus.status === 'running') {
      logger.info('[collect-evidence] Evidence step already running', {
        projectId,
        runId,
      })
      const responseData: CollectEvidenceResponse = {
        runId,
        message: 'Evidence collection in progress',
      }
      const validated = CollectEvidenceResponseSchema.parse(responseData)
      return NextResponse.json(ok(validated))
    }

    // Advance run to evidence step (idempotent, handles retry if failed)
    const advanceResult = await advanceRun(supabase, runId, 'evidence')
    if (!advanceResult.ok) {
      return NextResponse.json(
        fail('INTERNAL_ERROR', advanceResult.error.message),
        { status: 500 }
      )
    }

    // Get all competitors for the project
    const competitors = await listCompetitorsForProject(supabase, projectId)

    if (competitors.length === 0) {
      // Mark step as failed
      await markStepFailed(supabase, runId, 'evidence', {
        code: 'NO_COMPETITORS',
        message: 'No competitors found. Please add competitors first.',
      })
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

          // Store evidence sources (idempotent via upsertEvidenceSource)
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
    )
      .then(async () => {
        // Mark evidence step as completed
        await markStepCompleted(supabase, runId, 'evidence')
        logger.info('[collect-evidence] Evidence collection completed', {
          projectId,
          runId,
        })
      })
      .catch(async (error) => {
        // Mark evidence step as failed
        await markStepFailed(supabase, runId, 'evidence', {
          code: 'COLLECTION_ERROR',
          message: 'Failed to collect evidence',
          detail: error instanceof Error ? error.message : String(error),
        })
        logger.error('[collect-evidence] Background collection error', error)
      })

    // Return immediately - collection runs in background
    logger.info('[collect-evidence] Evidence collection initiated', {
      projectId,
      runId,
      userId: user.id,
      competitorCount: competitors.length,
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

