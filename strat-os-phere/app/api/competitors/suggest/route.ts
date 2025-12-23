import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { tavilySearch } from '@/lib/tavily/client'
import { callLLM } from '@/lib/llm/callLLM'
import { logger } from '@/lib/logger'
import { normalizeUrl, toDisplayDomain } from '@/lib/url/normalizeUrl'

export const runtime = 'nodejs'

const SuggestCompetitorsRequestSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  market: z.string().optional(),
  ideaOrContext: z.string().optional(),
  limit: z.number().int().min(1).max(20).optional().default(12),
})

export type CompetitorCandidate = {
  name: string
  website: string // canonical root, e.g. https://opsgenie.com
  domain: string // opsgenie.com
  confidence: 'high' | 'medium' | 'low'
}

export type SuggestCompetitorsResponse = {
  candidates: CompetitorCandidate[]
}

// Blocked domains that should never appear as competitors
const BLOCKED_DOMAINS = new Set([
  'g2.com',
  'capterra.com',
  'gartner.com',
  'trustradius.com',
  'softwareadvice.com',
  'getapp.com',
  'producthunt.com',
  'alternativeto.net',
  'medium.com',
  'blog',
  'articles',
  'news',
])

/**
 * POST /api/competitors/suggest
 * Searches the web for competitor companies and returns a structured list.
 * Uses Tavily for web search and LLM for structured extraction.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Check if Tavily is configured
    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (!tavilyApiKey) {
      return NextResponse.json(
        { error: 'Tavily API key is not configured', candidates: [] },
        { status: 503 }
      )
    }

    // Parse and validate request
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body', candidates: [] },
        { status: 400 }
      )
    }

    const validationResult = SuggestCompetitorsRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(', ')}`,
          candidates: [],
        },
        { status: 400 }
      )
    }

    const { companyName, market, ideaOrContext, limit } = validationResult.data

    // Build 3-5 Tavily queries
    const queries: string[] = [
      `${companyName} competitors`,
      `${companyName} alternatives`,
      `${companyName} vs`,
    ]

    if (market) {
      queries.push(`${market} ${companyName} competitors`)
      queries.push(`${market} incident management competitors`)
    }

    if (ideaOrContext) {
      queries.push(`${companyName} ${ideaOrContext} similar tools`)
    }

    // Call Tavily for each query (limit to 5 queries, 5-8 results each)
    const tavilyResults: Array<{ title?: string; url: string; content?: string }> = []
    const maxResultsPerQuery = 8
    const totalSourcesCap = 30

    try {
      const searchPromises = queries.slice(0, 5).map((query) =>
        tavilySearch({
          query,
          maxResults: maxResultsPerQuery,
          searchDepth: 'basic',
        }).catch((error) => {
          logger.warn('[competitors/suggest] Tavily query failed', {
            query,
            error: error instanceof Error ? error.message : String(error),
          })
          return { results: [] }
        })
      )

      const searchResults = await Promise.all(searchPromises)

      // Collect all results up to cap
      for (const result of searchResults) {
        for (const item of result.results) {
          if (tavilyResults.length >= totalSourcesCap) break
          tavilyResults.push({
            title: item.title || '',
            url: item.url,
            content: item.content,
          })
        }
        if (tavilyResults.length >= totalSourcesCap) break
      }
    } catch (error) {
      logger.error('[competitors/suggest] Tavily search failed', {
        error: error instanceof Error ? error.message : String(error),
      })
      // Return empty candidates (non-blocking - user can add manually)
      return NextResponse.json({
        candidates: [],
        error: 'Failed to fetch competitor suggestions',
      })
    }

    if (tavilyResults.length === 0) {
      return NextResponse.json({
        candidates: [],
      })
    }

    // Use LLM to extract company names and domains from Tavily results
    let extractedCandidates: CompetitorCandidate[] = []

    try {
      const extractionPrompt = `You are a data extraction assistant. Extract competitor company information from web search results.

Rules:
- Return ONLY actual companies/vendors, NOT article pages, list pages, or review sites
- Each company must have a name and a marketing website root domain (e.g., opsgenie.com, not g2.com/opsgenie)
- Exclude list sites (G2, Gartner, Medium, TrustRadius, Capterra), blogs, and "top alternatives" articles
- Each domain must be a likely vendor marketing site (company.com, company.io, company.co)
- Return a JSON array of objects with: name (string), domain (string), confidence (string: "high" | "medium" | "low")

Search results:
${JSON.stringify(
  tavilyResults.slice(0, 25).map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content?.substring(0, 200),
  })),
  null,
  2
)}

Return a JSON array of competitor companies. Maximum ${limit} results.`

      const llmResponse = await callLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a strict JSON API. Respond with valid JSON only, with no explanation, comments, or surrounding text. Do not use code fences.',
          },
          {
            role: 'user',
            content: extractionPrompt,
          },
        ],
        jsonMode: true,
        maxTokens: 2000,
        timeoutMs: 30000,
      })

      // Parse LLM response
      try {
        const parsed = JSON.parse(llmResponse.text)
        const candidates = Array.isArray(parsed) ? parsed : parsed.candidates || parsed.companies || []

        // Validate and normalize candidates
        for (const candidate of candidates.slice(0, limit * 2)) {
          // Basic validation
          if (!candidate || typeof candidate !== 'object') continue
          if (!candidate.name || typeof candidate.name !== 'string') continue
          if (!candidate.domain || typeof candidate.domain !== 'string') continue

          const domain = candidate.domain.toLowerCase().trim().replace(/^www\./, '')
          const domainParts = domain.split('.')

          // Skip if domain is blocked
          if (BLOCKED_DOMAINS.has(domain) || BLOCKED_DOMAINS.has(domainParts[0])) {
            continue
          }

          // Skip if domain doesn't look like a registrable domain
          if (domainParts.length < 2 || domainParts.length > 3) {
            continue
          }

          // Skip if name looks like a listicle title
          const nameLower = candidate.name.toLowerCase()
          const suspiciousKeywords = [
            'alternatives',
            'competitors',
            'top',
            'best',
            'vs',
            'compare',
            'list of',
            'review',
          ]
          if (suspiciousKeywords.some((kw) => nameLower.includes(kw))) {
            continue
          }

          // Normalize website URL
          let website: string
          try {
            const normalized = normalizeUrl(`https://${domain}`)
            if (!normalized.ok) continue
            website = normalized.url
          } catch {
            website = `https://${domain}`
          }

          // Determine confidence
          let confidence: 'high' | 'medium' | 'low' = candidate.confidence || 'low'
          if (confidence !== 'high' && confidence !== 'medium' && confidence !== 'low') {
            confidence = 'low'
          }

          extractedCandidates.push({
            name: candidate.name.trim(),
            website,
            domain,
            confidence,
          })
        }
      } catch (parseError) {
        logger.warn('[competitors/suggest] Failed to parse LLM response', {
          error: parseError instanceof Error ? parseError.message : String(parseError),
          response: llmResponse.text.substring(0, 500),
        })
      }
    } catch (llmError) {
      logger.error('[competitors/suggest] LLM extraction failed', {
        error: llmError instanceof Error ? llmError.message : String(llmError),
      })
      // Fall through to basic extraction
    }

    // Fallback: basic extraction from URLs if LLM failed
    if (extractedCandidates.length === 0) {
      const domainMap = new Map<string, { name: string; urls: string[] }>()

      for (const result of tavilyResults) {
        try {
          const domain = toDisplayDomain(result.url)
          const normalizedDomain = domain.toLowerCase().replace(/^www\./, '')

          // Skip blocked domains
          if (BLOCKED_DOMAINS.has(normalizedDomain)) continue

          // Extract company name from domain
          const domainParts = normalizedDomain.split('.')
          if (domainParts.length < 2) continue

          const companyName = domainParts[domainParts.length - 2]
            .charAt(0)
            .toUpperCase() + domainParts[domainParts.length - 2].slice(1)

          if (!domainMap.has(normalizedDomain)) {
            domainMap.set(normalizedDomain, {
              name: companyName,
              urls: [],
            })
          }
          domainMap.get(normalizedDomain)!.urls.push(result.url)
        } catch {
          // Skip invalid URLs
        }
      }

      // Convert to candidates
      const domainEntries = Array.from(domainMap.entries())
      for (const [domain, data] of domainEntries) {
        if (extractedCandidates.length >= limit) break

        try {
          const normalized = normalizeUrl(`https://${domain}`)
          if (!normalized.ok) continue

          extractedCandidates.push({
            name: data.name,
            website: normalized.url,
            domain,
            confidence: data.urls.length > 1 ? 'medium' : 'low',
          })
        } catch {
          // Skip if normalization fails
        }
      }
    }

    // Deduplicate by domain and sort by confidence
    const candidateMap = new Map<string, CompetitorCandidate>()
    for (const candidate of extractedCandidates) {
      const existing = candidateMap.get(candidate.domain)
      if (!existing) {
        candidateMap.set(candidate.domain, candidate)
      } else {
        // Keep higher confidence
        const confidenceOrder = { high: 3, medium: 2, low: 1 }
        if (confidenceOrder[candidate.confidence] > confidenceOrder[existing.confidence]) {
          candidateMap.set(candidate.domain, candidate)
        }
      }
    }

    // Sort by confidence and limit
    const finalCandidates = Array.from(candidateMap.values())
      .sort((a, b) => {
        const confidenceOrder = { high: 3, medium: 2, low: 1 }
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
      })
      .slice(0, limit)

    return NextResponse.json({
      candidates: finalCandidates,
    })
  } catch (error) {
    logger.error('[competitors/suggest] Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    })
    // Always return candidates array (even if empty) so UI can fall back to manual entry
    return NextResponse.json(
      {
        candidates: [],
        error: error instanceof Error ? error.message : 'Unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

