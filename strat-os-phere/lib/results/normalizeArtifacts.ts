import { z } from 'zod'

import type { Artifact } from '@/lib/supabase/types'
import {
  CompetitorSnapshotSchema,
  type CompetitorSnapshot,
} from '@/lib/schemas/competitorSnapshot'
import {
  MarketSynthesisSchema,
  type MarketSynthesis,
} from '@/lib/schemas/marketSynthesis'

/**
 * Normalized views over raw Supabase artifacts so the rest of the app
 * doesn't have to care about how `content_json` is shaped.
 *
 * We explicitly support both:
 * - wrapped objects: { run_id, generated_at, snapshots | synthesis, ... }
 * - bare values: CompetitorSnapshot[] or MarketSynthesis
 */

const SnapshotsArraySchema = z.array(CompetitorSnapshotSchema)

const ProfilesEnvelopeSchema = z
  .object({
    run_id: z.string().optional().nullable(),
    generated_at: z.string().optional().nullable(),
    competitor_count: z.number().optional().nullable(),
    snapshots: SnapshotsArraySchema.optional().nullable(),
  })
  .passthrough()

const SynthesisEnvelopeSchema = z
  .object({
    run_id: z.string().optional().nullable(),
    generated_at: z.string().optional().nullable(),
    competitor_count: z.number().optional().nullable(),
    synthesis: MarketSynthesisSchema.optional().nullable(),
  })
  .passthrough()

export interface NormalizedProfilesArtifact {
  type: 'profiles'
  runId: string | null
  generatedAt: string | null
  competitorCount: number | null
  snapshots: CompetitorSnapshot[]
  artifactCreatedAt: string
}

export interface NormalizedSynthesisArtifact {
  type: 'synthesis'
  runId: string | null
  generatedAt: string | null
  competitorCount: number | null
  synthesis: MarketSynthesis
  artifactCreatedAt: string
}

export interface NormalizedResultsArtifacts {
  profiles: NormalizedProfilesArtifact | null
  synthesis: NormalizedSynthesisArtifact | null
  runId: string | null
  generatedAt: string | null
  competitorCount: number | null
}

function normalizeProfilesArtifact(
  artifact: Artifact
): NormalizedProfilesArtifact | null {
  if (artifact.type !== 'profiles') return null

  const raw = artifact.content_json

  // First, try the bare array form.
  const asArray = SnapshotsArraySchema.safeParse(raw)
  if (asArray.success) {
    const snapshots = asArray.data
    if (!snapshots.length) return null

    return {
      type: 'profiles',
      runId: null,
      generatedAt: null,
      competitorCount: snapshots.length,
      snapshots,
      artifactCreatedAt: artifact.created_at,
    }
  }

  // Then, try the wrapped envelope form.
  const asEnvelope = ProfilesEnvelopeSchema.safeParse(raw)
  if (!asEnvelope.success) return null

  const envelope = asEnvelope.data
  const snapshots = envelope.snapshots ?? []

  if (!snapshots.length) return null

  return {
    type: 'profiles',
    runId: envelope.run_id ?? null,
    generatedAt: envelope.generated_at ?? null,
    competitorCount: envelope.competitor_count ?? snapshots.length,
    snapshots,
    artifactCreatedAt: artifact.created_at,
  }
}

function normalizeSynthesisArtifact(
  artifact: Artifact
): NormalizedSynthesisArtifact | null {
  if (artifact.type !== 'synthesis') return null

  const raw = artifact.content_json

  // Bare MarketSynthesis object.
  const asSynthesis = MarketSynthesisSchema.safeParse(raw)
  if (asSynthesis.success) {
    return {
      type: 'synthesis',
      runId: null,
      generatedAt: null,
      competitorCount: null,
      synthesis: asSynthesis.data,
      artifactCreatedAt: artifact.created_at,
    }
  }

  // Wrapped envelope with { synthesis, run_id, generated_at, ... }.
  const asEnvelope = SynthesisEnvelopeSchema.safeParse(raw)
  if (!asEnvelope.success) {
    return null
  }

  const envelope = asEnvelope.data
  // Validate synthesis is present and matches MarketSynthesis schema
  if (!envelope.synthesis) {
    return null
  }

  // Validate the synthesis object matches MarketSynthesis schema
  const validatedSynthesis = MarketSynthesisSchema.safeParse(envelope.synthesis)
  if (!validatedSynthesis.success) {
    // If synthesis doesn't match schema, return null rather than throwing
    // This allows the function to gracefully handle malformed data
    return null
  }

  return {
    type: 'synthesis',
    runId: envelope.run_id ?? null,
    generatedAt: envelope.generated_at ?? null,
    competitorCount: envelope.competitor_count ?? null,
    synthesis: validatedSynthesis.data,
    artifactCreatedAt: artifact.created_at,
  }
}

