import { type LLMProvider, type LLMRequest, type LLMResponse, LLMError } from './provider'

type OpenAIChatCompletion = {
  id: string
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      // Newer OpenAI models can return rich content; we normalise to string.
      content: string | Array<{ type: string; text?: string }>
    }
    finish_reason: string | null
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

type OpenAIErrorBody = {
  error?: {
    message?: string
    type?: string
    code?: string | number | null
  }
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

function getEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

export function createOpenAIProvider(): LLMProvider {
  const defaultModel = getEnv('OPENAI_MODEL') ?? 'gpt-4.1-mini'
  const defaultMaxTokens = Number.parseInt(getEnv('OPENAI_MAX_TOKENS') ?? '1200', 10)

  return {
    name: 'openai',

    async generate(req: LLMRequest): Promise<LLMResponse> {
      const apiKey = getEnv('OPENAI_API_KEY')
      if (!apiKey) {
        throw new LLMError({
          provider: 'openai',
          message: 'Missing OPENAI_API_KEY environment variable',
          statusCode: 401,
          requestId: req.requestId,
        })
      }

      const model = req.model ?? defaultModel
      const maxTokens = req.maxTokens ?? defaultMaxTokens
      const temperature = req.temperature ?? 0.2

      const jsonMode = req.jsonMode === true

      const messages = jsonMode
        ? [
            {
              role: 'system' as const,
              content:
                'You are a strict JSON API. Respond with valid JSON only, with no explanation, comments, or surrounding text. Do not use code fences.',
            },
            ...req.messages,
          ]
        : req.messages

      const body: Record<string, unknown> = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }

      if (jsonMode) {
        // For supported models, this activates strict JSON mode.
        body.response_format = { type: 'json_object' }
      }

      let response: Response

      try {
        response = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        })
      } catch (error) {
        // Network‑level error (DNS, connection reset, etc.).
        throw new LLMError({
          provider: 'openai',
          message: 'Failed to reach OpenAI API',
          requestId: req.requestId,
          cause: error,
          retryable: true,
        })
      }

      let data: OpenAIChatCompletion | OpenAIErrorBody

      try {
        data = (await response.json()) as OpenAIChatCompletion | OpenAIErrorBody
      } catch (error) {
        if (!response.ok) {
          throw new LLMError({
            provider: 'openai',
            message: `OpenAI API error (status ${response.status}) with non‑JSON response`,
            statusCode: response.status,
            requestId: req.requestId,
            cause: error,
            retryable: response.status === 429 || (response.status >= 500 && response.status < 600),
          })
        }

        throw new LLMError({
          provider: 'openai',
          message: 'Failed to parse OpenAI response JSON',
          requestId: req.requestId,
          cause: error,
          retryable: true,
        })
      }

      if (!response.ok) {
        const errBody = data as OpenAIErrorBody
        const baseMessage =
          errBody.error?.message ||
          `OpenAI API error (status ${response.status})` +
            (errBody.error?.code ? ` [code=${errBody.error.code}]` : '')

        throw new LLMError({
          provider: 'openai',
          message: baseMessage,
          statusCode: response.status,
          requestId: req.requestId,
        })
      }

      const completion = data as OpenAIChatCompletion
      const choice = completion.choices[0]

      if (!choice) {
        throw new LLMError({
          provider: 'openai',
          message: 'OpenAI response did not contain any choices',
          requestId: req.requestId,
          retryable: false,
        })
      }

      const content = choice.message.content
      const text =
        typeof content === 'string'
          ? content
          : content
              .map((part) => ('text' in part && typeof part.text === 'string' ? part.text : ''))
              .join('')
              .trim()

      return {
        text,
        provider: 'openai',
        model: completion.model ?? model,
        usage: completion.usage
          ? {
              inputTokens: completion.usage.prompt_tokens,
              outputTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      }
    },
  }
}


