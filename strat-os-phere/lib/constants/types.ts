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
 * 
 * Single source of truth: define as const object for property access,
 * then derive array and type from it
 */
export const RESULTS_V2_PHASES = {
  LOAD_INPUT: 'load_input',
  GATHERING_INPUTS: 'gathering_inputs',
  COMPETITOR_PROFILES: 'competitor_profiles',
  CHECKING_PROFILES: 'checking_profiles',
  EVIDENCE_QUALITY_CHECK: 'evidence_quality_check',
  JOBS_GENERATE: 'jobs_generate',
  JOBS_VALIDATE: 'jobs_validate',
  SCORECARD_GENERATE: 'scorecard_generate',
  SCORECARD_VALIDATE: 'scorecard_validate',
  OPPORTUNITIES_GENERATE: 'opportunities_generate',
  OPPORTUNITIES_VALIDATE: 'opportunities_validate',
  STRATEGIC_BETS_GENERATE: 'strategic_bets_generate',
  STRATEGIC_BETS_VALIDATE: 'strategic_bets_validate',
  SCORING_COMPUTE: 'scoring_compute',
  SAVE_ARTIFACTS: 'save_artifacts',
  FINALIZE: 'finalize',
} as const

/**
 * Array of all phase values for type derivation and runtime checks
 */
export const RESULTS_V2_PHASE_LIST = [
  RESULTS_V2_PHASES.LOAD_INPUT,
  RESULTS_V2_PHASES.GATHERING_INPUTS,
  RESULTS_V2_PHASES.COMPETITOR_PROFILES,
  RESULTS_V2_PHASES.CHECKING_PROFILES,
  RESULTS_V2_PHASES.EVIDENCE_QUALITY_CHECK,
  RESULTS_V2_PHASES.JOBS_GENERATE,
  RESULTS_V2_PHASES.JOBS_VALIDATE,
  RESULTS_V2_PHASES.SCORECARD_GENERATE,
  RESULTS_V2_PHASES.SCORECARD_VALIDATE,
  RESULTS_V2_PHASES.OPPORTUNITIES_GENERATE,
  RESULTS_V2_PHASES.OPPORTUNITIES_VALIDATE,
  RESULTS_V2_PHASES.STRATEGIC_BETS_GENERATE,
  RESULTS_V2_PHASES.STRATEGIC_BETS_VALIDATE,
  RESULTS_V2_PHASES.SCORING_COMPUTE,
  RESULTS_V2_PHASES.SAVE_ARTIFACTS,
  RESULTS_V2_PHASES.FINALIZE,
] as const

export type ResultsV2Phase = (typeof RESULTS_V2_PHASE_LIST)[number]

/**
 * Type guard for ResultsV2Phase
 */
export function isResultsV2Phase(value: string): value is ResultsV2Phase {
  return RESULTS_V2_PHASE_LIST.includes(value as ResultsV2Phase)
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