export function normalizeResultsArtifacts(
  artifacts: Artifact[]
): NormalizedResultsArtifacts {
  if (!artifacts.length) {
    return {
      profiles: null,
      synthesis: null,
      runId: null,
      generatedAt: null,
      competitorCount: null,
    }
  }

  // listArtifacts already returns artifacts newest-first; preserve order.
  const profilesList = artifacts
    .filter((artifact) => artifact.type === 'profiles')
    .map(normalizeProfilesArtifact)
    .filter((value): value is NormalizedProfilesArtifact => value !== null)

  const synthesisList = artifacts
    .filter((artifact) => artifact.type === 'synthesis')
    .map(normalizeSynthesisArtifact)
    .filter((value): value is NormalizedSynthesisArtifact => value !== null)

  let selectedProfiles = profilesList[0] ?? null
  let selectedSynthesis = synthesisList[0] ?? null

  // Prefer matching run_id pairs when available.
  if (selectedProfiles?.runId && selectedSynthesis?.runId) {
    if (selectedProfiles.runId !== selectedSynthesis.runId) {
      const targetRunId = selectedProfiles.runId
      const matchingSynthesis =
        synthesisList.find((s) => s.runId === targetRunId) ?? null

      if (matchingSynthesis) {
        selectedSynthesis = matchingSynthesis
      } else if (selectedSynthesis.runId) {
        const matchingProfiles =
          profilesList.find((p) => p.runId === selectedSynthesis.runId) ?? null
        if (matchingProfiles) {
          selectedProfiles = matchingProfiles
        }
      }
    }
  }

  const runId =
    selectedProfiles?.runId ??
    selectedSynthesis?.runId ??
    null

  const generatedAt =
    selectedProfiles?.generatedAt ??
    selectedSynthesis?.generatedAt ??
    selectedProfiles?.artifactCreatedAt ??
    selectedSynthesis?.artifactCreatedAt ??
    null

  const competitorCount =
    selectedProfiles?.competitorCount ??
    selectedSynthesis?.competitorCount ??
    null

  return {
    profiles: selectedProfiles,
    synthesis: selectedSynthesis,
    runId,
    generatedAt,
    competitorCount,
  }
}

// --- Markdown formatters for copy-to-clipboard -----------------------------

