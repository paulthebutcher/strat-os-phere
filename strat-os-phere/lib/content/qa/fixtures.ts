/**
 * QA Fixtures - Deterministic test data for dev-only QA harness
 * 
 * These fixtures are used only in /dev/qa route to validate UI behavior
 * across edge cases without depending on Supabase state.
 * 
 * All fixtures conform to OpportunityV1 schema.
 */

import type { OpportunityV1 } from '@/lib/opportunities/opportunityV1'
import { OPPORTUNITY_V1_SCHEMA_VERSION } from '@/lib/opportunities/opportunityV1'

/**
 * Full opportunity with all fields populated
 * - 6 citations across 4 types
 * - Has risks and assumptions
 * - Has whyThisRanks (3 items)
 */
export const opportunity_full: OpportunityV1 = {
  id: 'qa-fixture-full',
  title: 'Add real-time collaborative editing to code editors',
  jtbd: {
    job: 'Pair program or review code together',
    context: 'Developers need to see changes in real-time but currently rely on screen sharing or async comments',
    constraints: 'Must work across time zones and handle simultaneous edits',
  },
  forWhom: 'Development teams of 5+ developers',
  whyCompetitorsMissIt: 'Most competitors focus on async workflows, missing the synchronous collaboration demand shown in recent user reviews',
  recommendation: {
    whatToDo: 'Build a real-time collaborative editing feature with live cursors, edits, and comments synchronized across all participants',
    whyNow: 'Three major competitors launched collaborative features in the last 90 days, and user reviews show 40% of teams actively seeking this capability',
    expectedImpact: 'Reduces context-switching overhead and speeds up decision-making in code reviews',
    risks: [
      'Operational complexity of conflict resolution may create support burden',
      'May conflict with existing workflow tools teams already use',
    ],
  },
  citations: [
    {
      evidenceId: 'ev-1',
      url: 'https://github.blog/2024-01-10-introducing-codespaces-collaboration',
      sourceType: 'changelog',
      excerpt: 'We are excited to introduce real-time collaboration features in GitHub Codespaces, allowing developers to work together seamlessly',
      retrievedAt: '2024-01-15T10:30:00Z',
    },
    {
      evidenceId: 'ev-2',
      url: 'https://www.gitpod.io/changelog/real-time-collaboration',
      sourceType: 'changelog',
      excerpt: 'Real-time collaboration is now available in Gitpod. Multiple developers can now edit the same workspace simultaneously',
      retrievedAt: '2024-01-16T08:00:00Z',
    },
    {
      evidenceId: 'ev-3',
      url: 'https://www.g2.com/products/vscode/reviews',
      sourceType: 'reviews',
      excerpt: 'Users consistently request real-time collaboration features. Teams of 5+ developers especially need synchronous editing capabilities',
      retrievedAt: '2024-01-20T14:00:00Z',
    },
    {
      evidenceId: 'ev-4',
      url: 'https://replit.com/pricing',
      sourceType: 'pricing',
      excerpt: 'Collaboration features are now available as a premium differentiator on our pricing page',
      retrievedAt: '2024-01-05T12:00:00Z',
    },
    {
      evidenceId: 'ev-5',
      url: 'https://github.com/careers/backend-engineer-collaboration',
      sourceType: 'jobs',
      excerpt: 'We are hiring backend engineers specifically for real-time collaboration infrastructure using operational transform',
      retrievedAt: '2024-01-12T09:00:00Z',
    },
    {
      evidenceId: 'ev-6',
      url: 'https://docs.codesandbox.io/collaboration',
      sourceType: 'docs',
      excerpt: 'Documentation for our new collaboration features, including real-time cursor sync and conflict resolution',
      retrievedAt: '2024-01-18T11:00:00Z',
    },
  ],
  evidenceSummary: {
    totalCitations: 6,
    evidenceTypesPresent: ['changelog', 'reviews', 'pricing', 'jobs', 'docs'],
  },
  scores: {
    total: 82,
    drivers: [
      {
        key: 'evidence_coverage',
        label: 'Evidence Coverage',
        weight: 0.4,
        value: 0.85,
        rationale: 'Strong evidence across multiple competitor sources',
        citationsUsed: ['ev-1', 'ev-2', 'ev-3'],
      },
      {
        key: 'market_timing',
        label: 'Market Timing',
        weight: 0.3,
        value: 0.78,
        rationale: 'Recent competitor launches indicate market readiness',
        citationsUsed: ['ev-1', 'ev-2'],
      },
      {
        key: 'user_demand',
        label: 'User Demand',
        weight: 0.3,
        value: 0.82,
        rationale: 'Clear user requests in reviews and job postings',
        citationsUsed: ['ev-3', 'ev-5'],
      },
    ],
  },
  whyThisRanks: [
    'Strong evidence from recent competitor launches',
    'Clear user demand signals in reviews',
    'High market timing score with recent activity',
  ],
  assumptions: [
    'Assumes teams want synchronous collaboration over async workflows',
    'Assumes infrastructure can handle real-time sync at scale',
  ],
  confidence: 'investment_ready',
  schema_version: OPPORTUNITY_V1_SCHEMA_VERSION,
}

/**
 * Opportunity with missing optional fields
 * - Missing excerpt in some citations
 * - Missing retrievedAt in some citations
 * - Missing risks (empty array)
 * - Has assumptions
 */
