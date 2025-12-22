import { z } from 'zod'

import { CompetitorSnapshotSchema } from './competitorSnapshot'
import { MarketSynthesisSchema } from './marketSynthesis'
import { JtbdArtifactContentSchema } from './jtbd'
import { OpportunitiesArtifactContentSchema } from './opportunities'
import { OpportunityV3ArtifactContentSchema } from './opportunityV3'
import { ScoringMatrixArtifactContentSchema } from './scoring'
import { StrategicBetsArtifactContentSchema } from './strategicBet'
import { ARTIFACT_TYPES, type ArtifactType } from '@/lib/constants/types'

// Derive Zod schema from centralized constants
export const ArtifactTypeSchema = z.enum(ARTIFACT_TYPES as [ArtifactType, ...ArtifactType[]])

// Re-export type from centralized location
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

export const ScoringMatrixArtifactSchema = z.object({
  type: z.literal('scoring_matrix'),
  content: ScoringMatrixArtifactContentSchema,
})

export const StrategicBetsArtifactSchema = z.object({
  type: z.literal('strategic_bets'),
  content: StrategicBetsArtifactContentSchema,
})

export const ArtifactSchema = z.discriminatedUnion('type', [
  ProfilesArtifactSchema,
  SynthesisArtifactSchema,
  JtbdArtifactSchema,
  OpportunitiesV2ArtifactSchema,
  OpportunitiesV3ArtifactSchema,
  ScoringMatrixArtifactSchema,
  StrategicBetsArtifactSchema,
])

export type ProfilesArtifact = z.infer<typeof ProfilesArtifactSchema>
export type SynthesisArtifact = z.infer<typeof SynthesisArtifactSchema>
export type JtbdArtifact = z.infer<typeof JtbdArtifactSchema>
export type OpportunitiesV2Artifact = z.infer<typeof OpportunitiesV2ArtifactSchema>
export type OpportunitiesV3Artifact = z.infer<typeof OpportunitiesV3ArtifactSchema>
export type ScoringMatrixArtifact = z.infer<typeof ScoringMatrixArtifactSchema>
export type StrategicBetsArtifact = z.infer<typeof StrategicBetsArtifactSchema>
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
export type ScoringMatrixArtifactContent = z.infer<
  typeof ScoringMatrixArtifactContentSchema
>
export type StrategicBetsArtifactContent = z.infer<
  typeof StrategicBetsArtifactContentSchema
>

export type ArtifactContent =
  | ProfilesArtifactContent
  | SynthesisArtifactContent
  | JtbdArtifactContent
  | OpportunitiesV2ArtifactContent
  | OpportunitiesV3ArtifactContent
  | ScoringMatrixArtifactContent
  | StrategicBetsArtifactContent

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
    case 'scoring_matrix':
      return ScoringMatrixArtifactContentSchema
    case 'strategic_bets':
      return StrategicBetsArtifactContentSchema
    default: {
      const _exhaustiveCheck: never = type
      return _exhaustiveCheck
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


