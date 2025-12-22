/**
 * Two-pass evidence shortlisting
 * Pass A: Fast triage to generate PageSummary for all pages
 * Pass B: Deep read only shortlisted pages
 */

import 'server-only'
import { callLLM } from '@/lib/llm/callLLM'
import { buildPageSummaryMessages, PAGE_SUMMARY_SCHEMA_SHAPE } from '@/lib/prompts/pageSummary'
import { buildRepairMessages } from '@/lib/prompts/repair'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'
import { PageSummarySchema, shortlistPages, type PageSummary, DEFAULT_SHORTLIST_QUOTA } from './pageSummary'

export { DEFAULT_SHORTLIST_QUOTA }
import { fetchUrlsParallel, type FetchedPage } from './parallelFetch'
import { upsertCached, getCached, isFresh } from './cache'
import { hashContent } from './hash'
import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

const SUMMARY_PROMPT_VERSION = 'v1'

export interface ShortlistedPage {
  url: string
  normalizedUrl: string
  summary: PageSummary
  extracted: NonNullable<FetchedPage['extracted']>
  title?: string
  finalUrl?: string
}

export interface ShortlistResult {
  shortlisted: ShortlistedPage[]
  allSummaries: Array<{ url: string; summary: PageSummary }>
  stats: {
    totalFetched: number
    summariesGenerated: number
    shortlistedCount: number
    passATimeMs: number
  }
}

/**
 * Generate PageSummary for a single page (Pass A)
 * Uses cached summary if available and fresh
 */
async function generatePageSummary(
  client: TypedSupabaseClient,
  page: FetchedPage
): Promise<{ url: string; summary: PageSummary } | null> {
  if (!page.extracted) {
    return null
  }

  const { url, extracted, title } = page

  try {
    // Check cache for summary
    const cached = await getCached(client, url)
    if (
      cached &&
      cached.summary_json &&
      cached.summary_prompt_version === SUMMARY_PROMPT_VERSION &&
      isFresh(cached)
    ) {
      const summary = cached.summary_json as PageSummary
      // Validate it matches our schema
      const parsed = PageSummarySchema.safeParse(summary)
      if (parsed.success) {
        return { url, summary: parsed.data }
      }
    }

    // Generate new summary
    const messages = buildPageSummaryMessages(url, title || null, extracted.text)
    const response = await callLLM({
      messages,
      jsonMode: true,
      temperature: 0, // Deterministic for caching
      maxTokens: 500, // Keep it small for fast triage
    })

    let parsed = safeParseLLMJson(response.text, PageSummarySchema)

    // Repair if needed
    if (!parsed.ok) {
      // For PageSummary, we'll use a simpler repair approach since it's not in RepairableSchemaName
      const repairMessages: import('@/lib/prompts/system').Message[] = [
        {
          role: 'system',
          content: `You are fixing an invalid JSON response. Return a valid JSON object matching the PageSummary schema.`,
        },
        {
          role: 'user',
          content: `Fix this JSON to match the PageSummary schema:

Schema:
${JSON.stringify(PAGE_SUMMARY_SCHEMA_SHAPE, null, 2)}

Original (invalid):
${response.text}

Errors: ${parsed.error || 'Unknown error'}

Return only valid JSON, no markdown or code fences.`,
        },
      ]

      const repairResponse = await callLLM({
        messages: repairMessages,
        jsonMode: true,
        temperature: 0,
        maxTokens: 500,
      })

      parsed = safeParseLLMJson(repairResponse.text, PageSummarySchema)
    }

    if (!parsed.ok) {
      logger.warn('Failed to parse page summary after repair', {
        url,
        error: parsed.error,
      })
      return null
    }

    // Cache the summary
    try {
      const contentHash = await hashContent(extracted.text)
      await upsertCached(client, {
        normalized_url: page.normalizedUrl,
        content_hash: contentHash,
        summary_json: parsed.data as Record<string, unknown>,
        summary_prompt_version: SUMMARY_PROMPT_VERSION,
        title: title || null,
        raw_text: extracted.text,
        extract_json: extracted as unknown as Record<string, unknown>,
        stale_after_days: 7,
      })
    } catch (cacheError) {
      logger.warn('Failed to cache page summary', {
        url,
        error: cacheError instanceof Error ? cacheError.message : String(cacheError),
      })
    }

    return { url, summary: parsed.data }
  } catch (error) {
    logger.error('Error generating page summary', {
      url,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Two-pass shortlisting
 * Pass A: Generate summaries for all pages
 * Pass B: Select shortlist based on quotas
 */
export async function performShortlist(
  client: TypedSupabaseClient,
  fetchedPages: FetchedPage[],
  quota = DEFAULT_SHORTLIST_QUOTA
): Promise<ShortlistResult> {
  const passAStart = Date.now()

  // Pass A: Generate summaries for all pages in parallel
  const summaryPromises = fetchedPages
    .filter((page) => page.extracted && !page.error)
    .map((page) => generatePageSummary(client, page))

  const summaryResults = await Promise.all(summaryPromises)
  const allSummaries = summaryResults.filter(
    (result): result is { url: string; summary: PageSummary } => result !== null
  )

  const passATimeMs = Date.now() - passAStart

  // Select shortlist based on quotas
  const shortlistedItems = shortlistPages(allSummaries, quota)

  // Build shortlisted pages with full extracted content
  const shortlisted: ShortlistedPage[] = []
  const fetchedMap = new Map(fetchedPages.map((p) => [p.url, p]))

  for (const item of shortlistedItems) {
    const fetched = fetchedMap.get(item.url)
    if (fetched?.extracted) {
      shortlisted.push({
        url: item.url,
        normalizedUrl: fetched.normalizedUrl,
        summary: item.summary,
        extracted: fetched.extracted,
        title: fetched.title,
        finalUrl: fetched.finalUrl,
      })
    }
  }

  logger.info('Shortlist completed', {
    totalFetched: fetchedPages.length,
    summariesGenerated: allSummaries.length,
    shortlistedCount: shortlisted.length,
    passATimeMs,
  })

  return {
    shortlisted,
    allSummaries,
    stats: {
      totalFetched: fetchedPages.length,
      summariesGenerated: allSummaries.length,
      shortlistedCount: shortlisted.length,
      passATimeMs,
    },
  }
}

