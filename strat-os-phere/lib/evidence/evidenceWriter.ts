/**
 * PR4: Canonical evidence writer with URL normalization and deterministic upserts
 * All evidence harvesting should route through this writer to ensure consistency
 */

import type { TypedSupabaseClient, NewEvidenceSource, EvidenceSource } from '@/lib/supabase/types'
import { normalizeUrl } from './normalizeUrl'
import { logger } from '@/lib/logger'

export interface UpsertEvidenceSourceInput {
  projectId: string
  competitorId?: string | null
  url: string
  sourceType: string
  pageTitle?: string | null
  extractedText: string
  extractedAt?: string | null
  sourceConfidence?: string | null
}

/**
 * Derive domain from URL reliably
 */
function deriveDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    let hostname = urlObj.hostname.toLowerCase()
    
    // Remove www. prefix
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4)
    }
    
    return hostname
  } catch (error) {
    // If URL parsing fails, try to extract domain manually
    const cleaned = url.trim().toLowerCase()
    const withoutProtocol = cleaned.replace(/^https?:\/\//, '')
    const withoutPath = withoutProtocol.split('/')[0]
    const withoutWww = withoutPath.replace(/^www\./, '')
    return withoutWww
  }
}

/**
 * Normalize URL for consistent storage and deduplication
 * - Trim whitespace
 * - Lowercase hostname
 * - Remove fragments (#)
 * - Remove trailing slash (except root)
 * - Normalize protocol to https if missing
 */
function normalizeUrlForStorage(url: string): string {
  let normalized = url.trim()
  
  // Remove fragment
  const fragmentIndex = normalized.indexOf('#')
  if (fragmentIndex !== -1) {
    normalized = normalized.slice(0, fragmentIndex)
  }
  
  // Use existing normalizeUrl function which handles protocol, hostname, etc.
  normalized = normalizeUrl(normalized)
  
  return normalized
}

/**
 * Upsert evidence source with URL normalization and deduplication
 * Uses (project_id, url) unique constraint for deterministic deduplication
 */
export async function upsertEvidenceSource(
  supabase: TypedSupabaseClient,
  input: UpsertEvidenceSourceInput
): Promise<{ ok: true; source: EvidenceSource } | { ok: false; error: string }> {
  // Validate extracted_text is non-empty
  if (!input.extractedText || input.extractedText.trim().length === 0) {
    logger.warn('[evidenceWriter] Skipping insert: extracted_text is empty', {
      projectId: input.projectId,
      competitorId: input.competitorId,
      url: input.url,
      sourceType: input.sourceType,
    })
    return {
      ok: false,
      error: 'extracted_text cannot be empty',
    }
  }

  // Normalize URL before insert
  const normalizedUrl = normalizeUrlForStorage(input.url)
  
  // Derive domain from normalized URL
  const domain = deriveDomain(normalizedUrl)

  // Prepare insert payload
  const payload: NewEvidenceSource = {
    project_id: input.projectId,
    competitor_id: input.competitorId ?? null,
    url: normalizedUrl,
    domain,
    source_type: input.sourceType as any, // Type assertion - will be validated by DB
    page_title: input.pageTitle ?? null,
    extracted_text: input.extractedText.trim(),
    extracted_at: input.extractedAt ?? new Date().toISOString(),
    source_confidence: input.sourceConfidence ?? null,
  }

  try {
    // Use upsert with conflict target on (project_id, url)
    // This ensures deterministic deduplication
    const { data, error } = await supabase
      .from('evidence_sources')
      .upsert(payload, {
        onConflict: 'project_id,url',
        ignoreDuplicates: false, // Update on conflict
      })
      .select()
      .single()

    if (error) {
      // Check if it's a unique constraint violation (shouldn't happen with upsert, but handle gracefully)
      if (error.code === '23505') {
        // Try to fetch existing record
        const { data: existing } = await supabase
          .from('evidence_sources')
          .select()
          .eq('project_id', input.projectId)
          .eq('url', normalizedUrl)
          .single()

        if (existing) {
          logger.info('[evidenceWriter] Record already exists, returning existing', {
            projectId: input.projectId,
            url: normalizedUrl,
          })
          return { ok: true, source: existing }
        }
      }

      logger.error('[evidenceWriter] Failed to upsert evidence source', {
        error: error.message,
        code: error.code,
        projectId: input.projectId,
        competitorId: input.competitorId,
        url: normalizedUrl,
        sourceType: input.sourceType,
      })

      return {
        ok: false,
        error: `Database error: ${error.message}`,
      }
    }

    if (!data) {
      logger.error('[evidenceWriter] No data returned from upsert', {
        projectId: input.projectId,
        url: normalizedUrl,
      })
      return {
        ok: false,
        error: 'No data returned from upsert',
      }
    }

    logger.debug('[evidenceWriter] Successfully upserted evidence source', {
      projectId: input.projectId,
      competitorId: input.competitorId,
      url: normalizedUrl,
      sourceType: input.sourceType,
      id: data.id,
    })

    return { ok: true, source: data }
  } catch (error) {
    logger.error('[evidenceWriter] Unexpected error during upsert', {
      error: error instanceof Error ? error.message : String(error),
      projectId: input.projectId,
      competitorId: input.competitorId,
      url: normalizedUrl,
      sourceType: input.sourceType,
    })

    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected error during upsert',
    }
  }
}

// Import type for return value
import type { EvidenceSource } from '@/lib/supabase/types'

