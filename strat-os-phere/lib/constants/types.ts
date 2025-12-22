/**
 * Centralized type definitions and constants
 * Single source of truth for all string unions to prevent drift
 */

/**
 * Artifact types - must match database enum and schema definitions
 */
export const ARTIFACT_TYPES = [
  'profiles',
  'synthesis',
  'jtbd',
  'opportunities_v2',
  'opportunities_v3',
  'scoring_matrix',
  'strategic_bets',
] as const

export type ArtifactType = (typeof ARTIFACT_TYPES)[number]

/**
 * Type guard for artifact types
 */
export function isArtifactType(value: string): value is ArtifactType {
  return ARTIFACT_TYPES.includes(value as ArtifactType)
}

/**
 * Results V2 generation phases
 * Includes all phases used in progress events
 */
export const RESULTS_V2_PHASES = [
  'load_input',
  'gathering_inputs',
  'competitor_profiles',
  'checking_profiles',
  'evidence_quality_check',
  'jobs_generate',
  'jobs_validate',
  'scorecard_generate',
  'scorecard_validate',
  'opportunities_generate',
  'opportunities_validate',
  'strategic_bets_generate',
  'strategic_bets_validate',
  'scoring_compute',
  'save_artifacts',
  'finalize',
] as const

export type ResultsV2Phase = (typeof RESULTS_V2_PHASES)[number]

/**
 * Type guard for ResultsV2Phase
 */
export function isResultsV2Phase(value: string): value is ResultsV2Phase {
  return RESULTS_V2_PHASES.includes(value as ResultsV2Phase)
}

/**
 * Repairable schema names - schemas that can be repaired via LLM
 */
export const REPAIRABLE_SCHEMA_NAMES = [
  'CompetitorSnapshot',
  'MarketSynthesis',
  'JtbdArtifactContent',
  'OpportunitiesArtifactContent',
  'OpportunityV3ArtifactContent',
  'ScoringMatrixArtifactContent',
  'StrategicBetsArtifactContent',
] as const

export type RepairableSchemaName = (typeof REPAIRABLE_SCHEMA_NAMES)[number]

/**
 * Type guard for RepairableSchemaName
 */
export function isRepairableSchemaName(value: string): value is RepairableSchemaName {
  return REPAIRABLE_SCHEMA_NAMES.includes(value as RepairableSchemaName)
}

