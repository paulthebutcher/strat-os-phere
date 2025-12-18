import { z } from 'zod'

import { CompetitorSnapshotSchema } from './competitorSnapshot'
import { MarketSynthesisSchema } from './marketSynthesis'

export const ArtifactTypeSchema = z.enum(['profiles', 'synthesis'])

export type ArtifactType = z.infer<typeof ArtifactTypeSchema>

export const ProfilesArtifactSchema = z.object({
  type: z.literal('profiles'),
  content: z.array(CompetitorSnapshotSchema).min(1),
})

export const SynthesisArtifactSchema = z.object({
  type: z.literal('synthesis'),
  content: MarketSynthesisSchema,
})

export const ArtifactSchema = z.discriminatedUnion('type', [
  ProfilesArtifactSchema,
  SynthesisArtifactSchema,
])

export type ProfilesArtifact = z.infer<typeof ProfilesArtifactSchema>
export type SynthesisArtifact = z.infer<typeof SynthesisArtifactSchema>
export type Artifact = z.infer<typeof ArtifactSchema>

const ProfilesArtifactContentSchema = ProfilesArtifactSchema.shape.content
const SynthesisArtifactContentSchema = SynthesisArtifactSchema.shape.content

export type ProfilesArtifactContent = z.infer<
  typeof ProfilesArtifactContentSchema
>
export type SynthesisArtifactContent = z.infer<
  typeof SynthesisArtifactContentSchema
>

export type ArtifactContent = ProfilesArtifactContent | SynthesisArtifactContent

export function getArtifactContentSchema(
  type: ArtifactType
): z.ZodType<ArtifactContent> {
  switch (type) {
    case 'profiles':
      return ProfilesArtifactContentSchema
    case 'synthesis':
      return SynthesisArtifactContentSchema
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
  return schema.safeParse(value)
}


