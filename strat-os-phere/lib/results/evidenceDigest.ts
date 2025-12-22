'use server'

import { createClient } from '@/lib/supabase/server'
import { getEvidenceSourcesForProject } from '@/lib/data/evidenceSources'
import { computeEvidenceCoverage } from '@/lib/results/coverage'

export type EvidenceDigest = {
  projectId: string
  generatedAt: string
  windowDays: number
  sources: {
    source_type: string
    url: string
    domain?: string
    extracted_at?: string
    confidence?: string
    snippet: string
  }[]
  coverage: {
    citations: number
    sourceTypes: string[]
    recencyLabel: string
  }
}

/**
 * Builds a compact evidence digest for LLM prompts
 * Filters to recent sources, extracts snippets, and computes coverage
 */
export async function buildEvidenceDigest(args: {
  projectId: string
  competitorId?: string | null
  maxSources?: number
  windowDays?: number
}): Promise<EvidenceDigest> {
  const { projectId, competitorId, maxSources = 12, windowDays = 90 } = args

  const supabase = await createClient()

  // Try to load evidence sources - gracefully handle if table doesn't exist
  let evidenceSources: Awaited<ReturnType<typeof getEvidenceSourcesForProject>> = []
  try {
    if (competitorId) {
      // If competitorId is provided, we'd need a function for that
      // For now, fall back to project-level sources
      evidenceSources = await getEvidenceSourcesForProject(supabase, projectId)
    } else {
      evidenceSources = await getEvidenceSourcesForProject(supabase, projectId)
    }
  } catch (error) {
    // If evidence_sources table doesn't exist or query fails, return empty digest
    // This is safe - the prompt will work without evidence, just with lower confidence
    return {
      projectId,
      generatedAt: new Date().toISOString(),
      windowDays,
      sources: [],
      coverage: {
        citations: 0,
        sourceTypes: [],
        recencyLabel: 'Unknown',
      },
    }
  }

  // Filter to recent sources (within windowDays)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - windowDays)

  const recentSources = evidenceSources
    .filter((source) => {
      if (!source.extracted_at) return false
      const extractedDate = new Date(source.extracted_at)
      return extractedDate >= cutoffDate
    })
    .slice(0, maxSources)

  // Build source snippets (first 600-900 chars of extracted_text)
  const sources = recentSources.map((source) => {
    const extractedText = source.extracted_text || ''
    // Strip excessive whitespace and take first 750 chars (middle of 600-900 range)
    const cleaned = extractedText.replace(/\s+/g, ' ').trim()
    const snippet = cleaned.slice(0, 750)

    return {
      source_type: source.source_type || 'unknown',
      url: source.url || '',
      domain: source.domain || undefined,
      extracted_at: source.extracted_at || undefined,
      confidence: (source as any).confidence || undefined,
      snippet,
    }
  })

  // Compute coverage from the digest itself
  const coverageData = computeEvidenceCoverage({
    sources: sources.map((s) => ({
      source_type: s.source_type,
      url: s.url,
      extracted_at: s.extracted_at,
    })),
  })

  return {
    projectId,
    generatedAt: new Date().toISOString(),
    windowDays,
    sources,
    coverage: {
      citations: coverageData.totalCitations,
      sourceTypes: coverageData.sourceTypes.map((st) => st.type),
      recencyLabel: coverageData.recencyLabel,
    },
  }
}

