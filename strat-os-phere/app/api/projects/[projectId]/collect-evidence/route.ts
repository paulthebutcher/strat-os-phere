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
import { fetchUrlsParallel, TOTAL_FETCH_BUDGET_MS_PER_COMPETITOR } from '@/lib/evidence/parallelFetch'
import { performShortlist, DEFAULT_SHORTLIST_QUOTA } from '@/lib/evidence/shortlist'
import { FLAGS } from '@/lib/flags'

/**
 * POST /api/projects/[projectId]/collect-evidence
 * Collects evidence for all competitors in a project (evidence-only, no analysis)
 * This is a "soft start" that runs in the background
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<{ ok: boolean; message?: string }>> {
  const { projectId } = await params

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get all competitors for the project
    const competitors = await listCompetitorsForProject(supabase, projectId)

    if (competitors.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'No competitors found' },
        { status: 400 }
      )
    }

    logger.info('[collect-evidence] Starting evidence collection', {
      projectId,
      competitorCount: competitors.length,
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

            sources = shortlisted
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
            sources.map(async (page) => {
              const result = await upsertEvidenceSource(supabase, {
                projectId,
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
    return NextResponse.json({
      ok: true,
      message: 'Evidence collection started',
    })
  } catch (error) {
    logger.error('[collect-evidence] Failed to start evidence collection', error)
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to start evidence collection',
      },
      { status: 500 }
    )
  }
}