export function formatProfilesToMarkdown(
  snapshots: CompetitorSnapshot[] | null | undefined
): string {
  if (!snapshots || snapshots.length === 0) {
    return 'No competitor profiles are available yet.'
  }

  const lines: string[] = ['# Competitor profiles', '']

  for (const snapshot of snapshots) {
    lines.push(`## ${snapshot.competitor_name}`)
    lines.push(`Positioning: ${snapshot.positioning_one_liner}`, '')

    if (snapshot.key_value_props?.length) {
      lines.push('Key value props:')
      for (const item of snapshot.key_value_props) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }

    if (snapshot.notable_capabilities?.length) {
      lines.push('Notable capabilities:')
      for (const item of snapshot.notable_capabilities) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }

    if (snapshot.business_model_signals?.length) {
      lines.push('Business model signals:')
      for (const item of snapshot.business_model_signals) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }

    if (snapshot.proof_points?.length) {
      lines.push('Proof points:')
      for (const proof of snapshot.proof_points) {
        lines.push(
          `- ${proof.claim}`,
          `  - Evidence: "${proof.evidence_quote}"`,
          `  - Confidence: ${proof.confidence}`
        )
      }
      lines.push('')
    }

    if (snapshot.risks_and_unknowns?.length) {
      lines.push('Risks & unknowns:')
      for (const item of snapshot.risks_and_unknowns) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n').trimEnd()
}

export function formatThemesToMarkdown(
  synthesis: MarketSynthesis | null | undefined
): string {
  if (!synthesis) {
    return 'No themes are available yet.'
  }

  const { market_summary, themes } = synthesis
  const lines: string[] = ['# Market themes', '']

  if (market_summary) {
    lines.push(`## Summary: ${market_summary.headline}`, '')

    if (market_summary.what_is_changing?.length) {
      lines.push('What is changing:')
      for (const item of market_summary.what_is_changing) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }

    if (market_summary.what_buyers_care_about?.length) {
      lines.push('What buyers care about:')
      for (const item of market_summary.what_buyers_care_about) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }
  }

  if (themes?.length) {
    for (const theme of themes) {
      lines.push(`## ${theme.theme}`, theme.description)
      if (theme.competitors_supporting?.length) {
        lines.push('', 'Competitors supporting:')
        for (const name of theme.competitors_supporting) {
          lines.push(`- ${name}`)
        }
      }
      lines.push('')
    }
  }

  return lines.join('\n').trimEnd()
}

export function formatPositioningToMarkdown(
  synthesis: MarketSynthesis | null | undefined
): string {
  if (!synthesis) {
    return 'No positioning analysis is available yet.'
  }

  const { positioning_map_text, clusters } = synthesis
  const lines: string[] = ['# Positioning map', '']

  if (positioning_map_text) {
    lines.push(
      `Axes: ${positioning_map_text.axis_x} (x) · ${positioning_map_text.axis_y} (y)`,
      ''
    )

    if (positioning_map_text.quadrants?.length) {
      lines.push('Quadrants:')
      for (const quadrant of positioning_map_text.quadrants) {
        lines.push(`- ${quadrant.name}`)
        if (quadrant.competitors?.length) {
          lines.push(`  - Competitors: ${quadrant.competitors.join(', ')}`)
        }
        if (quadrant.notes) {
          lines.push(`  - Notes: ${quadrant.notes}`)
        }
      }
      lines.push('')
    }
  }

  if (clusters?.length) {
    lines.push('# Clusters', '')
    for (const cluster of clusters) {
      lines.push(`- ${cluster.cluster_name}`)
      if (cluster.who_is_in_it?.length) {
        lines.push(`  - Who is in it: ${cluster.who_is_in_it.join(', ')}`)
      }
      if (cluster.cluster_logic) {
        lines.push(`  - Logic: ${cluster.cluster_logic}`)
      }
    }
  }

  return lines.join('\n').trimEnd()
}

export function formatOpportunitiesToMarkdown(
  synthesis: MarketSynthesis | null | undefined
): string {
  if (!synthesis || !synthesis.opportunities?.length) {
    return 'No opportunities are available yet.'
  }

  const sorted = [...synthesis.opportunities].sort(
    (a, b) => a.priority - b.priority
  )

  const lines: string[] = ['# Opportunities', '']

  for (const opportunity of sorted) {
    lines.push(
      `## [Priority ${opportunity.priority}] ${opportunity.opportunity}`,
      `Who it serves: ${opportunity.who_it_serves}`,
      `Why now: ${opportunity.why_now}`,
      `Why competitors miss it: ${opportunity.why_competitors_miss_it}`,
      `Suggested angle: ${opportunity.suggested_angle}`,
      `Risk or assumption: ${opportunity.risk_or_assumption}`,
      ''
    )
  }

  return lines.join('\n').trimEnd()
}

export function formatAnglesToMarkdown(
  synthesis: MarketSynthesis | null | undefined
): string {
  if (
    !synthesis ||
    !synthesis.recommended_differentiation_angles?.length
  ) {
    return 'No differentiation angles are available yet.'
  }

  const lines: string[] = ['# Differentiation angles', '']

  for (const angle of synthesis.recommended_differentiation_angles) {
    lines.push(`## ${angle.angle}`, angle.what_to_claim, '')

    if (angle.how_to_prove?.length) {
      lines.push('How to prove:')
      for (const item of angle.how_to_prove) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }

    if (angle.watch_out_for?.length) {
      lines.push('Watch out for:')
      for (const item of angle.watch_out_for) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n').trimEnd()
}


