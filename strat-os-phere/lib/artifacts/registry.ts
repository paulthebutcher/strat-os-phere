/**
 * Canonical artifact type registry
 * Single source of truth for all artifact types, their schemas, and metadata
 */

/**
 * Artifact registry entry
 */
export interface ArtifactRegistryEntry {
  /** The artifact type identifier (must match the key) */
  type: string
  /** Human-readable label for UI */
  label: string
  /** Schema name used for repair/validation (matches RepairableSchemaName) */
  schemaName?: string
  /** Optional version for schema evolution */
  version?: number
}

/**
 * Canonical artifact registry
 * Keys are artifact type identifiers, values contain metadata and schema mappings
 */
export const ARTIFACT_REGISTRY = {
  profiles: {
    type: 'profiles',
    label: 'Competitor Profiles',
    schemaName: 'CompetitorSnapshot',
  },
  synthesis: {
    type: 'synthesis',
    label: 'Market Synthesis',
    schemaName: 'MarketSynthesis',
  },
  jtbd: {
    type: 'jtbd',
    label: 'Jobs To Be Done',
    schemaName: 'JtbdArtifactContent',
  },
  opportunities_v2: {
    type: 'opportunities_v2',
    label: 'Opportunities (v2)',
    schemaName: 'OpportunitiesArtifactContent',
  },
  opportunities_v3: {
    type: 'opportunities_v3',
    label: 'Opportunities',
    schemaName: 'OpportunityV3ArtifactContent',
  },
  opportunities_v2_overlay: {
    type: 'opportunities_v2_overlay',
    label: 'Opportunities v2 Overlay',
    schemaName: 'OpportunitiesV2Overlay',
  },
  scoring_matrix: {
    type: 'scoring_matrix',
    label: 'Scoring Matrix',
    schemaName: 'ScoringMatrixArtifactContent',
  },
  strategic_bets: {
    type: 'strategic_bets',
    label: 'Strategic Bets',
    schemaName: 'StrategicBetsArtifactContent',
  },
  strategic_bets_v2_overlay: {
    type: 'strategic_bets_v2_overlay',
    label: 'Strategic Bets v2 Overlay',
    schemaName: 'StrategicBetsV2Overlay',
  },
} as const satisfies Record<string, ArtifactRegistryEntry>

/**
 * Runtime array of all artifact types (for iteration and type guards)
 * Derived from registry to ensure consistency
 * This must be defined before the type to allow proper type inference
 */
export const ARTIFACT_TYPES = [
  'profiles',
  'synthesis',
  'jtbd',
  'opportunities_v2',
  'opportunities_v3',
  'opportunities_v2_overlay',
  'scoring_matrix',
  'strategic_bets',
  'strategic_bets_v2_overlay',
] as const

/**
 * Derive ArtifactType union from the const array
 * This ensures TypeScript can exhaustively check switch statements
 */
export type ArtifactType = (typeof ARTIFACT_TYPES)[number]

/**
 * Runtime validation: ensure ARTIFACT_TYPES matches registry keys
 */
const _validateRegistryKeys = (): void => {
  const registryKeys = Object.keys(ARTIFACT_REGISTRY) as ArtifactType[]
  for (const key of ARTIFACT_TYPES) {
    if (!registryKeys.includes(key)) {
      throw new Error(`Artifact type ${key} is in ARTIFACT_TYPES but not in registry`)
    }
  }
  for (const key of registryKeys) {
    if (!ARTIFACT_TYPES.includes(key)) {
      throw new Error(`Artifact type ${key} is in registry but not in ARTIFACT_TYPES`)
    }
  }
}
// Validate at module load time
_validateRegistryKeys()

/**
 * Type guard for artifact types
 */
export function isArtifactType(value: string): value is ArtifactType {
  return ARTIFACT_TYPES.includes(value as ArtifactType)
}

/**
 * Get artifact registry entry by type
 */
export function getArtifactEntry(type: ArtifactType): ArtifactRegistryEntry {
  return ARTIFACT_REGISTRY[type as keyof typeof ARTIFACT_REGISTRY]
}

/**
 * Derive repairable schema names from registry
 * Only includes artifact types that have a schemaName defined
 * This is a const array for type derivation
 */
export const ARTIFACT_SCHEMA_NAMES = [
  'CompetitorSnapshot',
  'MarketSynthesis',
  'JtbdArtifactContent',
  'OpportunitiesArtifactContent',
  'OpportunityV3ArtifactContent',
  'OpportunitiesV2Overlay',
  'ScoringMatrixArtifactContent',
  'StrategicBetsArtifactContent',
  'StrategicBetsV2Overlay',
] as const

/**
 * Repairable schema name union derived from registry
 */
export type ArtifactSchemaName = (typeof ARTIFACT_SCHEMA_NAMES)[number]

/**
 * Runtime validation: ensure all registry entries with schemaName are in ARTIFACT_SCHEMA_NAMES
 */
const _validateSchemaNames = (): void => {
  const registrySchemaNames = Object.values(ARTIFACT_REGISTRY)
    .map((entry) => entry.schemaName)
    .filter((name): name is NonNullable<typeof name> => name !== undefined)
  
  for (const name of registrySchemaNames) {
    if (!ARTIFACT_SCHEMA_NAMES.includes(name as ArtifactSchemaName)) {
      throw new Error(`Schema name ${name} from registry is not in ARTIFACT_SCHEMA_NAMES`)
    }
  }
}
// Validate at module load time
_validateSchemaNames()

/**
 * Get schema name for an artifact type
 */
export function getArtifactSchemaName(type: ArtifactType): ArtifactSchemaName | undefined {
  return ARTIFACT_REGISTRY[type as keyof typeof ARTIFACT_REGISTRY].schemaName as ArtifactSchemaName | undefined
}

/**
 * Get artifact type from schema name (reverse lookup)
 */
export function getArtifactTypeFromSchemaName(
  schemaName: string
): ArtifactType | undefined {
  const entry = Object.entries(ARTIFACT_REGISTRY).find(
    ([, value]) => value.schemaName === schemaName
  )
  if (!entry) return undefined
  const key = entry[0]
  // Verify the key is in ARTIFACT_TYPES and cast to ArtifactType
  if (ARTIFACT_TYPES.includes(key as ArtifactType)) {
    return key as ArtifactType
  }
  return undefined
}

