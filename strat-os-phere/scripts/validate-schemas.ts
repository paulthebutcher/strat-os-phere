/* eslint-disable no-console */

import type { ZodSchema } from 'zod'

import { CompetitorSnapshotSchema } from '@/lib/schemas/competitorSnapshot'
import { MarketSynthesisSchema } from '@/lib/schemas/marketSynthesis'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'

function runSample<T>(
  label: string,
  schema: ZodSchema<T>,
  text: string
): void {
  const result = safeParseLLMJson<T>(text, schema)

  if (result.ok) {
    console.log(`${label}: OK`)
  } else {
    console.error(`${label}: FAILED`)
    console.error(`  Error: ${result.error}`)
    if (result.extracted) {
      console.error(`  Extracted JSON: ${result.extracted}`)
    }
  }
}

function main(): void {
  const competitorSnapshotSample = {
    competitor_name: 'Acme Analytics',
    positioning_one_liner: 'A focused toolkit for product analytics teams.',
    target_audience: ['Product managers', 'Growth analysts'],
    primary_use_cases: ['Funnel analysis', 'Experiment tracking'],
    key_value_props: ['Fast event ingestion', 'Clear experiment reporting'],
    notable_capabilities: ['Self-serve dashboards', 'SQL workspace'],
    business_model_signals: ['Subscription SaaS', 'Usage-based overages'],
    proof_points: [
      {
        claim: 'Strong adoption in mid-market SaaS.',
        evidence_quote:
          '“Most of our customers are 200–2000 employee SaaS teams.”',
        evidence_location: 'pasted_text',
        confidence: 'high',
      },
    ],
    risks_and_unknowns: ['Unclear enterprise roadmap'],
  }

  const marketSynthesisSample = {
    market_summary: {
      headline:
        'Product analytics tools are consolidating around experiment-first workflows.',
      what_is_changing: [
        'Teams are retiring legacy reporting tools.',
        'Buyer expectations are shifting toward integrated workflow suites.',
      ],
      what_buyers_care_about: [
        'Ease of onboarding new teams.',
        'Trustworthy experiment data.',
      ],
    },
    themes: [
      {
        theme: 'Workflow consolidation',
        description:
          'Buyers want fewer tools that handle end-to-end analytics.',
        competitors_supporting: ['Acme Analytics', 'Northstar Metrics'],
      },
    ],
    clusters: [
      {
        cluster_name: 'Experiment-first platforms',
        who_is_in_it: ['Acme Analytics'],
        cluster_logic:
          'Tools that make experiment design and analysis the primary entry point.',
      },
    ],
    positioning_map_text: {
      axis_x: 'Breadth of workflow coverage',
      axis_y: 'Depth of experimentation features',
      quadrants: [
        {
          name: 'Narrow but deep experiment tools',
          competitors: ['Acme Analytics'],
          notes: 'Optimized for teams who already have a BI stack.',
        },
      ],
    },
    opportunities: [
      {
        opportunity:
          'Own the experiment workflow for mid-market SaaS product teams.',
        who_it_serves:
          'Product and growth teams at 100–1000 employee SaaS companies.',
        why_now:
          'Legacy tools are being retired and teams are re-evaluating stacks.',
        why_competitors_miss_it:
          'Incumbents optimize for enterprise analytics leaders, not day-to-day experimenters.',
        suggested_angle:
          'Position as the opinionated experiment copilot for product teams.',
        risk_or_assumption:
          'Assumes PMs have authority over analytics tooling decisions.',
        priority: 1,
      },
    ],
    recommended_differentiation_angles: [
      {
        angle: 'Experiment copilot for PMs.',
        what_to_claim:
          'The fastest way for PMs to design, launch, and interpret experiments.',
        how_to_prove: [
          'Case studies from mid-market SaaS teams.',
          'Time-to-first-experiment benchmarks.',
        ],
        watch_out_for: [
          'Overpromising automation.',
          'Underspecified data governance story.',
        ],
      },
    ],
  }

  // CompetitorSnapshot samples
  runSample(
    'CompetitorSnapshot - pure JSON',
    CompetitorSnapshotSchema,
    JSON.stringify(competitorSnapshotSample)
  )

  const competitorFenced = ['```json', JSON.stringify(competitorSnapshotSample, null, 2), '```'].join(
    '\n'
  )

  runSample(
    'CompetitorSnapshot - fenced JSON',
    CompetitorSnapshotSchema,
    competitorFenced
  )

  runSample(
    'CompetitorSnapshot - with preamble',
    CompetitorSnapshotSchema,
    `Sure! Here is the JSON you asked for:\n${JSON.stringify(
      competitorSnapshotSample
    )}`
  )

  // MarketSynthesis samples
  runSample(
    'MarketSynthesis - pure JSON',
    MarketSynthesisSchema,
    JSON.stringify(marketSynthesisSample)
  )

  const synthesisFenced = ['```json', JSON.stringify(marketSynthesisSample, null, 2), '```'].join(
    '\n'
  )

  runSample(
    'MarketSynthesis - fenced JSON',
    MarketSynthesisSchema,
    synthesisFenced
  )

  runSample(
    'MarketSynthesis - with preamble',
    MarketSynthesisSchema,
    `Sure, here is the structured synthesis:\n${JSON.stringify(
      marketSynthesisSample
    )}`
  )

  // Intentionally invalid sample to demonstrate error reporting
  const invalidCompetitor = {
    ...competitorSnapshotSample,
    competitor_name: '',
  }

  runSample(
    'CompetitorSnapshot - invalid (empty competitor_name)',
    CompetitorSnapshotSchema,
    JSON.stringify(invalidCompetitor)
  )
}

main()


