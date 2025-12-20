/**
 * Public entry point for calling an LLM.
 *
 * All application code should depend on this file rather than
 * individual provider implementations so we can swap or route
 * between providers later.
 *
 * @returns LLMResponse with a `text` property containing the model's output string.
 *   Use `response.text` to access the model output (not `.content` or any other property).
 *
 * @example
 * ```ts
 * const response = await callLLM({ messages: [...] })
 * const jsonText = response.text // ✅ Correct
 * const parsed = JSON.parse(response.text) // ✅ Correct
 * ```
 */

import { createOpenAIProvider } from './openai'
import {
  type LLMRequest,
  type LLMResponse,
  type LLMProvider,
  LLMError,
} from './provider'

const DEFAULT_TIMEOUT_MS = 30_000
const MAX_RETRIES = 3

let openAIProvider: LLMProvider | null = null

function getProvider(): LLMProvider {
  if (!openAIProvider) {
    openAIProvider = createOpenAIProvider()
  }
  return openAIProvider
}

class LLMTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`LLM request timed out after ${timeoutMs}ms`)
    this.name = 'LLMTimeoutError'
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (timeoutMs <= 0) return promise

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new LLMTimeoutError(timeoutMs))
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getBackoffDelayMs(attempt: number): number {
  // Fixed backoff schedule with jitter:
  // Attempt 0 -> ~300ms, 1 -> ~800ms, 2 -> ~1600ms
  const baseDelays = [300, 800, 1600]
  const base = baseDelays[Math.min(attempt, baseDelays.length - 1)]
  const jitter = base * 0.25 * (Math.random() * 2 - 1) // +/- 25%
  return Math.max(50, base + jitter)
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof LLMTimeoutError) {
    return true
  }

  if (error instanceof LLMError) {
    if (error.retryable === true) return true
    if (error.retryable === false) return false

    const status = error.statusCode
    if (status === 429) return true
    if (status && status >= 500 && status < 600) return true
    return false
  }

  return false
}

function ensureRequestId(existing?: string): string {
  if (existing) return existing
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `req_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`
}

export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  const provider = getProvider()
  const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const requestId = ensureRequestId(req.requestId)

  let lastError: unknown

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await withTimeout(
        provider.generate({
          ...req,
          requestId,
        }),
        timeoutMs
      )

      return response
    } catch (error) {
      lastError = error

      const shouldRetry = attempt < MAX_RETRIES && isRetryableError(error)
      if (!shouldRetry) {
        throw error
      }

      const delayMs = getBackoffDelayMs(attempt)
      // eslint-disable-next-line no-console
      console.warn(
        `[callLLM] Attempt ${attempt + 1} failed for provider=${
          provider.name
        }, will retry in ${Math.round(delayMs)}ms`,
        error
      )

      // Await before next retry.
      // eslint-disable-next-line no-await-in-loop
      await sleep(delayMs)
    }
  }

  // If we exit the loop without returning, rethrow the last seen error.
  throw lastError instanceof Error
    ? lastError
    : new Error('LLM call failed after retries')
}


