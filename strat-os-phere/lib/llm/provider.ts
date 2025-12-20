/**
 * Shared LLM types and provider interface.
 *
 * Keep this file small and implementation‑agnostic so we can
 * easily add other providers (Anthropic, local, etc.) later.
 */

export type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type LLMRequest = {
  messages: Message[]
  /**
   * Optional model override. If omitted, the provider should
   * fall back to its own default (e.g. env configuration).
   */
  model?: string
  temperature?: number
  maxTokens?: number
  /**
   * When true, the provider should strongly bias towards
   * returning valid JSON only (no commentary or code fences).
   */
  jsonMode?: boolean
  /**
   * Optional per‑request timeout hint in milliseconds.
   * The call site (e.g. `callLLM`) is responsible for enforcing this.
   */
  timeoutMs?: number
  /**
   * Optional caller‑supplied request identifier for tracing.
   * Providers may surface this in logs or error messages.
   */
  requestId?: string
}

export type LLMProviderName = 'openai'

/**
 * Standardized response from an LLM provider.
 * All providers must return this shape, with `text` containing the model's output string.
 * 
 * @property text - The model's output text content. This is the string that contains
 *   the actual response from the model (e.g., JSON, prose, etc.). Always use this
 *   property to access the model output.
 * @property provider - The name of the provider that generated this response
 * @property model - The model identifier used for this response
 * @property usage - Optional token usage statistics
 */
export type LLMResponse = {
  text: string
  provider: LLMProviderName
  model: string
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
}

export interface LLMProvider {
  name: LLMProviderName
  generate(req: LLMRequest): Promise<LLMResponse>
}

/**
 * Normalised error for all LLM providers.
 * Consumers can reliably switch on `provider` + `statusCode`.
 */
export class LLMError extends Error {
  readonly provider: LLMProviderName
  readonly statusCode?: number
  readonly requestId?: string
  readonly retryable?: boolean

  constructor(options: {
    provider: LLMProviderName
    message: string
    statusCode?: number
    requestId?: string
    cause?: unknown
    retryable?: boolean
  }) {
    super(options.message)
    this.name = 'LLMError'
    this.provider = options.provider
    this.statusCode = options.statusCode
    this.requestId = options.requestId
    this.retryable = options.retryable
    if (options.cause !== undefined) {
      // `cause` is widely supported at runtime but not always in TS lib targets.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this as any).cause = options.cause
    }
  }
}


