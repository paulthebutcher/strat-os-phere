/**
 * Evidence cache management
 * Handles storing and retrieving cached web content and summaries
 */

import 'server-only'
import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { Database } from '@/lib/supabase/database.types'
import { normalizeUrl } from './normalizeUrl'
import { hashContent } from './hash'

export interface EvidenceCacheRow {
  id: string
  normalized_url: string
  content_hash: string
  fetched_at: string
  http_status: number | null
  final_url: string | null
  title: string | null
  raw_text: string | null
  extract_json: Record<string, unknown> | null
  summary_json: Record<string, unknown> | null
  summary_prompt_version: string | null
  stale_after_days: number
  created_at: string
  updated_at: string
}

export interface EvidenceCacheInsert {
  normalized_url: string
  content_hash: string
  http_status?: number | null
  final_url?: string | null
  title?: string | null
  raw_text?: string | null
  extract_json?: Record<string, unknown> | null
  summary_json?: Record<string, unknown> | null
  summary_prompt_version?: string | null
  stale_after_days?: number
}

/**
 * Check if cached entry is still fresh
 */
export function isFresh(cacheRow: EvidenceCacheRow, now: Date = new Date()): boolean {
  const fetchedAt = new Date(cacheRow.fetched_at)
  const staleAfter = cacheRow.stale_after_days || 7
  const staleDate = new Date(fetchedAt)
  staleDate.setDate(staleDate.getDate() + staleAfter)
  
  return now < staleDate
}

/**
 * Get cached evidence by normalized URL
 */
export async function getCached(
  client: TypedSupabaseClient,
  url: string
): Promise<EvidenceCacheRow | null> {
  const normalized = normalizeUrl(url)
  
  const typedClient = client as unknown as import('@supabase/supabase-js').SupabaseClient<Database>
  const { data, error } = await (typedClient
    .from('evidence_cache') as any)
    .select('*')
    .eq('normalized_url', normalized)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    throw new Error(`Failed to get cached evidence: ${error.message}`)
  }

  return data as EvidenceCacheRow | null
}

/**
 * Upsert cached evidence
 */
export async function upsertCached(
  client: TypedSupabaseClient,
  insert: EvidenceCacheInsert
): Promise<EvidenceCacheRow> {
  const typedClient = client as unknown as import('@supabase/supabase-js').SupabaseClient<Database>
  
  const insertPayload: Database['public']['Tables']['evidence_cache']['Insert'] = {
    normalized_url: insert.normalized_url,
    content_hash: insert.content_hash,
    http_status: insert.http_status ?? null,
    final_url: insert.final_url ?? null,
    title: insert.title ?? null,
    raw_text: insert.raw_text ?? null,
    extract_json: insert.extract_json ?? null,
    summary_json: insert.summary_json ?? null,
    summary_prompt_version: insert.summary_prompt_version ?? null,
    stale_after_days: insert.stale_after_days ?? 7,
  }

  const { data, error } = await (typedClient
    .from('evidence_cache') as any)
    .upsert(insertPayload, {
      onConflict: 'normalized_url',
      ignoreDuplicates: false,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to upsert cached evidence: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from upsert')
  }

  return data as EvidenceCacheRow
}

/**
 * Get or create cache entry helper
 * Normalizes URL, computes hash, and checks cache
 */
export async function getCachedOrCreate(
  client: TypedSupabaseClient,
  url: string,
  content: string,
  options?: {
    http_status?: number
    final_url?: string
    title?: string
    extract_json?: Record<string, unknown>
    stale_after_days?: number
  }
): Promise<EvidenceCacheRow> {
  const normalized = normalizeUrl(url)
  const contentHash = await hashContent(content)
  
  // Check existing cache
  const existing = await getCached(client, normalized)
  if (existing && existing.content_hash === contentHash && isFresh(existing)) {
    return existing
  }

  // Create/update cache entry
  return upsertCached(client, {
    normalized_url: normalized,
    content_hash: contentHash,
    http_status: options?.http_status ?? null,
    final_url: options?.final_url ?? normalized,
    title: options?.title ?? null,
    raw_text: content,
    extract_json: options?.extract_json ?? null,
    stale_after_days: options?.stale_after_days ?? 7,
  })
}

