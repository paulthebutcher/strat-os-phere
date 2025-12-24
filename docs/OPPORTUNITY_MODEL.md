# Opportunity Model

**Purpose**: Defines the canonical Opportunity artifact for Plinth. This is the single source of truth for what an Opportunity is, what it contains, and how it should be evaluated.

**Status**: Canonical reference model

**When to read this**: Read this when:
- Building or modifying opportunity generation pipelines
- Scoring or evaluating opportunities
- Designing UI components that display opportunities
- Mapping existing artifacts to the canonical shape

**Related docs**:
- [reference/Schemas.md](./reference/Schemas.md) - Technical schema definitions
- [00-overview/02-core-entities.md](./00-overview/02-core-entities.md) - System context
- [../strat-os-phere/docs/RESULTS_V2.md](../strat-os-phere/docs/RESULTS_V2.md) - Generation pipeline

---

## Overview

An Opportunity is a **strategic bet** that synthesizes competitive analysis, market signals, and customer insights into an actionable recommendation. It answers: "What should we build or change, why now, and how do we know it's defensible?"

This artifact is the **acceptance target** for scoring, claims, and synthesis. Pipelines must converge on this shape.

## Canonical Opportunity Object

### Required Fields

```typescript
{
  id: string                    // Stable identifier (slug-like, derived from title + project context)
  title: string                 // Clear strategic bet (6-10 words, non-buzzword)
  problem_statement: string     // JTBD-framed problem description
  proposed_action: string       // What to do (specific, executable)
  why_now: string              // Market signal summary (what changed recently)
  evidence_summary: string     // Human-readable evidence narrative
  citations: Citation[]        // Source URLs with metadata
  confidence: {
    coverage_score: number     // 0-100: How well evidence covers the opportunity
    evidence_strength: number  // 0-100: Quality and recency of evidence
  }
  risks_and_assumptions: string[] // What could go wrong or what we're assuming
  competitors_impacted: string[]  // Competitor names/domains affected
  last_updated: string         // ISO 8601 timestamp
}
```

### Field Descriptions

#### `id`
- **Type**: `string`
- **Format**: Stable slug-like identifier
- **Purpose**: Unique identifier that persists across runs for the same opportunity
- **Example**: `"real-time-collaboration-editors"`

#### `title`
- **Type**: `string`
- **Length**: 6-10 words
- **Style**: Clear, specific, non-buzzword-y
- **Purpose**: Executive summary that communicates the strategic bet
- **Good**: "Add real-time collaboration to code editors"
- **Bad**: "Leverage best-in-class collaborative experiences to delight users"

#### `problem_statement`
- **Type**: `string`
- **Format**: Jobs-to-Be-Done (JTBD) framed
- **Purpose**: Describes the customer job that isn't being done well
- **Example**: "When developers need to pair program or review code together, they struggle to see changes in real-time and must rely on screen sharing or async comments, which slows down decision-making."

#### `proposed_action`
- **Type**: `string`
- **Style**: Specific, executable, not aspirational
- **Purpose**: What to build or change
- **Example**: "Build a real-time collaborative editing feature that shows live cursors, edits, and comments synchronized across all participants."

#### `why_now`
- **Type**: `string`
- **Format**: Market signal summary
- **Purpose**: Explains what changed recently that makes this opportunity timely
- **Example**: "Three major competitors launched collaborative features in the last 90 days, and user reviews show 40% of teams are actively seeking this capability."

#### `evidence_summary`
- **Type**: `string`
- **Format**: Human-readable narrative
- **Purpose**: Synthesizes evidence into a coherent story that supports the opportunity
- **Example**: "Analysis of competitor changelogs, pricing pages, and user reviews shows a clear trend toward real-time collaboration. 12 of 15 competitors now offer this feature, and review sentiment indicates strong demand among teams of 5+ developers."

