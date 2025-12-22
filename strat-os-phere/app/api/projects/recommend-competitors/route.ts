import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { callLLM } from '@/lib/llm/callLLM'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'
import {
  CompetitorRecommendationsRequestSchema,
  CompetitorRecommendationsResponseSchema,
  type CompetitorRecommendationsResponse,
} from '@/lib/projects/new/types'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { LLMError } from '@/lib/llm/provider'

export const runtime = 'nodejs'

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`
}

/**
 * Response type for successful recommendations
 */
type RecommendSuccessResponse = {
  ok: true
  framing?: CompetitorRecommendationsResponse['framing']
  recommendations: Array<{
    name: string
    url?: string
    reason: string
    confidence?: 'high' | 'medium' | 'low'
  }>
  errorId?: never
}

/**
 * Response type for failed recommendations
 */
type RecommendErrorResponse = {
  ok: false
  error: {
    message: string
    code: string
    status: number
  }
  errorId: string
  recommendations: []
  framing?: never
  debug?: {
    status: number
    code: string
  }
}

type RecommendResponse = RecommendSuccessResponse | RecommendErrorResponse

/**
 * Build prompt messages for competitor recommendation
 */
function buildRecommendationMessages(
  primaryUrl?: string,
  contextText?: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const systemMessage = getSystemStyleGuide()
  
  let userContent = 'Analyze the provided input and recommend competitors for a competitive analysis project.\n\n'
  
  if (primaryUrl) {
    userContent += `PRIMARY COMPETITOR URL:\n${primaryUrl}\n\n`
    userContent += 'Extract information about this company and recommend 3-7 similar competitors in the same market/category.\n\n'
  }
  
  if (contextText) {
    userContent += `CONTEXT:\n${contextText}\n\n`
    userContent += 'Extract framing information (market, target customer, business goal) and recommend 3-7 relevant competitors.\n\n'
  }
  
  if (!primaryUrl && !contextText) {
    userContent += 'No input provided. Return empty recommendations.\n\n'
  }
  
  userContent += `OUTPUT REQUIREMENTS:
1. Extract framing information:
   - projectName: A suggested project name (optional)
   - market: Market/category (e.g., "B2C video streaming platforms")
   - targetCustomer: Target customer description (e.g., "Gen Z cord-cutters in the US")
   - geography: Geographic focus (optional)
   - businessGoal: Business goal or decision this analysis supports (optional)

2. Recommend 3-7 competitors:
   - name: Competitor company name (required)
   - url: Company website URL if known (optional but preferred)
   - reason: One sentence explaining why this competitor is relevant
   - confidence: "high" if URL is provided or company is well-known, "medium" or "low" otherwise

3. If primaryUrl is provided, bias recommendations around that company's category.
4. If only contextText is provided, infer category and propose likely competitors.
5. If both are provided, merge and de-duplicate by normalized domain/name.

