import { z } from 'zod'

import { CompetitorSnapshotSchema } from './competitorSnapshot'
import { MarketSynthesisSchema } from './marketSynthesis'
import { JtbdArtifactContentSchema } from './jtbd'
import { OpportunitiesArtifactContentSchema } from './opportunities'
import { ScoringMatrixArtifactContentSchema } from './scoring'
import { StrategicBetsArtifactContentSchema } from './strategicBet'

export const ArtifactTypeSchema = z.enum([
  'profiles',
  'synthesis',
  'jtbd',
  'opportunities_v2',
  'scoring_matrix',
  'strategic_bets',
])

export type ArtifactType = z.infer<typeof ArtifactTypeSchema>

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
  ScoringMatrixArtifactSchema,
  StrategicBetsArtifactSchema,
])

export type ProfilesArtifact = z.infer<typeof ProfilesArtifactSchema>
export type SynthesisArtifact = z.infer<typeof SynthesisArtifactSchema>
export type JtbdArtifact = z.infer<typeof JtbdArtifactSchema>
export type OpportunitiesV2Artifact = z.infer<typeof OpportunitiesV2ArtifactSchema>
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


