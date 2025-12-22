/**
 * Parallel fetch and extraction with concurrency limits and timeouts
 */

import 'server-only'
import pLimit from 'p-limit'
import { fetchAndExtract, type ExtractedContent } from '@/lib/extract/fetchAndExtract'
import { extractWithSourceType, type ExtractedSource } from '@/lib/extract/specialized'
import { normalizeUrl } from './normalizeUrl'
import { hashContent } from './hash'
import { getCached, upsertCached, isFresh, type EvidenceCacheRow } from './cache'
import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

export const FETCH_CONCURRENCY = 8
export const FETCH_TIMEOUT_MS = 15000
export const TOTAL_FETCH_BUDGET_MS_PER_COMPETITOR = 90000 // 90 seconds per competitor

export interface FetchedPage {
  url: string
  normalizedUrl: string
  extracted?: ExtractedSource
  error?: string
  fromCache: boolean
  httpStatus?: number
  finalUrl?: string
  title?: string
}

export interface FetchStats {
  total: number
  cacheHits: number
  cacheMisses: number
  successes: number
  failures: number
  totalTimeMs: number
}

/**
 * Fetch and extract a single URL with caching
 */
async function fetchSingleUrl(
  client: TypedSupabaseClient,
  url: string,
  label?: string
): Promise<FetchedPage> {
  const normalizedUrl = normalizeUrl(url)
  const startTime = Date.now()

  try {
    // Check cache
    const cached = await getCached(client, normalizedUrl)
    
    if (cached && isFresh(cached) && cached.raw_text) {
      // Use cached content
      try {
        // Try to parse extract_json if available
        const extractJson = cached.extract_json as ExtractedSource | null
        
        if (extractJson) {
          return {
            url,
            normalizedUrl,
            extracted: extractJson,
            fromCache: true,
            httpStatus: cached.http_status ?? undefined,
            finalUrl: cached.final_url ?? undefined,
            title: cached.title ?? undefined,
          }
        }

        // Otherwise, reconstruct from raw_text
        // We need to re-extract to get proper source type detection
        // But this is fast since we have the text already
        const extracted = await extractWithSourceType(url, label)
        if (extracted && cached.raw_text) {
          // Use cached text but re-extracted metadata
          return {
            url,
            normalizedUrl,
            extracted: {
              ...extracted,
              text: cached.raw_text,
            },
            fromCache: true,
            httpStatus: cached.http_status ?? undefined,
            finalUrl: cached.final_url ?? undefined,
            title: cached.title ?? extracted.title,
          }
        }
      } catch (error) {
        logger.warn('Error using cached content, falling back to fetch', {
          url,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Not in cache or stale, fetch fresh
    const extracted = await extractWithSourceType(url, label)

    if (!extracted) {
      return {
        url,
        normalizedUrl,
        error: 'Failed to extract content',
        fromCache: false,
      }
    }

    // Cache the result
    try {
      const contentHash = await hashContent(extracted.text)
      await upsertCached(client, {
        normalized_url: normalizedUrl,
        content_hash: contentHash,
        http_status: 200, // Assume success if extracted worked
        final_url: extracted.url,
        title: extracted.title ?? null,
        raw_text: extracted.text,
        extract_json: extracted as unknown as Record<string, unknown>,
        stale_after_days: 7,
      })
    } catch (cacheError) {
      // Log but don't fail - caching is best effort
      logger.warn('Failed to cache fetched content', {
        url,
        error: cacheError instanceof Error ? cacheError.message : String(cacheError),
      })
    }

    return {
      url,
      normalizedUrl,
      extracted,
      fromCache: false,
      httpStatus: 200,
      finalUrl: extracted.url,
      title: extracted.title,
    }
  } catch (error) {
    logger.error('Error fetching URL', {
      url,
      error: error instanceof Error ? error.message : String(error),
    })
    
    return {
      url,
      normalizedUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      fromCache: false,
    }
  }
}

/**
 * Fetch multiple URLs in parallel with concurrency limits
 */
export async function fetchUrlsParallel(
  client: TypedSupabaseClient,
  urls: Array<{ url: string; label?: string }>,
  options?: {
    concurrency?: number
    timeoutMs?: number
    budgetMs?: number
  }
): Promise<{ results: FetchedPage[]; stats: FetchStats }> {
  const concurrency = options?.concurrency ?? FETCH_CONCURRENCY
  const timeoutMs = options?.timeoutMs ?? FETCH_TIMEOUT_MS
  const budgetMs = options?.budgetMs
  
  const limit = pLimit(concurrency)
  const startTime = Date.now()
  
  const stats: FetchStats = {
    total: urls.length,
    cacheHits: 0,
    cacheMisses: 0,
    successes: 0,
    failures: 0,
    totalTimeMs: 0,
  }

  // Create fetch tasks with timeout protection
  const fetchTasks = urls.map(({ url, label }) =>
    limit(async () => {
      // Check budget
      if (budgetMs && Date.now() - startTime > budgetMs) {
        return {
          url,
          normalizedUrl: normalizeUrl(url),
          error: 'Budget exceeded',
          fromCache: false,
        } as FetchedPage
      }

      // Fetch with timeout
      const fetchPromise = fetchSingleUrl(client, url, label)
      const timeoutPromise = new Promise<FetchedPage>((resolve) => {
        setTimeout(
          () =>
            resolve({
              url,
              normalizedUrl: normalizeUrl(url),
              error: `Timeout after ${timeoutMs}ms`,
              fromCache: false,
            }),
          timeoutMs
        )
      })

      return Promise.race([fetchPromise, timeoutPromise])
    })
  )

  const results = await Promise.all(fetchTasks)
  
  // Calculate stats
  const endTime = Date.now()
  stats.totalTimeMs = endTime - startTime

  for (const result of results) {
    if (result.fromCache) {
      stats.cacheHits++
    } else {
      stats.cacheMisses++
    }

    if (result.extracted && !result.error) {
      stats.successes++
    } else {
      stats.failures++
    }
  }

  logger.info('Parallel fetch completed', {
    total: stats.total,
    cacheHits: stats.cacheHits,
    cacheMisses: stats.cacheMisses,
    successes: stats.successes,
    failures: stats.failures,
    totalTimeMs: stats.totalTimeMs,
    cacheHitRate: stats.total > 0 ? (stats.cacheHits / stats.total).toFixed(2) : '0.00',
  })

  return { results, stats }
}

