import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getProjectById } from '@/lib/data/projects'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { createArtifact } from '@/lib/data/artifacts'
import { buildEvidenceDigest } from '@/lib/results/evidenceDigest'
import { buildOpportunitiesV2Prompt } from '@/lib/prompts/opportunitiesV2'
import { buildStrategicBetsV2Prompt } from '@/lib/prompts/strategicBetsV2'
import { callLLM } from '@/lib/llm/callLLM'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'
import { buildRepairMessages } from '@/lib/prompts/repair'
import {
  OpportunitiesV2OverlaySchema,
  type OpportunitiesV2Overlay,
} from '@/lib/schemas/opportunitiesV2Overlay'
import {
  StrategicBetsV2OverlaySchema,
  type StrategicBetsV2Overlay,
} from '@/lib/schemas/strategicBetsV2Overlay'
import { computeEvidenceCoverage } from '@/lib/results/coverage'
import type { ProjectContext } from '@/lib/prompts/snapshot'

export const runtime = 'nodejs'

/**
 * POST /api/results/generate-quality-v2
 * Generates Quality Pack v2 overlay artifacts (opportunities_v2_overlay and strategic_bets_v2_overlay)
 * 
 * Request body: { projectId: string }
 * Response: { ok: true, artifactIds: string[] } | { ok: false, error: {...} }
 * 
 * Gated by RESULTS_QUALITY_PACK_V2_SERVER flag - returns 404 if flag is off
 */
