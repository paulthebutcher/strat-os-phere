/**
 * Opportunity V1 Schema - Strict, versioned JSON artifact for opportunities
 * 
 * This schema defines the canonical structure for opportunities generated per run.
 * All opportunities must conform to this schema, and generation must fail closed
 * if evidence is insufficient.
 */

import { z } from 'zod'

/**
 * Schema version constant
 */
export const OPPORTUNITY_V1_SCHEMA_VERSION = "opportunity_v1.0"

/**
 * Citation schema for Opportunity V1
 * Maps evidence items to stable citation references
 */
export const CitationSchema = z.object({
  evidenceId: z.string().min(1, { message: 'evidenceId is required' }),
  url: z.string().url({ message: 'url must be a valid URL' }),
  sourceType: z.enum([
    'pricing',
    'docs',
    'changelog',
    'reviews',
    'community',
    'security',
    'jobs',
    'case_studies',
    'other',
  ]),
  excerpt: z.string().min(20, { message: 'excerpt must be at least 20 characters' }),
  retrievedAt: z.string().datetime().optional(),
}).strict()

export type Citation = z.infer<typeof CitationSchema>

/**
 * JTBD (Job to be Done) schema
 */
export const JTBDSchema = z.object({
  job: z.string().min(1, { message: 'job is required' }),
  context: z.string().min(1, { message: 'context is required' }),
  constraints: z.string().optional(),
}).strict()

export type JTBD = z.infer<typeof JTBDSchema>

/**
 * Recommendation schema
 */
export const RecommendationSchema = z.object({
  whatToDo: z.string().min(1, { message: 'whatToDo is required' }),
  whyNow: z.string().min(1, { message: 'whyNow is required' }),
  expectedImpact: z.string().min(1, { message: 'expectedImpact is required' }),
  risks: z.array(z.string()).min(0),
}).strict()

export type Recommendation = z.infer<typeof RecommendationSchema>

/**
 * Score driver schema - deterministic scoring component
 */
export const ScoreDriverSchema = z.object({
  key: z.string().min(1, { message: 'key is required' }),
  label: z.string().min(1, { message: 'label is required' }),
  weight: z.number().min(0).max(1, { message: 'weight must be between 0 and 1' }),
  value: z.number().min(0).max(1, { message: 'value must be between 0 and 1' }),
  rationale: z.string().min(1, { message: 'rationale is required' }),
  citationsUsed: z.array(z.string()).min(0),
}).strict()

export type ScoreDriver = z.infer<typeof ScoreDriverSchema>

/**
 * Scores schema - explainable scoring structure
 */
export const ScoresSchema = z.object({
  total: z.number().min(0).max(100, { message: 'total must be between 0 and 100' }),
  drivers: z.array(ScoreDriverSchema).min(1, { message: 'at least one driver is required' }),
}).strict()

export type Scores = z.infer<typeof ScoresSchema>

/**
 * Evidence summary schema
 */
export const EvidenceSummarySchema = z.object({
  totalCitations: z.number().min(0),
  evidenceTypesPresent: z.array(z.string()).min(0),
}).strict()

export type EvidenceSummary = z.infer<typeof EvidenceSummarySchema>

/**
 * Confidence level - derived from evidence coverage
 */
export const ConfidenceSchema = z.enum([
  'exploratory',
  'directional',
  'investment_ready',
])

export type Confidence = z.infer<typeof ConfidenceSchema>

/**
 * Opportunity V1 schema - complete opportunity structure
 */
export const OpportunityV1Schema = z.object({
  id: z.string().min(1, { message: 'id is required' }), // UUID or deterministic hash
  title: z.string().min(1, { message: 'title is required' }),
  jtbd: JTBDSchema,
  forWhom: z.string().min(1, { message: 'forWhom is required' }),
  whyCompetitorsMissIt: z.string().min(1, { message: 'whyCompetitorsMissIt is required' }),
  recommendation: RecommendationSchema,
  citations: z.array(CitationSchema).min(3, { message: 'at least 3 citations are required' }),
  evidenceSummary: EvidenceSummarySchema,
  scores: ScoresSchema,
  whyThisRanks: z.array(z.string()).min(0).max(3, { message: 'whyThisRanks must have at most 3 items' }),
  assumptions: z.array(z.string()).min(0),
  confidence: ConfidenceSchema,
  schema_version: z.literal(OPPORTUNITY_V1_SCHEMA_VERSION),
}).strict()

export type OpportunityV1 = z.infer<typeof OpportunityV1Schema>

/**
 * Generation notes schema - tracks fail-closed reasons
 */
export const GenerationNotesSchema = z.object({
  failed_closed: z.boolean(),
  reasons: z.array(z.string()).optional(),
  evidence_stats: z.object({
    totalEvidenceItems: z.number().min(0),
    evidenceTypesPresent: z.array(z.string()),
    competitorCount: z.number().min(0).optional(),
  }).optional(),
}).strict()

export type GenerationNotes = z.infer<typeof GenerationNotesSchema>

/**
 * Opportunities artifact V1 schema - wrapper for run artifact
 */
export const OpportunitiesArtifactV1Schema = z.object({
  schema_version: z.literal(OPPORTUNITY_V1_SCHEMA_VERSION),
  project_run_id: z.string().uuid({ message: 'project_run_id must be a valid UUID' }),
  pipeline_version: z.string().min(1, { message: 'pipeline_version is required' }),
  input_version: z.number().int().min(0),
  generated_at: z.string().datetime({ message: 'generated_at must be a valid ISO datetime' }),
  opportunities: z.array(OpportunityV1Schema).min(0),
  generation_notes: GenerationNotesSchema.optional(),
}).strict()

export type OpportunitiesArtifactV1 = z.infer<typeof OpportunitiesArtifactV1Schema>

