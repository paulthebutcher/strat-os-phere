import { NextResponse } from 'next/server'
import { callLLM } from '@/lib/llm/callLLM'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import type { Message } from '@/lib/prompts/system'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'
import { z } from 'zod'

export const runtime = 'nodejs'

const ExtractionSchema = z.object({
  market: z.string().optional(),
  targetCustomer: z.string().optional(),
  goal: z.string().optional(),
  constraints: z.string().optional(),
  nonGoals: z.string().optional(),
})

function buildExtractionMessages(text: string): Message[] {
  const systemMessage = getSystemStyleGuide()
  
  const userContent = [
    'TASK',
    'Extract key project context from the provided text. Identify market, target customer, business goals, constraints, and explicit non-goals.',
    '',
    'INPUT TEXT',
    text.substring(0, 10000), // Limit to 10k chars
    '',
    'OUTPUT SCHEMA',
    'Return a JSON object with the following optional fields:',
    '- market: string (the market or category)',
    '- targetCustomer: string (the target customer segment)',
    '- goal: string (business goal or decision this supports)',
    '- constraints: string (key constraints like time, budget, regulation, competitive pressure)',
    '- nonGoals: string (what we are explicitly not trying to achieve)',
    '',
    'RULES',
    '- Only extract information that is clearly present or strongly implied',
    '- If a field cannot be determined, omit it',
    '- Keep extracted values concise (1-2 sentences max per field)',
    '- Be precise and avoid speculation',
    '',
    'OUTPUT FORMAT',
    'Return only valid JSON. No markdown, no code fences, no explanatory text.',
  ].join('\n')

  return [systemMessage, { role: 'user', content: userContent }]
}

/**
 * Extract project context from pasted text
 * POST /api/projects/extract
 * Body: { text: string }
 * Returns: { market?, targetCustomer?, goal?, constraints?, nonGoals? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const text = body.text as string | undefined

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      )
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text must be 10,000 characters or less' },
        { status: 400 }
      )
    }

    const messages = buildExtractionMessages(text.trim())
    const response = await callLLM({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0.3,
    })

    const parseResult = safeParseLLMJson(response.text, ExtractionSchema)

    if (!parseResult.ok) {
      console.error('Extraction parse error:', parseResult.error)
      return NextResponse.json(
        { error: 'Failed to parse extraction results' },
        { status: 500 }
      )
    }

    return NextResponse.json(parseResult.data)
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      {
        error: 'Failed to extract information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