#### `citations`
- **Type**: `Citation[]`
- **Format**: Array of citation objects with URL, title, source type, etc.
- **Minimum**: 2 citations required
- **Purpose**: Provides traceability to source evidence
- **Structure**: See [Citation Schema](#citation-schema)

#### `confidence`
- **Type**: Object with `coverage_score` and `evidence_strength`
- **Range**: 0-100 for both scores
- **Purpose**: Quantifies how well-supported the opportunity is
- **coverage_score**: How comprehensively evidence covers the opportunity (are there gaps?)
- **evidence_strength**: Quality, recency, and consensus of evidence

#### `risks_and_assumptions`
- **Type**: `string[]`
- **Format**: Array of risk/assumption statements
- **Purpose**: Surfaces what could go wrong or what we're assuming
- **Example**: ["Assumes teams want synchronous collaboration over async", "Risk: May conflict with existing workflow tools", "Assumes infrastructure can handle real-time sync at scale"]

#### `competitors_impacted`
- **Type**: `string[]`
- **Format**: Array of competitor names or domains
- **Purpose**: Identifies which competitors this opportunity addresses
- **Example**: ["github.com", "gitlab.com", "bitbucket.org"]

#### `last_updated`
- **Type**: `string`
- **Format**: ISO 8601 timestamp
- **Purpose**: Tracks when the opportunity was last generated or updated
- **Example**: "2024-01-15T10:30:00Z"

### Citation Schema

```typescript
{
  url: string                    // Source URL
  title?: string                 // Page title
  source_type: string           // 'marketing_site' | 'changelog' | 'pricing' | 'reviews' | 'jobs' | 'docs' | 'status'
  published_at?: string          // ISO date string
  source_kind?: string          // 'first_party' | 'third_party' | 'unknown'
  domain?: string               // Domain name
}
```

## What Makes a "Strong" vs "Weak" Opportunity

### Strong Opportunity

- **Specific and actionable**: Clear what to build, not vague or aspirational
- **Well-evidenced**: 3+ citations from recent, credible sources
- **Defensible**: Explains why competitors can't easily copy
- **Timely**: `why_now` points to recent market changes
- **High confidence**: Both `coverage_score` and `evidence_strength` > 70
- **Clear problem**: `problem_statement` is JTBD-framed and specific
- **Realistic risks**: `risks_and_assumptions` are concrete and addressable

### Weak Opportunity

- **Vague or buzzword-y**: Uses terms like "leverage", "enhance", "delight", "best-in-class"
- **Thin evidence**: < 2 citations or citations are stale (> 6 months old)
- **Low confidence**: Either `coverage_score` or `evidence_strength` < 50
- **Generic problem**: Problem statement is too broad or not customer-focused
- **Aspirational action**: Proposed action is "we can move faster" rather than structural
- **Missing context**: `why_now` doesn't reference recent signals
- **Unclear risks**: Risks are generic or not addressable

## Explicit Non-Goals

The Opportunity model explicitly **does not include**:

- ❌ **Forecasts**: No revenue projections, market size estimates, or growth predictions
- ❌ **Internal data**: No user analytics, conversion rates, or proprietary metrics
- ❌ **Implementation details**: No technical architecture, API specs, or code
- ❌ **Timeline estimates**: No "this will take 3 months" or sprint planning
- ❌ **Resource requirements**: No headcount, budget, or team assignments
- ❌ **Success metrics**: No KPIs, OKRs, or measurement frameworks (those belong in experiments)

The Opportunity is a **strategic artifact**, not a product spec or project plan.

## Usage

### For Pipeline Developers

When generating opportunities:

1. **Converge on this shape**: All opportunity generation pipelines must output this exact structure
2. **Score against this model**: Use the "strong vs weak" criteria to evaluate quality
3. **Map existing artifacts**: Transform `opportunities_v2`, `opportunities_v3`, or other formats to this canonical shape

### For UI Developers

When rendering opportunities:

1. **Use this as the data contract**: All opportunity components should accept this shape
2. **Display all required fields**: Don't hide or omit fields (they're all important)
3. **Respect confidence scores**: Use `coverage_score` and `evidence_strength` to indicate trustworthiness

### For Scoring Systems

When scoring opportunities:

1. **Compute confidence scores**: `coverage_score` and `evidence_strength` should be deterministic
2. **Validate against criteria**: Check for "strong" vs "weak" indicators
3. **Surface quality signals**: Flag opportunities that don't meet quality thresholds

## Example

See [examples/sample_opportunity.json](./examples/sample_opportunity.json) for a complete, exec-ready example.

## Reference UI Component

A read-only reference component is available at `components/opportunities/SampleOpportunityPreview.tsx` that renders the sample opportunity. This component:

- Displays all required fields from the canonical model
- Uses no hooks or server calls (static reference only)
- Demonstrates the expected UI presentation
- Can be used for design alignment and reference

**Note**: This component is for reference only. It does not wire into production flows or fetch live data.

## Future Considerations

This model is **stable and boring** by design. It should not change frequently. If you need to extend it:

1. **Consider if it belongs**: Does the new field fit the "strategic artifact" scope?
2. **Check non-goals**: Is it explicitly excluded?
3. **Maintain backward compatibility**: Can existing opportunities still be valid?

When in doubt, keep it simple. The Opportunity model should remain focused on answering: "What should we do, why now, and how do we know?"