Return a JSON object matching this schema:
{
  "framing": {
    "projectName": "...",
    "market": "...",
    "targetCustomer": "...",
    "geography": "...",
    "businessGoal": "..."
  },
  "recommendations": [
    {
      "name": "Company Name",
      "url": "https://example.com",
      "reason": "One sentence reason",
      "confidence": "high"
    }
  ]
}`

  return [systemMessage, { role: 'user' as const, content: userContent }]
}

/**
 * Normalize domain from URL
 */
function normalizeDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

/**
 * De-duplicate recommendations by normalized domain/name
 */
function deduplicateRecommendations(
  recommendations: Array<{ name: string; url?: string; reason: string; confidence?: 'high' | 'medium' | 'low' }>
): Array<{ name: string; url?: string; reason: string; confidence?: 'high' | 'medium' | 'low' }> {
  const seen = new Set<string>()
  const result: typeof recommendations = []
  
  for (const rec of recommendations) {
    const key = rec.url 
      ? normalizeDomain(rec.url)
      : rec.name.toLowerCase().trim()
    
    if (!seen.has(key)) {
      seen.add(key)
      result.push(rec)
    }
  }
  
  return result
}

/**
 * POST /api/projects/recommend-competitors
 * Recommends competitors based on primary URL and/or context text
 */
export async function POST(request: Request): Promise<NextResponse<RecommendResponse>> {
  const errorId = generateErrorId()
  
  try {
    logger.info('[recommend-competitors] Starting recommendation request', { errorId })

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      const errorResponse: RecommendErrorResponse = {
        ok: false,
        error: {
          message: 'OpenAI API key is not configured',
          code: 'MISSING_API_KEY',
          status: 500,
        },
        errorId,
        recommendations: [],
        ...(process.env.NODE_ENV !== 'production' && {
          debug: { status: 500, code: 'MISSING_API_KEY' },
        }),
      }
      logger.error('[recommend-competitors] Missing OPENAI_API_KEY', { errorId })
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch (error) {
      const errorResponse: RecommendErrorResponse = {
        ok: false,
        error: {
          message: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
          status: 400,
        },
        errorId,
        recommendations: [],
        ...(process.env.NODE_ENV !== 'production' && {
          debug: { status: 400, code: 'INVALID_JSON' },
        }),
      }
      logger.error('[recommend-competitors] Invalid JSON', { errorId, error })
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const validationResult = CompetitorRecommendationsRequestSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      const errorResponse: RecommendErrorResponse = {
        ok: false,
        error: {
          message: `Validation failed: ${errorMessage}`,
          code: 'VALIDATION_ERROR',
          status: 400,
        },
        errorId,
        recommendations: [],
        ...(process.env.NODE_ENV !== 'production' && {
          debug: { status: 400, code: 'VALIDATION_ERROR' },
        }),
      }
      logger.error('[recommend-competitors] Validation failed', { errorId, errors: validationResult.error.errors })
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const { primaryUrl, contextText } = validationResult.data

    if (!primaryUrl && !contextText) {
      const successResponse: RecommendSuccessResponse = {
        ok: true,
        framing: {},
        recommendations: [],
      }
      return NextResponse.json(successResponse, { status: 200 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const errorResponse: RecommendErrorResponse = {
        ok: false,
        error: {
          message: 'Not authenticated',
          code: 'UNAUTHORIZED',
          status: 401,
        },
        errorId,
        recommendations: [],
        ...(process.env.NODE_ENV !== 'production' && {
          debug: { status: 401, code: 'UNAUTHORIZED' },
        }),
      }
      logger.error('[recommend-competitors] Not authenticated', { errorId })
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Build prompt and call LLM
    const messages = buildRecommendationMessages(primaryUrl, contextText)
    
    logger.info('[recommend-competitors] Calling LLM', {
      errorId,
      hasPrimaryUrl: !!primaryUrl,
      hasContextText: !!contextText,
    })

    let llmResponse
    try {
      llmResponse = await callLLM({
        messages,
        requestId: `recommend-competitors-${Date.now()}`,
      })
    } catch (error) {
      const isLLMError = error instanceof LLMError
      const statusCode = isLLMError ? (error.statusCode ?? 500) : 500
      const errorCode = isLLMError 
        ? (error.statusCode === 401 ? 'LLM_AUTH_ERROR' : error.statusCode === 429 ? 'LLM_RATE_LIMIT' : 'LLM_ERROR')
        : 'LLM_ERROR'
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to call LLM service'

      const errorResponse: RecommendErrorResponse = {
        ok: false,
        error: {
          message: errorMessage,
          code: errorCode,
          status: statusCode,
        },
        errorId,
        recommendations: [],
        ...(process.env.NODE_ENV !== 'production' && {
          debug: { status: statusCode, code: errorCode },
        }),
      }
      logger.error('[recommend-competitors] LLM call failed', { 
        errorId, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      return NextResponse.json(errorResponse, { status: statusCode })
    }

    // Parse response
    const parseResult = safeParseLLMJson(
      llmResponse.text,
      CompetitorRecommendationsResponseSchema
    )

    if (!parseResult.ok) {
      const errorResponse: RecommendErrorResponse = {
        ok: false,
        error: {
          message: `Failed to parse LLM response: ${parseResult.error}`,
          code: 'PARSE_ERROR',
          status: 500,
        },
        errorId,
        recommendations: [],
        ...(process.env.NODE_ENV !== 'production' && {
          debug: { status: 500, code: 'PARSE_ERROR' },
        }),
      }
      logger.error('[recommend-competitors] Failed to parse LLM response', { 
        errorId, 
        error: parseResult.error,
        raw: parseResult.raw?.substring(0, 500), // Log first 500 chars only
      })
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // De-duplicate recommendations
    const deduplicated = deduplicateRecommendations(parseResult.data.recommendations)

    logger.info('[recommend-competitors] Success', {
      errorId,
      recommendationCount: deduplicated.length,
      hasFraming: !!parseResult.data.framing,
    })

    const successResponse: RecommendSuccessResponse = {
      ok: true,
      framing: parseResult.data.framing,
      recommendations: deduplicated,
    }

    return NextResponse.json(successResponse, { status: 200 })
  } catch (error) {
    const errorResponse: RecommendErrorResponse = {
      ok: false,
      error: {
        message: error instanceof Error ? error.message : 'Unexpected error occurred',
        code: 'INTERNAL_ERROR',
        status: 500,
      },
      errorId,
      recommendations: [],
      ...(process.env.NODE_ENV !== 'production' && {
        debug: { status: 500, code: 'INTERNAL_ERROR' },
      }),
    }
    logger.error('[recommend-competitors] Unexpected error', { 
      errorId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

