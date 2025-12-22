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
  OpportunityV3ArtifactContentSchema,
  type OpportunityV3ArtifactContent,
} from '@/lib/schemas/opportunityV3'
import {
  ScoringMatrixArtifactContentSchema,
  type ScoringMatrixArtifactContent,
} from '@/lib/schemas/scoring'
import {
  StrategicBetsArtifactContentSchema,
  type StrategicBetsArtifactContent,
} from '@/lib/schemas/strategicBet'

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

export interface NormalizedOpportunitiesV3Artifact {
  type: 'opportunities_v3'
  runId: string | null
  generatedAt: string | null
  content: OpportunityV3ArtifactContent
  artifactCreatedAt: string
}

export interface NormalizedScoringMatrixArtifact {
  type: 'scoring_matrix'
  runId: string | null
  generatedAt: string | null
  content: ScoringMatrixArtifactContent
  artifactCreatedAt: string
}

export interface NormalizedStrategicBetsArtifact {
  type: 'strategic_bets'
  runId: string | null
  generatedAt: string | null
  content: StrategicBetsArtifactContent
  artifactCreatedAt: string
}

export interface NormalizedResultsArtifacts {
  profiles: NormalizedProfilesArtifact | null
  synthesis: NormalizedSynthesisArtifact | null
  jtbd: NormalizedJtbdArtifact | null
  opportunitiesV2: NormalizedOpportunitiesV2Artifact | null
  opportunitiesV3: NormalizedOpportunitiesV3Artifact | null
  scoringMatrix: NormalizedScoringMatrixArtifact | null
  strategicBets: NormalizedStrategicBetsArtifact | null
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

function normalizeOpportunitiesV3Artifact(
  artifact: Artifact
): NormalizedOpportunitiesV3Artifact | null {
  if ((artifact.type as string) !== 'opportunities_v3') return null

  const parsed = OpportunityV3ArtifactContentSchema.safeParse(
    artifact.content_json
  )
  if (!parsed.success) return null

  return {
    type: 'opportunities_v3',
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

function normalizeStrategicBetsArtifact(
  artifact: Artifact
): NormalizedStrategicBetsArtifact | null {
  if ((artifact.type as string) !== 'strategic_bets') return null

  const parsed = StrategicBetsArtifactContentSchema.safeParse(
    artifact.content_json
  )
  if (!parsed.success) return null

  return {
    type: 'strategic_bets',
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
      opportunitiesV3: null,
      scoringMatrix: null,
      strategicBets: null,
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

  const opportunitiesV3List = artifacts
    .filter((artifact) => (artifact.type as string) === 'opportunities_v3')
    .map(normalizeOpportunitiesV3Artifact)
    .filter(
      (value): value is NormalizedOpportunitiesV3Artifact => value !== null
    )

  const scoringMatrixList = artifacts
    .filter((artifact) => (artifact.type as string) === 'scoring_matrix')
    .map(normalizeScoringMatrixArtifact)
    .filter(
      (value): value is NormalizedScoringMatrixArtifact => value !== null
    )

  const strategicBetsList = artifacts
    .filter((artifact) => (artifact.type as string) === 'strategic_bets')
    .map(normalizeStrategicBetsArtifact)
    .filter(
      (value): value is NormalizedStrategicBetsArtifact => value !== null
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
  // Prefer v3 over v2, then v2 over v1
  const selectedOpportunitiesV3 = opportunitiesV3List.length > 0
    ? opportunitiesV3List.sort(
        (a, b) =>
          new Date(b.artifactCreatedAt).getTime() -
          new Date(a.artifactCreatedAt).getTime()
      )[0]
    : null
  const selectedOpportunitiesV2 = selectedOpportunitiesV3 ? null : selectV2Artifact(opportunitiesV2List)
  const selectedScoringMatrix = selectV2Artifact(scoringMatrixList)
  const selectedStrategicBets = selectV2Artifact(strategicBetsList)

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
    selectedOpportunitiesV3?.runId ??
    selectedOpportunitiesV2?.runId ??
    selectedScoringMatrix?.runId ??
    selectedStrategicBets?.runId ??
    null

  const generatedAt =
    selectedProfiles?.generatedAt ??
    selectedSynthesis?.generatedAt ??
    selectedJtbd?.generatedAt ??
    selectedOpportunitiesV3?.generatedAt ??
    selectedOpportunitiesV2?.generatedAt ??
    selectedScoringMatrix?.generatedAt ??
    selectedStrategicBets?.generatedAt ??
    selectedProfiles?.artifactCreatedAt ??
    selectedSynthesis?.artifactCreatedAt ??
    selectedJtbd?.artifactCreatedAt ??
    selectedOpportunitiesV3?.artifactCreatedAt ??
    selectedOpportunitiesV2?.artifactCreatedAt ??
    selectedScoringMatrix?.artifactCreatedAt ??
    selectedStrategicBets?.artifactCreatedAt ??
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
    opportunitiesV3: selectedOpportunitiesV3,
    scoringMatrix: selectedScoringMatrix,
    strategicBets: selectedStrategicBets,
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

export function formatStrategicBetsToMarkdown(
  strategicBets: StrategicBetsArtifactContent | null | undefined
): string {
  if (!strategicBets || !strategicBets.bets?.length) {
    return 'No strategic bets are available yet.'
  }

  const lines: string[] = ['# Strategic Bets', '']
  lines.push('Strategic bets synthesize analysis into concrete, commitment-ready decisions suitable for VP+ Product and UX leaders.', '')

  for (const bet of strategicBets.bets) {
    lines.push(`## ${bet.title}`, '')
    lines.push(`**Confidence Score:** ${bet.confidence_score}/100`, '')
    lines.push(`**Summary:** ${bet.summary}`, '')

    if (bet.what_we_say_no_to?.length) {
      lines.push('**What we say no to:**')
      for (const item of bet.what_we_say_no_to) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }

    if (bet.forced_capabilities?.length) {
      lines.push('**Capabilities this forces:**')
      for (const capability of bet.forced_capabilities) {
        lines.push(`- ${capability}`)
      }
      lines.push('')
    }

    if (bet.why_competitors_wont_follow) {
      lines.push(`**Why competitors won't follow:** ${bet.why_competitors_wont_follow}`, '')
    }

    if (bet.first_real_world_proof) {
      lines.push(`**First real-world proof (${bet.first_real_world_proof.timeframe_weeks} weeks):**`)
      lines.push(`- Description: ${bet.first_real_world_proof.description}`)
      lines.push(`- Success signal: ${bet.first_real_world_proof.success_signal}`)
      lines.push('')
    }

    if (bet.invalidation_signals?.length) {
      lines.push('**What would invalidate this bet:**')
      for (const signal of bet.invalidation_signals) {
        lines.push(`- ${signal}`)
      }
      lines.push('')
    }

    if (bet.opportunity_source_ids?.length) {
      lines.push(`**Based on:** ${bet.opportunity_source_ids.join(', ')}`, '')
    }

    if (bet.supporting_signals?.length) {
      lines.push('**Supporting evidence:**')
      for (const signal of bet.supporting_signals) {
        lines.push(`- ${signal.source_type} (${signal.citation_count} citations)`)
      }
      lines.push('')
    }
  }

  return lines.join('\n').trimEnd()
}

export function formatOpportunitiesV3ToMarkdown(
  opportunities: OpportunityV3ArtifactContent | null | undefined
): string {
  if (!opportunities || !opportunities.opportunities?.length) {
    return 'No opportunities are available yet.'
  }

  // Sort by score descending
  const sorted = [...opportunities.opportunities].sort(
    (a, b) => b.scoring.total - a.scoring.total
  )

  const lines: string[] = ['# Opportunities', '']

  for (const opp of sorted) {
    lines.push(
      `## [Score: ${opp.scoring.total}/100] ${opp.title}`,
      '',
      `**One-liner:** ${opp.one_liner}`,
      `**Customer:** ${opp.customer}`,
      ''
    )

    lines.push('**Problem Today:**', opp.problem_today, '')
    lines.push('**Proposed Move:**', opp.proposed_move, '')
    lines.push('**Why Now:**', opp.why_now, '')

    if (opp.proof_points?.length) {
      lines.push('**Proof Points:**')
      for (const proof of opp.proof_points) {
        lines.push(`- ${proof.claim}`)
        if (proof.citations?.length) {
          for (const citation of proof.citations) {
            lines.push(`  - ${citation.source_type}${citation.domain ? ` (${citation.domain})` : ''}: ${citation.url}`)
          }
        }
      }
      lines.push('')
    }

    lines.push('**Score Breakdown:**')
    for (const [key, value] of Object.entries(opp.scoring.breakdown)) {
      lines.push(`- ${key.replace(/_/g, ' ')}: ${value.toFixed(1)}/10`)
    }
    lines.push('')

    if (opp.scoring.explainability?.length) {
      lines.push('**Score Explanation:**')
      for (const explanation of opp.scoring.explainability) {
        lines.push(`- ${explanation.explanation}`)
      }
      lines.push('')
    }

    if (opp.tradeoffs.what_we_say_no_to?.length) {
      lines.push('**What We Say No To:**')
      for (const item of opp.tradeoffs.what_we_say_no_to) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }

    if (opp.tradeoffs.capability_forced?.length) {
      lines.push('**Capability Forced:**')
      for (const capability of opp.tradeoffs.capability_forced) {
        lines.push(`- ${capability}`)
      }
      lines.push('')
    }

    if (opp.tradeoffs.why_competitors_wont_follow?.length) {
      lines.push('**Why Competitors Won\'t Follow:**')
      for (const reason of opp.tradeoffs.why_competitors_wont_follow) {
        lines.push(`- ${reason}`)
      }
      lines.push('')
    }

    if (opp.experiments?.length) {
      lines.push('**First Experiments:**')
      for (const exp of opp.experiments) {
        lines.push(`- **Hypothesis:** ${exp.hypothesis}`)
        lines.push(`  - Test: ${exp.smallest_test}`)
        lines.push(`  - Success Metric: ${exp.success_metric}`)
        lines.push(`  - Timeframe: ${exp.expected_timeframe}`)
        lines.push(`  - Risk Reduced: ${exp.risk_reduced}`)
      }
      lines.push('')
    }

    if (opp.citations?.length) {
      lines.push('**Citations:**')
      for (const citation of opp.citations) {
        lines.push(`- ${citation.source_type}${citation.domain ? ` (${citation.domain})` : ''}: ${citation.url}`)
        if (citation.title) {
          lines.push(`  - ${citation.title}`)
        }
      }
      lines.push('')
    }
  }

  return lines.join('\n').trimEnd()
}


