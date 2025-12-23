import { z } from 'zod'

import { CompetitorSnapshotSchema } from './competitorSnapshot'
import { MarketSynthesisSchema } from './marketSynthesis'
import { JtbdArtifactContentSchema } from './jtbd'
import { OpportunitiesArtifactContentSchema } from './opportunities'
import { OpportunityV3ArtifactContentSchema } from './opportunityV3'
import { OpportunitiesV2OverlaySchema } from './opportunitiesV2Overlay'
import { ScoringMatrixArtifactContentSchema } from './scoring'
import { StrategicBetsArtifactContentSchema } from './strategicBet'
import { StrategicBetsV2OverlaySchema } from './strategicBetsV2Overlay'
import { ARTIFACT_TYPES, type ArtifactType } from '@/lib/artifacts/registry'

/**
 * Safe helper to create a Zod enum from a const array
 * Ensures the array is non-empty and properly typed for z.enum()
 */
function createZodEnumFromArray<T extends string>(
  values: readonly T[]
): z.ZodEnum<[T, ...T[]]> {
  if (values.length === 0) {
    throw new Error('Cannot create Zod enum from empty array')
  }
  // TypeScript knows values is non-empty after the check
  // We need to cast to satisfy z.enum's tuple requirement
  return z.enum(values as [T, ...T[]])
}

// Derive Zod schema from canonical registry
// ARTIFACT_TYPES is guaranteed non-empty by the registry definition
export const ArtifactTypeSchema = createZodEnumFromArray(ARTIFACT_TYPES)

// Compile-time verification: ensure inferred type matches ArtifactType
// This will fail at compile time if there's a mismatch
type _ArtifactTypeCheck = z.infer<typeof ArtifactTypeSchema> extends ArtifactType
  ? ArtifactType extends z.infer<typeof ArtifactTypeSchema>
    ? true
    : never
  : never
const _artifactTypeVerified: _ArtifactTypeCheck = true
void _artifactTypeVerified

// Re-export type from canonical registry
export type { ArtifactType }

export const ProfilesArtifactSchema = z.object({
  type: z.literal('profiles'),
  content: z.array(CompetitorSnapshotSchema).min(1),
})

export const SynthesisArtifactSchema = z.object({
  type: z.literal('synthesis'),
  content: MarketSynthesisSchema,
})

export const JtbdArtifactSchema = z.object({
  type: z.literal('jtbd'),
  content: JtbdArtifactContentSchema,
})

export const OpportunitiesV2ArtifactSchema = z.object({
  type: z.literal('opportunities_v2'),
  content: OpportunitiesArtifactContentSchema,
})

export const OpportunitiesV3ArtifactSchema = z.object({
  type: z.literal('opportunities_v3'),
  content: OpportunityV3ArtifactContentSchema,
})

export const OpportunitiesV2OverlayArtifactSchema = z.object({
  type: z.literal('opportunities_v2_overlay'),
  content: OpportunitiesV2OverlaySchema,
})

export const ScoringMatrixArtifactSchema = z.object({
  type: z.literal('scoring_matrix'),
  content: ScoringMatrixArtifactContentSchema,
})

export const StrategicBetsArtifactSchema = z.object({
  type: z.literal('strategic_bets'),
  content: StrategicBetsArtifactContentSchema,
})

export const StrategicBetsV2OverlayArtifactSchema = z.object({
  type: z.literal('strategic_bets_v2_overlay'),
  content: StrategicBetsV2OverlaySchema,
})

export const ArtifactSchema = z.discriminatedUnion('type', [
  ProfilesArtifactSchema,
  SynthesisArtifactSchema,
  JtbdArtifactSchema,
  OpportunitiesV2ArtifactSchema,
  OpportunitiesV3ArtifactSchema,
  OpportunitiesV2OverlayArtifactSchema,
  ScoringMatrixArtifactSchema,
  StrategicBetsArtifactSchema,
  StrategicBetsV2OverlayArtifactSchema,
])

