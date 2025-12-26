/**
 * Canonical Decision Model Contract
 * 
 * This is the single source of truth for the decision view.
 * All UI components should consume this model - never raw artifacts.
 * 
 * Server-safe: no React imports, can be used in server components and API routes.
 */

import { z } from '@/lib/contracts/z'
import { OpportunitySchema } from '@/lib/contracts/domain'
import { CompetitorSnapshotSchema } from '@/lib/schemas/competitorSnapshot'

/**
 * Evidence Summary - derived from citations across all artifacts
 */
const EvidenceSummarySchema = z.object({
  total: z.number(),
  byType: z.record(z.string(), z.number()),
  mostRecent: z.string().datetime().optional(),
  oldest: z.string().datetime().optional(),
  medianAgeDays: z.number().optional(),
  recencyLabel: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  confidenceRationale: z.string(),
})

/**
 * Scorecard Entry - competitive scoring entry
 * Note: Scorecard structure may vary by artifact version, so we keep this flexible
 */
const ScorecardEntrySchema = z.object({
  competitor: z.string(),
  scores: z.record(z.string(), z.number().optional()),
  total: z.number().optional(),
}).passthrough() // Allow extra fields for version flexibility

/**
 * Decision Summary - headline and narrative
 */
const DecisionSummarySchema = z.object({
  headline: z.string().optional(),
  narrative: z.string().optional(),
})

/**
 * Canonical Decision Model
 * 
 * This is the single object that the UI reads everywhere.
 * All artifact version logic is hidden inside getDecisionModel.
 */
export const DecisionModelSchema = z.object({
  projectId: z.string().uuid(),
  runId: z.string().uuid().nullable(),
  generatedAt: z.string().datetime().nullable(),

  summary: DecisionSummarySchema,

  opportunities: z.array(OpportunitySchema),
  competitors: z.array(CompetitorSnapshotSchema).optional(),
  scorecard: z.array(ScorecardEntrySchema).optional(),
  evidenceSummary: EvidenceSummarySchema.optional(),

  metadata: z.object({
    artifactVersion: z.string(),
    artifactId: z.string().uuid(),
    confidence: z.number().min(0).max(100).optional(),
  }),
})

export type DecisionModel = z.infer<typeof DecisionModelSchema>
export type EvidenceSummary = z.infer<typeof EvidenceSummarySchema>
export type ScorecardEntry = z.infer<typeof ScorecardEntrySchema>
export type DecisionSummary = z.infer<typeof DecisionSummarySchema>

