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

export const runtime = 'nodejs'

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
export async function POST(request: Request) {
  try {
    logger.info('[recommend-competitors] Starting recommendation request')

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const validationResult = CompetitorRecommendationsRequestSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      return NextResponse.json(
        { ok: false, error: `Validation failed: ${errorMessage}` },
        { status: 400 }
      )
    }

    const { primaryUrl, contextText } = validationResult.data

    if (!primaryUrl && !contextText) {
      return NextResponse.json({
        ok: true,
        framing: {},
        recommendations: [],
      } as CompetitorRecommendationsResponse)
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Build prompt and call LLM
    const messages = buildRecommendationMessages(primaryUrl, contextText)
    
    logger.info('[recommend-competitors] Calling LLM', {
      hasPrimaryUrl: !!primaryUrl,
      hasContextText: !!contextText,
    })

    const llmResponse = await callLLM({
      messages,
      requestId: `recommend-competitors-${Date.now()}`,
    })

    // Parse response
    const parseResult = safeParseLLMJson(
      llmResponse.text,
      CompetitorRecommendationsResponseSchema
    )

    if (!parseResult.ok) {
      logger.error('[recommend-competitors] Failed to parse LLM response', parseResult.error)
      
      // Return safe fallback
      return NextResponse.json({
        ok: true,
        framing: {},
        recommendations: [],
      } as CompetitorRecommendationsResponse)
    }

    // De-duplicate recommendations
    const deduplicated = deduplicateRecommendations(parseResult.data.recommendations)

    logger.info('[recommend-competitors] Success', {
      recommendationCount: deduplicated.length,
      hasFraming: !!parseResult.data.framing,
    })

    const response: CompetitorRecommendationsResponse = {
      framing: parseResult.data.framing,
      recommendations: deduplicated,
    }

    return NextResponse.json({ ok: true, ...response })
  } catch (error) {
    logger.error('[recommend-competitors] Failed to generate recommendations', error)
    
    // Return safe fallback on error
    return NextResponse.json({
      ok: true,
      framing: {},
      recommendations: [],
    } as CompetitorRecommendationsResponse)
  }
}