export type ProfilesArtifact = z.infer<typeof ProfilesArtifactSchema>
export type SynthesisArtifact = z.infer<typeof SynthesisArtifactSchema>
export type JtbdArtifact = z.infer<typeof JtbdArtifactSchema>
export type OpportunitiesV2Artifact = z.infer<typeof OpportunitiesV2ArtifactSchema>
export type OpportunitiesV3Artifact = z.infer<typeof OpportunitiesV3ArtifactSchema>
export type OpportunitiesV2OverlayArtifact = z.infer<typeof OpportunitiesV2OverlayArtifactSchema>
export type ScoringMatrixArtifact = z.infer<typeof ScoringMatrixArtifactSchema>
export type StrategicBetsArtifact = z.infer<typeof StrategicBetsArtifactSchema>
export type StrategicBetsV2OverlayArtifact = z.infer<typeof StrategicBetsV2OverlayArtifactSchema>
export type Artifact = z.infer<typeof ArtifactSchema>

const ProfilesArtifactContentSchema = ProfilesArtifactSchema.shape.content
const SynthesisArtifactContentSchema = SynthesisArtifactSchema.shape.content

export type ProfilesArtifactContent = z.infer<
  typeof ProfilesArtifactContentSchema
>
export type SynthesisArtifactContent = z.infer<
  typeof SynthesisArtifactContentSchema
>
export type JtbdArtifactContent = z.infer<typeof JtbdArtifactContentSchema>
export type OpportunitiesV2ArtifactContent = z.infer<
  typeof OpportunitiesArtifactContentSchema
>
export type OpportunitiesV3ArtifactContent = z.infer<
  typeof OpportunityV3ArtifactContentSchema
>
export type OpportunitiesV2OverlayContent = z.infer<
  typeof OpportunitiesV2OverlaySchema
>
export type ScoringMatrixArtifactContent = z.infer<
  typeof ScoringMatrixArtifactContentSchema
>
export type StrategicBetsArtifactContent = z.infer<
  typeof StrategicBetsArtifactContentSchema
>
export type StrategicBetsV2OverlayContent = z.infer<
  typeof StrategicBetsV2OverlaySchema
>

export type ArtifactContent =
  | ProfilesArtifactContent
  | SynthesisArtifactContent
  | JtbdArtifactContent
  | OpportunitiesV2ArtifactContent
  | OpportunitiesV3ArtifactContent
  | OpportunitiesV2OverlayContent
  | ScoringMatrixArtifactContent
  | StrategicBetsArtifactContent
  | StrategicBetsV2OverlayContent

export function getArtifactContentSchema(
  type: ArtifactType
): z.ZodTypeAny {
  switch (type) {
    case 'profiles':
      return ProfilesArtifactContentSchema
    case 'synthesis':
      return SynthesisArtifactContentSchema
    case 'jtbd':
      return JtbdArtifactContentSchema
    case 'opportunities_v2':
      return OpportunitiesArtifactContentSchema
    case 'opportunities_v3':
      return OpportunityV3ArtifactContentSchema
    case 'opportunities_v2_overlay':
      return OpportunitiesV2OverlaySchema
    case 'scoring_matrix':
      return ScoringMatrixArtifactContentSchema
    case 'strategic_bets':
      return StrategicBetsArtifactContentSchema
    case 'strategic_bets_v2_overlay':
      return StrategicBetsV2OverlaySchema
    case 'evidence_bundle_v1':
      // Evidence bundles are stored as artifacts but don't have a validation schema
      // Return z.any() to allow any content structure
      return z.any()
    default: {
      // TypeScript should prove this is unreachable if all cases are handled
      // If this errors, it means a new artifact type was added but not handled
      const _exhaustiveCheck: never = type as never
      throw new Error(`Unhandled artifact type: ${String(type)}`)
    }
  }
}

export function validateArtifactContent(
  type: ArtifactType,
  value: unknown
): z.SafeParseReturnType<unknown, ArtifactContent> {
  const schema = getArtifactContentSchema(type)
  return schema.safeParse(value) as z.SafeParseReturnType<unknown, ArtifactContent>
}