export const opportunity_missing_optional: OpportunityV1 = {
  id: 'qa-fixture-missing-optional',
  title: 'Implement dark mode as default theme option',
  jtbd: {
    job: 'Reduce eye strain during long coding sessions',
    context: 'Users work in low-light environments and prefer dark interfaces',
  },
  forWhom: 'Professional developers working extended hours',
  whyCompetitorsMissIt: 'Most competitors offer dark mode but only as an option, not as the default for professional workflows',
  recommendation: {
    whatToDo: 'Set dark mode as the default theme with easy toggle option',
    whyNow: 'Recent accessibility guidelines recommend dark mode defaults for developer tools',
    expectedImpact: 'Reduces eye strain complaints and aligns with industry best practices',
    risks: [],
  },
  citations: [
    {
      evidenceId: 'ev-7',
      url: 'https://example.com/pricing',
      sourceType: 'pricing',
      excerpt: 'Dark mode is available as a premium feature',
    },
    {
      evidenceId: 'ev-8',
      url: 'https://example.com/changelog',
      sourceType: 'changelog',
      excerpt: 'We added dark mode support based on user feedback',
      retrievedAt: '2024-01-10T10:00:00Z',
    },
    {
      evidenceId: 'ev-9',
      url: 'https://example.com/docs',
      sourceType: 'docs',
      excerpt: 'Documentation for dark mode configuration',
    },
  ],
  evidenceSummary: {
    totalCitations: 3,
    evidenceTypesPresent: ['pricing', 'changelog', 'docs'],
  },
  scores: {
    total: 65,
    drivers: [
      {
        key: 'evidence_coverage',
        label: 'Evidence Coverage',
        weight: 0.4,
        value: 0.65,
        rationale: 'Moderate evidence from competitor sources',
        citationsUsed: ['ev-7', 'ev-8'],
      },
    ],
  },
  whyThisRanks: [
    'User feedback consistently requests dark mode defaults',
  ],
  assumptions: [
    'Assumes users will prefer dark mode as default',
    'Assumes accessibility guidelines align with user preferences',
  ],
  confidence: 'directional',
  schema_version: OPPORTUNITY_V1_SCHEMA_VERSION,
}

/**
 * Thin evidence opportunity
 * - Exactly 3 citations (minimum)
 * - Only 2 types (triggers "thin evidence" callout)
 */
export const opportunity_thin_evidence: OpportunityV1 = {
  id: 'qa-fixture-thin-evidence',
  title: 'Add keyboard shortcut customization',
  jtbd: {
    job: 'Increase productivity through custom keyboard shortcuts',
    context: 'Power users want to customize shortcuts to match their workflow preferences',
  },
  forWhom: 'Power users and keyboard-focused developers',
  whyCompetitorsMissIt: 'Most competitors offer fixed shortcut schemes without customization options',
  recommendation: {
    whatToDo: 'Build a keyboard shortcut customization interface with conflict detection',
    whyNow: 'User reviews show growing demand for customization features',
    expectedImpact: 'Increases power user satisfaction and productivity',
    risks: [
      'Risk of shortcut conflicts may create confusion',
    ],
  },
  citations: [
    {
      evidenceId: 'ev-10',
      url: 'https://example.com/reviews',
      sourceType: 'reviews',
      excerpt: 'Users request keyboard shortcut customization options',
      retrievedAt: '2024-01-15T10:00:00Z',
    },
    {
      evidenceId: 'ev-11',
      url: 'https://example.com/changelog',
      sourceType: 'changelog',
      excerpt: 'Added keyboard shortcut customization feature',
      retrievedAt: '2024-01-16T11:00:00Z',
    },
    {
      evidenceId: 'ev-12',
      url: 'https://example.com/more-reviews',
      sourceType: 'reviews',
      excerpt: 'Keyboard customization would improve workflow',
    },
  ],
  evidenceSummary: {
    totalCitations: 3,
    evidenceTypesPresent: ['reviews', 'changelog'],
  },
  scores: {
    total: 55,
    drivers: [
      {
        key: 'evidence_coverage',
        label: 'Evidence Coverage',
        weight: 0.4,
        value: 0.55,
        rationale: 'Limited evidence from reviews only',
        citationsUsed: ['ev-10', 'ev-11', 'ev-12'],
      },
    ],
  },
  whyThisRanks: [],
  assumptions: [
    'Assumes power users will adopt customization features',
  ],
  confidence: 'exploratory',
  schema_version: OPPORTUNITY_V1_SCHEMA_VERSION,
}

/**
 * Empty opportunities array
 * Used to test empty state rendering
 */
export const opportunities_empty: OpportunityV1[] = []

/**
 * All fixtures organized by scenario
 */
export const qaFixtures = {
  opportunity_full,
  opportunity_missing_optional,
  opportunity_thin_evidence,
  opportunities_empty,
}

/**
 * Scenario definitions for QA dashboard
 */
export interface QAScenario {
  id: string
  label: string
  description: string
  opportunities: OpportunityV1[]
}

export const qaScenarios: QAScenario[] = [
  {
    id: 'full',
    label: 'Full Opportunity',
    description: 'Complete opportunity with all fields, 6 citations across 4 types',
    opportunities: [opportunity_full],
  },
  {
    id: 'missing-optional',
    label: 'Missing Optional Fields',
    description: 'Opportunity with missing excerpt/retrievedAt in some citations, empty risks',
    opportunities: [opportunity_missing_optional],
  },
  {
    id: 'thin-evidence',
    label: 'Thin Evidence',
    description: 'Exactly 3 citations across 2 types (triggers thin evidence callout)',
    opportunities: [opportunity_thin_evidence],
  },
  {
    id: 'empty',
    label: 'Empty State',
    description: 'No opportunities (tests empty state rendering)',
    opportunities: opportunities_empty,
  },
]

