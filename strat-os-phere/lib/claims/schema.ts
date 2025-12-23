/**
 * Zod schemas for claims
 */

import { z } from 'zod'
import type { Citation } from '@/lib/evidence/citations'

const citationSchema: z.ZodType<Citation> = z.object({
  url: z.string(),
  title: z.string().nullable().optional(),
  source_type: z.enum(['marketing_site', 'changelog', 'pricing', 'reviews', 'jobs', 'docs', 'status']),
  extracted_at: z.string().nullable().optional(),
  source_date_range: z.string().nullable().optional(),
  confidence: z.union([z.enum(['low', 'medium', 'high']), z.number()]).nullable().optional(),
  domain: z.string().nullable().optional(),
  published_at: z.string().nullable().optional(),
  source_kind: z.enum(['first_party', 'third_party', 'unknown']).nullable().optional(),
  retrievedAt: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  evidenceType: z.string().nullable().optional(),
})

const claimConflictSchema = z.object({
  statement: z.string(),
  citations: z.array(citationSchema),
})

export const claimSchema = z.object({
  id: z.string(),
  statement: z.string(),
  category: z.enum(['pricing', 'docs', 'reviews', 'jobs', 'changelog', 'status', 'marketing', 'other']),
  support: z.enum(['strong', 'medium', 'weak']),
  recencyDays: z.number().nullable().optional(),
  citations: z.array(citationSchema).min(1),
  conflicts: z.array(claimConflictSchema).optional(),
})

export const claimsBundleSchema = z.object({
  schema_version: z.literal(1),
  meta: z.object({
    generatedAt: z.string(),
    company: z.string().optional(),
    evidenceWindowDays: z.number().optional(),
    sourceCountsByType: z.record(z.string(), z.number()).optional(),
  }),
  claims: z.array(claimSchema),
})

export type ClaimsBundleInput = z.input<typeof claimsBundleSchema>
export type ClaimsBundleOutput = z.output<typeof claimsBundleSchema>