export async function POST(request: Request) {
  // Hard check server flag - return 404 if off
  if (process.env.RESULTS_QUALITY_PACK_V2_SERVER !== 'true') {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'FEATURE_DISABLED',
          message: 'Quality Pack v2 is not enabled',
        },
      },
      { status: 404 }
    )
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'You must be signed in to generate quality overlays.',
          },
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const projectId = body.projectId as string | undefined

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'projectId is required',
          },
        },
        { status: 400 }
      )
    }

    // Load project
    const project = await getProjectById(supabase, projectId)
    if (!project) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        },
        { status: 404 }
      )
    }

    // Verify ownership
    if (project.user_id !== user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this project',
          },
        },
        { status: 403 }
      )
    }

    // Load competitors
    const competitors = await listCompetitorsForProject(supabase, projectId)
    const competitorList = competitors.map((c) => c.name)

    // Build project context
    const projectContext: ProjectContext = {
      market: project.market,
      target_customer: project.target_customer,
      your_product: project.your_product,
      business_goal: project.business_goal,
      geography: project.geography,
      primary_constraint: project.primary_constraint,
      risk_posture: project.risk_posture,
      ambition_level: project.ambition_level,
      organizational_capabilities: project.organizational_capabilities,
      decision_level: project.decision_level,
      explicit_non_goals: project.explicit_non_goals,
      input_confidence: project.input_confidence,
    }

    // Build evidence digest (gracefully handles missing evidence_sources)
    const evidenceDigest = await buildEvidenceDigest({
      projectId,
      maxSources: 12,
      windowDays: 90,
    })

    // Generate Opportunities v2 overlay
    const opportunitiesPrompt = buildOpportunitiesV2Prompt({
      project: projectContext,
      competitorList,
      evidenceDigest,
    })

    let opportunitiesResponse = await callLLM({
      messages: opportunitiesPrompt,
    })

    let opportunitiesParsed = safeParseLLMJson(
      opportunitiesResponse.text,
      OpportunitiesV2OverlaySchema
    )

    // Repair pass if needed
    if (!opportunitiesParsed.ok) {
      const repairMessages = buildRepairMessages({
        rawText: opportunitiesResponse.text,
        schemaName: 'OpportunitiesV2Overlay',
        schemaShapeText: JSON.stringify(
          {
            schema_version: 2,
            meta: {
              generated_at: 'string (ISO 8601)',
              window_days: 'number',
              coverage_score: 'number (optional)',
            },
            opportunities: [
              {
                id: 'string',
                title: 'string',
                one_liner: 'string',
                differentiation_mechanism: ['string'],
                why_competitors_wont_follow: ['string'],
                first_experiment: {
                  steps: ['string'],
                  metric: 'string',
                  duration_days: 'number',
                },
                confidence: 'high | medium | low',
                citations: [
                  {
                    url: 'string',
                    source_type: 'string (optional)',
                    extracted_at: 'string (optional)',
                  },
                ],
                score: 'number (optional)',
              },
            ],
          },
          null,
          2
        ),
        validationErrors: opportunitiesParsed.error,
      })

      const repairResponse = await callLLM({
        messages: repairMessages,
      })

      opportunitiesParsed = safeParseLLMJson(
        repairResponse.text,
        OpportunitiesV2OverlaySchema
      )

      if (!opportunitiesParsed.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'PARSE_ERROR',
              message: `Failed to parse opportunities: ${opportunitiesParsed.error}`,
            },
          },
          { status: 500 }
        )
      }
    }

    const opportunitiesOverlay = opportunitiesParsed.data

    // Compute coverage and add to meta
    const opportunitiesCoverage = computeEvidenceCoverage(opportunitiesOverlay)
    opportunitiesOverlay.meta.coverage_score = opportunitiesCoverage.coverageScore

    // Generate Strategic Bets v2 overlay (using top opportunities)
    const topOpportunities = opportunitiesOverlay.opportunities
      .slice(0, 5)
      .map((opp) => ({
        id: opp.id,
        title: opp.title,
        one_liner: opp.one_liner,
        confidence: opp.confidence,
        citations: opp.citations,
      }))

    const strategicBetsPrompt = buildStrategicBetsV2Prompt({
      project: projectContext,
      topOpportunities,
      evidenceDigest,
    })

    let strategicBetsResponse = await callLLM({
      messages: strategicBetsPrompt,
    })

    let strategicBetsParsed = safeParseLLMJson(
      strategicBetsResponse.text,
      StrategicBetsV2OverlaySchema
    )

    // Repair pass if needed
    if (!strategicBetsParsed.ok) {
      const repairMessages = buildRepairMessages({
        rawText: strategicBetsResponse.text,
        schemaName: 'StrategicBetsV2Overlay',
        schemaShapeText: JSON.stringify(
          {
            schema_version: 2,
            meta: {
              generated_at: 'string (ISO 8601)',
              window_days: 'number',
              coverage_score: 'number (optional)',
            },
            bets: [
              {
                id: 'string',
                title: 'string',
                summary: 'string',
                what_we_say_no_to: ['string'],
                capability_we_must_build: ['string'],
                why_competitors_wont_follow_easily: 'string',
                risk_and_assumptions: ['string'],
                decision_owner: 'string',
                time_horizon: 'Now | Next | Later',
                citations: [
                  {
                    url: 'string',
                    source_type: 'string (optional)',
                    extracted_at: 'string (optional)',
                  },
                ],
              },
            ],
          },
          null,
          2
        ),
        validationErrors: strategicBetsParsed.error,
      })

      const repairResponse = await callLLM({
        messages: repairMessages,
      })

      strategicBetsParsed = safeParseLLMJson(
        repairResponse.text,
        StrategicBetsV2OverlaySchema
      )

      if (!strategicBetsParsed.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'PARSE_ERROR',
              message: `Failed to parse strategic bets: ${strategicBetsParsed.error}`,
            },
          },
          { status: 500 }
        )
      }
    }

    const strategicBetsOverlay = strategicBetsParsed.data

    // Compute coverage and add to meta
    const strategicBetsCoverage = computeEvidenceCoverage(strategicBetsOverlay)
    strategicBetsOverlay.meta.coverage_score = strategicBetsCoverage.coverageScore

    // Store artifacts
    const opportunitiesArtifact = await createArtifact(supabase, {
      project_id: projectId,
      type: 'opportunities_v2_overlay' as any,
      content_json: opportunitiesOverlay as any,
    })

    const strategicBetsArtifact = await createArtifact(supabase, {
      project_id: projectId,
      type: 'strategic_bets_v2_overlay' as any,
      content_json: strategicBetsOverlay as any,
    })

    return NextResponse.json({
      ok: true,
      artifactIds: [opportunitiesArtifact.id, strategicBetsArtifact.id],
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        },
      },
      { status: 500 }
    )
  }
}

