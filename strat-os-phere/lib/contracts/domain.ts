import { z } from 'zod'

/**
 * Canonical Domain Contracts
 * 
 * This file defines the single source of truth for domain entity shapes.
 * All API responses, DB reads, and UI models should converge on these schemas.
 * 
 * Types are inferred from Zod schemas - no duplicated interfaces.
 */

// ============================================================================
// ID Types
// ============================================================================

export const ProjectIdSchema = z.string().uuid()
export const RunIdSchema = z.string().uuid()
export const CompetitorIdSchema = z.string().uuid()
export const ArtifactIdSchema = z.string().uuid()

export type ProjectId = z.infer<typeof ProjectIdSchema>
export type RunId = z.infer<typeof RunIdSchema>
export type CompetitorId = z.infer<typeof CompetitorIdSchema>
export type ArtifactId = z.infer<typeof ArtifactIdSchema>

// ============================================================================
// Run State & Status
// ============================================================================

/**
 * RunState - terminal states for a run
 * Maps to existing RunStatusResponse.status
 */
export const RunStateSchema = z.enum(['queued', 'running', 'completed', 'failed'])
export type RunState = z.infer<typeof RunStateSchema>

/**
 * RunStep - current step in the pipeline
 * Maps to existing pipeline steps if they exist
 */
export const RunStepSchema = z.enum(['context', 'evidence', 'analysis', 'opportunities']).optional()
export type RunStep = z.infer<typeof RunStepSchema>

/**
 * RunStatus - canonical run status object
 * This is what the status endpoint returns
 */
export const RunStatusSchema = z.object({
  id: RunIdSchema,
  projectId: ProjectIdSchema,
  state: RunStateSchema,
  currentStep: RunStepSchema,
  stepStatus: z.string().optional(), // Optional status string for current step
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }).optional(),
  // Progress tracking (optional, for UI)
  progress: z.object({
    completed: z.number().min(0).max(100).optional(),
    total: z.number().optional(),
  }).optional(),
})

export type RunStatus = z.infer<typeof RunStatusSchema>

// ============================================================================
// Evidence Sources
// ============================================================================

/**
 * EvidenceSource - minimal shape for evidence sources
 * Aligned with what UI renders and what evidence collection returns
 */
export const EvidenceSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  snippet: z.string().optional(),
  retrievedAt: z.string().datetime().optional(),
  provider: z.string().optional(), // e.g., 'tavily', 'manual', etc.
  confidence: z.union([z.enum(['low', 'medium', 'high']), z.number()]).optional(),
  score: z.number().optional(),
})

export type EvidenceSource = z.infer<typeof EvidenceSourceSchema>

// ============================================================================
// Opportunities
// ============================================================================

/**
 * Opportunity - canonical opportunity shape
 * Aligned with OpportunityV3Item but simplified for API contracts
 * Includes optional fields to support backward compatibility
 */
export const OpportunitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  oneLiner: z.string().optional(), // Alias for one_liner
  one_liner: z.string().optional(), // Support both naming conventions
  whyNow: z.string().optional(), // Alias for why_now
  why_now: z.string().optional(), // Support both naming conventions
  evidenceRefs: z.array(z.string()).optional(), // References to evidence source IDs
  confidence: z.object({
    coverage_score: z.number().min(0).max(100).optional(),
    evidence_strength: z.number().min(0).max(100).optional(),
  }).optional(),
  assumptions: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  score: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  // Include other fields that UI might expect (optional for backward compat)
  citations: z.array(z.unknown()).optional(),
  proof_points: z.array(z.unknown()).optional(),
  scoring: z.unknown().optional(),
  tradeoffs: z.unknown().optional(),
  experiments: z.array(z.unknown()).optional(),
})

export type Opportunity = z.infer<typeof OpportunitySchema>

// ============================================================================
// Artifacts
// ============================================================================

/**
 * Artifact - canonical artifact shape
 * Payload is unknown and validated per artifact type when read
 */
export const ArtifactSchema = z.object({
  id: ArtifactIdSchema,
  projectId: ProjectIdSchema,
  runId: RunIdSchema.optional(),
  type: z.string(), // ArtifactType from DB
  version: z.string().optional(),
  createdAt: z.string().datetime(),
  payload: z.unknown(), // Validated per artifact type when read
})

export type Artifact = z.infer<typeof ArtifactSchema>

// ============================================================================
// Decision Readout (Optional - for decision page view model)
// ============================================================================

/**
 * DecisionReadout - optional view model for decision page
 * If the UI treats decision view as one object, use this
 * Otherwise, use Opportunity[] directly
 */
export const DecisionReadoutSchema = z.object({
  projectId: ProjectIdSchema,
  runId: RunIdSchema.optional(),
  opportunities: z.array(OpportunitySchema),
  generatedAt: z.string().datetime().optional(),
  confidence: z.object({
    overall: z.number().min(0).max(100).optional(),
    evidence_coverage: z.number().min(0).max(100).optional(),
  }).optional(),
})

export type DecisionReadout = z.infer<typeof DecisionReadoutSchema>

