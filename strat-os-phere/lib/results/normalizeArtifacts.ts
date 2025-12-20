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
import {
  JtbdArtifactContentSchema,
  type JtbdArtifactContent,
} from '@/lib/schemas/jtbd'
import {
  OpportunitiesArtifactContentSchema,
  type OpportunitiesArtifactContent,
} from '@/lib/schemas/opportunities'
import {
  ScoringMatrixArtifactContentSchema,
  type ScoringMatrixArtifactContent,
} from '@/lib/schemas/scoring'

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

export interface NormalizedJtbdArtifact {
  type: 'jtbd'
  runId: string | null
  generatedAt: string | null
  content: JtbdArtifactContent
  artifactCreatedAt: string
}

export interface NormalizedOpportunitiesV2Artifact {
  type: 'opportunities_v2'
  runId: string | null
  generatedAt: string | null
  content: OpportunitiesArtifactContent
  artifactCreatedAt: string
}

export interface NormalizedScoringMatrixArtifact {
  type: 'scoring_matrix'
  runId: string | null
  generatedAt: string | null
  content: ScoringMatrixArtifactContent
  artifactCreatedAt: string
}

export interface NormalizedResultsArtifacts {
  profiles: NormalizedProfilesArtifact | null
  synthesis: NormalizedSynthesisArtifact | null
  jtbd: NormalizedJtbdArtifact | null
  opportunitiesV2: NormalizedOpportunitiesV2Artifact | null
  scoringMatrix: NormalizedScoringMatrixArtifact | null
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

function normalizeJtbdArtifact(
  artifact: Artifact
): NormalizedJtbdArtifact | null {
  if ((artifact.type as string) !== 'jtbd') return null

  const parsed = JtbdArtifactContentSchema.safeParse(artifact.content_json)
  if (!parsed.success) return null

  return {
    type: 'jtbd',
    runId: parsed.data.meta.run_id ?? null,
    generatedAt: parsed.data.meta.generated_at ?? null,
    content: parsed.data,
    artifactCreatedAt: artifact.created_at,
  }
}

function normalizeOpportunitiesV2Artifact(
  artifact: Artifact
): NormalizedOpportunitiesV2Artifact | null {
  if ((artifact.type as string) !== 'opportunities_v2') return null

  const parsed = OpportunitiesArtifactContentSchema.safeParse(
    artifact.content_json
  )
  if (!parsed.success) return null

  return {
    type: 'opportunities_v2',
    runId: parsed.data.meta.run_id ?? null,
    generatedAt: parsed.data.meta.generated_at ?? null,
    content: parsed.data,
    artifactCreatedAt: artifact.created_at,
  }
}

function normalizeScoringMatrixArtifact(
  artifact: Artifact
): NormalizedScoringMatrixArtifact | null {
  if ((artifact.type as string) !== 'scoring_matrix') return null

  const parsed = ScoringMatrixArtifactContentSchema.safeParse(
    artifact.content_json
  )
  if (!parsed.success) return null

  return {
    type: 'scoring_matrix',
    runId: parsed.data.meta.run_id ?? null,
    generatedAt: parsed.data.meta.generated_at ?? null,
    content: parsed.data,
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
      jtbd: null,
      opportunitiesV2: null,
      scoringMatrix: null,
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

  const jtbdList = artifacts
    .filter((artifact) => (artifact.type as string) === 'jtbd')
    .map(normalizeJtbdArtifact)
    .filter((value): value is NormalizedJtbdArtifact => value !== null)

  const opportunitiesV2List = artifacts
    .filter((artifact) => (artifact.type as string) === 'opportunities_v2')
    .map(normalizeOpportunitiesV2Artifact)
    .filter(
      (value): value is NormalizedOpportunitiesV2Artifact => value !== null
    )

  const scoringMatrixList = artifacts
    .filter((artifact) => (artifact.type as string) === 'scoring_matrix')
    .map(normalizeScoringMatrixArtifact)
    .filter(
      (value): value is NormalizedScoringMatrixArtifact => value !== null
    )

  // Prefer v2 artifacts (schema_version=2) over v1, then by created_at (newest first)
  const selectV2Artifact = <T extends { content: { meta?: { schema_version?: number } }; artifactCreatedAt: string }>(
    list: T[]
  ): T | null => {
    // Separate v2 and v1 artifacts
    const v2Artifacts = list.filter(
      (a) => a.content.meta?.schema_version === 2
    )
    const v1Artifacts = list.filter(
      (a) => !a.content.meta?.schema_version || a.content.meta.schema_version === 1
    )

    // Prefer v2, fall back to v1
    const candidates = v2Artifacts.length > 0 ? v2Artifacts : v1Artifacts
    if (candidates.length === 0) return null

    // Sort by artifactCreatedAt (newest first) - listArtifacts already returns newest first,
    // but we're filtering so we need to re-sort
    return candidates.sort(
      (a, b) =>
        new Date(b.artifactCreatedAt).getTime() -
        new Date(a.artifactCreatedAt).getTime()
    )[0]
  }

  let selectedProfiles = profilesList[0] ?? null
  let selectedSynthesis = synthesisList[0] ?? null
  const selectedJtbd = selectV2Artifact(jtbdList)
  const selectedOpportunitiesV2 = selectV2Artifact(opportunitiesV2List)
  const selectedScoringMatrix = selectV2Artifact(scoringMatrixList)

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
    selectedJtbd?.runId ??
    selectedOpportunitiesV2?.runId ??
    selectedScoringMatrix?.runId ??
    null

  const generatedAt =
    selectedProfiles?.generatedAt ??
    selectedSynthesis?.generatedAt ??
    selectedJtbd?.generatedAt ??
    selectedOpportunitiesV2?.generatedAt ??
    selectedScoringMatrix?.generatedAt ??
    selectedProfiles?.artifactCreatedAt ??
    selectedSynthesis?.artifactCreatedAt ??
    selectedJtbd?.artifactCreatedAt ??
    selectedOpportunitiesV2?.artifactCreatedAt ??
    selectedScoringMatrix?.artifactCreatedAt ??
    null

  const competitorCount =
    selectedProfiles?.competitorCount ??
    selectedSynthesis?.competitorCount ??
    null

  return {
    profiles: selectedProfiles,
    synthesis: selectedSynthesis,
    jtbd: selectedJtbd,
    opportunitiesV2: selectedOpportunitiesV2,
    scoringMatrix: selectedScoringMatrix,
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

export function formatJtbdToMarkdown(
  jtbd: JtbdArtifactContent | null | undefined
): string {
  if (!jtbd || !jtbd.jobs?.length) {
    return 'No Jobs To Be Done are available yet.'
  }

  // Sort by opportunity_score descending
  const sorted = [...jtbd.jobs].sort(
    (a, b) => b.opportunity_score - a.opportunity_score
  )

  const lines: string[] = ['# Jobs To Be Done', '']

  for (const job of sorted) {
    lines.push(`## ${job.job_statement}`, '')
    lines.push(`**Context:** ${job.context}`, '')
    lines.push(`**Who:** ${job.who}`, '')
    lines.push(`**Frequency:** ${job.frequency}`, '')
    lines.push(
      `**Opportunity Score:** ${job.opportunity_score}/100 (Importance: ${job.importance_score}/5, Satisfaction: ${job.satisfaction_score}/5)`,
      ''
    )

    if (job.desired_outcomes?.length) {
      lines.push('**Desired Outcomes:**')
      for (const outcome of job.desired_outcomes) {
        lines.push(`- ${outcome}`)
      }
      lines.push('')
    }

    if (job.constraints?.length) {
      lines.push('**Constraints:**')
      for (const constraint of job.constraints) {
        lines.push(`- ${constraint}`)
      }
      lines.push('')
    }

    if (job.current_workarounds?.length) {
      lines.push('**Current Workarounds:**')
      for (const workaround of job.current_workarounds) {
        lines.push(`- ${workaround}`)
      }
      lines.push('')
    }

    if (job.non_negotiables?.length) {
      lines.push('**Non-negotiables:**')
      for (const nonNegotiable of job.non_negotiables) {
        lines.push(`- ${nonNegotiable}`)
      }
      lines.push('')
    }

    if (job.evidence?.length) {
      lines.push('**Evidence:**')
      for (const ev of job.evidence) {
        if (ev.competitor) lines.push(`- Competitor: ${ev.competitor}`)
        if (ev.citation) lines.push(`  - Citation: ${ev.citation}`)
        if (ev.quote) lines.push(`  - Quote: "${ev.quote}"`)
      }
      lines.push('')
    }
  }

  return lines.join('\n').trimEnd()
}

export function formatOpportunitiesV2ToMarkdown(
  opportunities: OpportunitiesArtifactContent | null | undefined
): string {
  if (!opportunities || !opportunities.opportunities?.length) {
    return 'No opportunities are available yet.'
  }

  // Sort by score descending
  const sorted = [...opportunities.opportunities].sort(
    (a, b) => b.score - a.score
  )

  const lines: string[] = ['# Differentiation Opportunities', '']

  for (const opp of sorted) {
    lines.push(
      `## [Score: ${opp.score}/100] ${opp.title}`,
      `**Type:** ${opp.type}`,
      `**Who it serves:** ${opp.who_it_serves}`,
      `**Impact:** ${opp.impact} | **Effort:** ${opp.effort} | **Confidence:** ${opp.confidence}`,
      ''
    )

    if (opp.why_now) {
      lines.push(`**Why now:** ${opp.why_now}`, '')
    }

    if (opp.how_to_win?.length) {
      lines.push('**How to win:**')
      for (const tactic of opp.how_to_win) {
        lines.push(`- ${tactic}`)
      }
      lines.push('')
    }

    if (opp.what_competitors_do_today) {
      lines.push(`**What competitors do today:** ${opp.what_competitors_do_today}`, '')
    }

    if (opp.why_they_cant_easily_copy) {
      lines.push(`**Why they can't easily copy:** ${opp.why_they_cant_easily_copy}`, '')
    }

    if (opp.risks?.length) {
      lines.push('**Risks:**')
      for (const risk of opp.risks) {
        lines.push(`- ${risk}`)
      }
      lines.push('')
    }

    if (opp.first_experiments?.length) {
      lines.push('**First Experiments (1-2 weeks):**')
      for (const exp of opp.first_experiments) {
        lines.push(`- ${exp}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n').trimEnd()
}

export function formatScoringMatrixToMarkdown(
  scoring: ScoringMatrixArtifactContent | null | undefined
): string {
  if (!scoring) {
    return 'No scoring matrix is available yet.'
  }

  const lines: string[] = ['# Competitive Scoring Matrix', '']

  if (scoring.criteria?.length) {
    lines.push('## Criteria', '')
    for (const criterion of scoring.criteria) {
      lines.push(
        `### ${criterion.name} (Weight: ${criterion.weight}/5)`,
        criterion.description,
        `**How to score:** ${criterion.how_to_score}`,
        ''
      )
    }
  }

  if (scoring.summary?.length) {
    // Sort by total_weighted_score descending
    const sorted = [...scoring.summary].sort(
      (a, b) => b.total_weighted_score - a.total_weighted_score
    )

    lines.push('## Summary', '')
    for (const summary of sorted) {
      lines.push(
        `### ${summary.competitor_name} (Score: ${summary.total_weighted_score.toFixed(1)}/100)`,
        ''
      )

      if (summary.strengths?.length) {
        lines.push('**Strengths:**')
        for (const strength of summary.strengths) {
          lines.push(`- ${strength}`)
        }
        lines.push('')
      }

      if (summary.weaknesses?.length) {
        lines.push('**Weaknesses:**')
        for (const weakness of summary.weaknesses) {
          lines.push(`- ${weakness}`)
        }
        lines.push('')
      }
    }
  }

  if (scoring.notes) {
    lines.push('## Notes', '', scoring.notes)
  }

  return lines.join('\n').trimEnd()
}


