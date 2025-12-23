import 'server-only'
import pLimit from 'p-limit'
import { logger } from '@/lib/logger'

/**
 * Tavily API client with rate limiting, retries, and timeouts.
 * This is the single entry point for all Tavily API calls.
 */

export type TavilySearchParams = {
  query: string
  maxResults?: number // default 8
  includeAnswer?: boolean // default false
  includeRawContent?: boolean // default false
  includeImages?: boolean // default false
  searchDepth?: 'basic' | 'advanced' // default "basic"
}

export type TavilyRawResult = {
  title?: string
  url: string
  content?: string
  raw_content?: string
  score?: number
  published_date?: string
}

export type TavilyResponse = {
  query: string
  results: TavilyRawResult[]
  answer?: string
}

export type TavilyErrorCode =
  | 'MISSING_API_KEY'
  | 'HTTP_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'UNKNOWN'

export class TavilyError extends Error {
  constructor(
    public code: TavilyErrorCode,
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'TavilyError'
  }
}

// Configuration from environment
const TAVILY_API_KEY = process.env.TAVILY_API_KEY
const TAVILY_MAX_QPS = parseInt(process.env.TAVILY_MAX_QPS || '2', 10)
const TAVILY_TIMEOUT_MS = parseInt(process.env.TAVILY_TIMEOUT_MS || '15000', 10)
const TAVILY_API_ENDPOINT = process.env.TAVILY_API_ENDPOINT || 'https://api.tavily.com/search'

// Rate limiter: create a limit function that allows TAVILY_MAX_QPS concurrent requests
const rateLimiter = pLimit(TAVILY_MAX_QPS)

const MAX_RETRIES = 3

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay with jitter
 */
function getBackoffDelayMs(attempt: number): number {
  const baseDelays = [300, 800, 1600]
  const base = baseDelays[Math.min(attempt, baseDelays.length - 1)]
  const jitter = base * 0.25 * (Math.random() * 2 - 1) // +/- 25%
  return Math.max(50, base + jitter)
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof TavilyError) {
    if (error.code === 'RATE_LIMITED') return true
    if (error.code === 'HTTP_ERROR' && error.status) {
      // Retry on 429 and 5xx
      return error.status === 429 || (error.status >= 500 && error.status < 600)
    }
    if (error.code === 'TIMEOUT') return true
    return false
  }
  // Network errors are retryable
  return error instanceof TypeError && error.message.includes('fetch')
}

/**
 * Timeout wrapper for fetch requests
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (timeoutMs <= 0) return promise

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TavilyError('TIMEOUT', `Request timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

/**
 * Make a single Tavily API request (without rate limiting or retries)
 */
async function makeTavilyRequest(params: TavilySearchParams): Promise<TavilyResponse> {
  if (!TAVILY_API_KEY) {
    throw new TavilyError('MISSING_API_KEY', 'TAVILY_API_KEY environment variable is not set')
  }

  const requestBody = {
    api_key: TAVILY_API_KEY,
    query: params.query,
    max_results: params.maxResults ?? 8,
    include_answer: params.includeAnswer ?? false,
    include_raw_content: params.includeRawContent ?? false,
    include_images: params.includeImages ?? false,
    search_depth: params.searchDepth ?? 'basic',
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TAVILY_TIMEOUT_MS)

  try {
    const response = await withTimeout(
      fetch(TAVILY_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }),
      TAVILY_TIMEOUT_MS
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      const status = response.status
      let errorText: string
      try {
        errorText = await response.text()
      } catch {
        errorText = `HTTP ${status}`
      }

      const errorCode: TavilyErrorCode =
        status === 429
          ? 'RATE_LIMITED'
          : status >= 500
            ? 'HTTP_ERROR'
            : 'HTTP_ERROR'

      throw new TavilyError(errorCode, `Tavily API error: ${status} ${errorText}`, status, {
        errorText,
      })
    }

    const data = await response.json()

    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new TavilyError('UNKNOWN', 'Invalid response format from Tavily API')
    }

    return {
      query: data.query || params.query,
      results: Array.isArray(data.results) ? data.results : [],
      answer: data.answer,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof TavilyError) {
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new TavilyError('TIMEOUT', `Request aborted after ${TAVILY_TIMEOUT_MS}ms`)
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new TavilyError('UNKNOWN', `Network error: ${error.message}`, undefined, {
        originalError: error.message,
      })
    }

    throw new TavilyError(
      'UNKNOWN',
      error instanceof Error ? error.message : 'Unknown error occurred',
      undefined,
      { originalError: error }
    )
  }
}

/**
 * Public entry point for Tavily search.
 * Handles rate limiting, retries with exponential backoff, and timeouts.
 *
 * @param params - Search parameters
 * @returns Tavily API response with normalized results
 * @throws TavilyError on failure
 */
export async function tavilySearch(params: TavilySearchParams): Promise<TavilyResponse> {
  if (!TAVILY_API_KEY) {
    throw new TavilyError('MISSING_API_KEY', 'TAVILY_API_KEY environment variable is not set')
  }

  if (!params.query || typeof params.query !== 'string' || !params.query.trim()) {
    throw new TavilyError('UNKNOWN', 'Query parameter is required and must be a non-empty string')
  }

  let lastError: unknown

  // Retry loop with rate limiting
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      // Rate limit: wrap the request in the rate limiter
      const response = await rateLimiter(() => makeTavilyRequest(params))

      // Log successful request (only in dev)
      if (attempt > 0) {
        logger.info(`[tavily] Request succeeded after ${attempt + 1} attempts`, {
          query: params.query.substring(0, 50),
        })
      }

      return response
    } catch (error) {
      lastError = error

      const shouldRetry = attempt < MAX_RETRIES && isRetryableError(error)

      if (!shouldRetry) {
        // Log non-retryable errors
        if (error instanceof TavilyError) {
          logger.error('[tavily] Request failed (non-retryable)', {
            code: error.code,
            status: error.status,
            query: params.query.substring(0, 50),
          })
        }
        throw error
      }

      const delayMs = getBackoffDelayMs(attempt)
      logger.warn(
        `[tavily] Attempt ${attempt + 1} failed, will retry in ${Math.round(delayMs)}ms`,
        {
          query: params.query.substring(0, 50),
          error: error instanceof Error ? error.message : String(error),
        }
      )

      // Await before next retry
      await sleep(delayMs)
    }
  }

  // If we exit the loop without returning, rethrow the last seen error
  throw lastError instanceof Error
    ? lastError
    : new TavilyError('UNKNOWN', 'Tavily search failed after retries')
}

