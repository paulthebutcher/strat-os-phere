# Reasoning Model

**Purpose**: Defines Plinth's reasoning contract: how raw evidence becomes claims, and claims become strategic bets. This is a strict, conservative framework that prevents hallucination and over-claiming.

**When to read this**: Read this to understand:
- The logical flow from evidence to strategic recommendations
- What claims are valid and what must be rejected
- How the system ensures non-hallucinatory reasoning
- The guardrails that prevent over-claiming

**Related docs**:
- [OPPORTUNITY_MODEL.md](./OPPORTUNITY_MODEL.md) - How claims justify Opportunity artifact fields
- [00-overview/02-core-entities.md](./00-overview/02-core-entities.md) - Evidence sources data structure
- [principles/SystemInvariants.md](./principles/SystemInvariants.md) - System invariants that enforce this contract
- [../strat-os-phere/docs/guards/GUARDRAILS.md](../strat-os-phere/docs/guards/GUARDRAILS.md) - Implementation guardrails

---

## Overview

Plinth's reasoning follows a strict three-layer hierarchy:

1. **Evidence** (raw, immutable facts from the web)
2. **Claims** (falsifiable statements supported by evidence)
3. **Strategic Bets** (aggregated claims tied to JTBD/unmet needs)

Each layer has explicit rules about what it may contain, how it's validated, and when it must be rejected.

**Core principle**: Prefer under-claiming to over-claiming. When evidence is insufficient, the system must reject rather than infer.

---

## Layer 1: Evidence

### Definition

Evidence is raw, unaltered content harvested from the web. Evidence is **never invented, never inferred, never modified**.

### Structure

Evidence comes **ONLY** from the `evidence_sources` table and has the following required fields:

```typescript
{
  id: string                    // Unique identifier
  project_id: string           // Project context
  competitor_id?: string       // Optional competitor linkage
  source_type: string          // 'marketing_site' | 'changelog' | 'pricing' | 'reviews' | 'jobs' | 'docs' | 'status'
  url: string                  // Full URL of source page
  extracted_text: string       // Cleaned text content (max 12,000 chars)
  extracted_at: string         // ISO 8601 timestamp when content was extracted
  domain?: string              // Domain name for grouping
  page_title?: string          // Extracted page title
  source_confidence?: string   // Optional confidence indicator
}
```

### Properties

- **Immutable**: Evidence is never altered after extraction
- **Traceable**: Every evidence record has a URL that can be verified
- **Timestamped**: `extracted_at` records when evidence was collected
- **Source-typed**: `source_type` categorizes the evidence origin

### What Evidence May Contain

- ✅ Extracted text from web pages
- ✅ Normalized URLs (UTM params stripped, hostnames normalized)
- ✅ Page titles and metadata
- ✅ Extraction timestamps

### What Evidence May NOT Contain

- ❌ Summaries or interpretations (those become claims)
- ❌ Inferred dates or metadata not present on the page
- ❌ Claims or conclusions (evidence is raw material)
- ❌ Cross-references or relationships (those are claim-level)

### Evidence Operations

Evidence can be:
- ✅ **Harvested**: Fetched from URLs and extracted to text
- ✅ **Stored**: Saved to `evidence_sources` table
- ✅ **Queried**: Retrieved by project, competitor, source_type, or date range
- ✅ **Summarized**: Text can be summarized for LLM prompts (but original is preserved)

Evidence cannot be:
- ❌ **Altered**: Original `extracted_text` is never modified
- ❌ **Invented**: All evidence must come from real URLs
- ❌ **Inferred**: Missing fields are null, not guessed

---

## Layer 2: Claim

### Definition

A claim is a **specific, falsifiable statement** that:
- Is supported by ≥ N evidence sources (threshold defined below)
- Is scoped to a competitor or market pattern
- Can be verified or disproven by examining the evidence

### Claim Structure

A claim has this structure:

```typescript
{
  statement: string             // The falsifiable claim (e.g., "Competitor X offers feature Y")
  evidence_source_ids: string[] // Array of evidence_sources.id that support this claim
  citations: Citation[]         // URL references to evidence sources
  scope: 'competitor' | 'market_pattern' | 'trend'
  competitor_id?: string        // If scope is 'competitor'
  support_strength: 'strong' | 'medium' | 'weak'
  recency: string              // ISO 8601 timestamp of most recent evidence
}
```

### Required Evidence Threshold

A claim requires **≥ 2 distinct evidence sources** OR **1 first-party evidence source** to be valid.

**Support strength classification**:
- **Strong**: ≥ 2 distinct evidence sources (any mix of first-party/third-party)
- **Strong**: 1 first-party evidence source (competitor's own site)
- **Medium**: 1 third-party evidence source (reviews, third-party analysis)
- **Weak**: Single source, ambiguous or low-confidence evidence

Claims with "weak" support strength must be flagged and may be rejected in downstream reasoning.

### Valid Claims

A claim is valid if it:

1. ✅ **States observable facts**: "Competitor X lists feature Y on their pricing page"
2. ✅ **Is falsifiable**: Can be verified by visiting the cited URLs
3. ✅ **Has sufficient evidence**: Meets evidence threshold (≥ 2 sources or 1 first-party)
4. ✅ **Is scoped appropriately**: Clearly about a competitor or market pattern
5. ✅ **Is time-bounded**: References evidence from a specific time period

**Examples of valid claims**:
- "As of January 2024, Competitor X's pricing page lists 'Feature Y' in their Pro plan"
- "User reviews from December 2023 indicate that Competitor X lacks feature Z"
- "Competitor X's changelog shows they added feature Y on November 15, 2023"

### Disallowed Claims

A claim is **disallowed** if it:

1. ❌ **Is an opinion**: "Competitor X's feature is better than Competitor Y's"
2. ❌ **Is a prediction**: "Competitor X will likely add feature Y next quarter"
3. ❌ **Infers intent**: "Competitor X is trying to compete with Competitor Y"
4. ❌ **Is an internal guess**: "Competitor X probably has feature Y based on their positioning"
5. ❌ **Lacks evidence**: No citations or insufficient evidence sources
6. ❌ **Is unverifiable**: Cannot be checked by visiting the cited URLs
7. ❌ **Is too vague**: "Competitor X has good features" (not specific enough)

**Examples of disallowed claims**:
- "Competitor X's approach is superior" (opinion)
- "Competitor X will likely pivot to focus on enterprise" (prediction)
- "Competitor X seems to be targeting the same market" (inference of intent)
- "Competitor X probably has feature Y because similar tools have it" (internal guess)

### Claim Operations

Claims can be:
- ✅ **Extracted**: Derived from evidence by clustering related evidence sources
- ✅ **Deduplicated**: Merged if multiple evidence sources support the same claim
- ✅ **Scored**: Support strength and recency computed from evidence
- ✅ **Validated**: Checked against evidence threshold and disallowed patterns

Claims cannot be:
- ❌ **Invented**: Must have at least one evidence source
- ❌ **Inferred**: Cannot guess what competitors might do or think
- ❌ **Synthesized without evidence**: Cannot combine claims into new claims without new evidence

---

## Layer 3: Strategic Bet

### Definition

A strategic bet is a **commitment-ready decision** that:
- Aggregates multiple claims
- Ties to a JTBD (Job-to-be-Done) or unmet need
- Explicitly lists assumptions
- Identifies structural defensibility (not aspirational)

### Strategic Bet Structure

A strategic bet has this structure:

```typescript
{
  id: string
  title: string                 // Specific, non-buzzword-y (6-10 words)
  summary: string              // 2-3 sentence plain-English description
  opportunity_source_ids: string[] // References to Opportunity/JTBD IDs
  supporting_claims: string[]   // References to claim IDs or claim statements
  what_we_say_no_to: string[]  // Explicit deprioritized directions
  forced_capabilities: string[] // Required capabilities/systems/org muscles
  why_competitors_wont_follow: string[] // Structural, economic, or organizational friction
  first_real_world_proof: string // Behavioral test with timeframe
  invalidation_signals: string[] // What evidence would prove this bet wrong
  assumptions: string[]        // Explicit assumptions underlying the bet
  confidence_score: number     // 0-100 derived from claim strength and coverage
}
```

### What Makes a Valid Strategic Bet

A strategic bet is valid if it:

1. ✅ **Aggregates multiple claims**: Synthesizes 3+ distinct claims into a coherent bet
2. ✅ **Ties to JTBD**: Connects to a specific customer job or unmet need
3. ✅ **Lists explicit assumptions**: States what must be true for the bet to succeed
4. ✅ **Is structurally defensible**: Competitor constraints are structural (pricing model, customer segments, architecture), not aspirational ("we can move faster")
5. ✅ **Has behavioral proof**: First validation is behavioral and testable in 2-4 weeks
6. ✅ **Is mutually exclusive**: Choosing this bet means deprioritizing alternatives
7. ✅ **Requires real sacrifice**: Involves saying no to specific directions or customers

### What Strategic Bets Are NOT

Strategic bets are **not**:
- ❌ **Opportunities**: Opportunities are inputs; bets are commitment-ready outputs
- ❌ **Ideas**: Bets force tradeoffs; ideas can coexist
- ❌ **Predictions**: Bets are commitments under constraint, not forecasts
- ❌ **Generic recommendations**: Bets are opinionated and uncomfortable (in a good way)
- ❌ **Research or planning**: First proof must be behavioral, not research

### Strategic Bet Operations

Strategic bets can be:
- ✅ **Synthesized**: Created by aggregating claims and opportunities
- ✅ **Ranked**: Scored by confidence, claim strength, and strategic fit
- ✅ **Validated**: Checked against banned patterns and quality criteria

Strategic bets cannot be:
- ❌ **Invented without claims**: Must be supported by aggregated claims
- ❌ **Inferred from opportunities alone**: Must synthesize claims, not just opportunities
- ❌ **Created without assumptions**: Must explicitly list what must be true

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         EVIDENCE LAYER                          │
│                                                                 │
│  evidence_sources (table)                                       │
│  ├─ source_type: 'marketing_site' | 'changelog' | 'pricing'... │
│  ├─ url: "https://competitor.com/pricing"                       │
│  ├─ extracted_text: "Pro plan includes feature X..."           │
│  └─ extracted_at: "2024-01-15T10:30:00Z"                       │
│                                                                 │
│  Operations:                                                    │
│  ✅ Harvest, Store, Query, Summarize                            │
│  ❌ Alter, Invent, Infer                                        │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Extract & Validate
                            │ (≥2 sources OR 1 first-party)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                          CLAIM LAYER                            │
│                                                                 │
│  Claim:                                                        │
│  ├─ statement: "Competitor X offers feature Y (as of Jan 2024)" │
│  ├─ evidence_source_ids: ["id1", "id2"]                        │
│  ├─ citations: [{url: "...", source_type: "pricing", ...}]     │
│  ├─ scope: 'competitor'                                         │
│  ├─ support_strength: 'strong' | 'medium' | 'weak'             │
│  └─ recency: "2024-01-15T10:30:00Z"                            │
│                                                                 │
│  Validation:                                                    │
│  ✅ Observable, Falsifiable, Sufficient Evidence                │
│  ❌ Opinions, Predictions, Intent Inference                     │
│                                                                 │
│  Confidence Computation:                                        │
│  - Support strength (strong/medium/weak)                        │
│  - Evidence recency (decay factor)                              │
│  - Source diversity (first-party vs third-party mix)            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Aggregate & Synthesize
                            │ (3+ claims + JTBD connection)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STRATEGIC BET LAYER                        │
│                                                                 │
│  Strategic Bet:                                                │
│  ├─ title: "Add real-time collaboration to code editors"       │
│  ├─ supporting_claims: ["claim_id_1", "claim_id_2", ...]      │
│  ├─ opportunity_source_ids: ["jtbd_id_1", "opportunity_id_2"] │
│  ├─ assumptions: ["Teams want sync over async", ...]           │
│  ├─ why_competitors_wont_follow: ["Pricing model conflict", ..]│
│  └─ confidence_score: 0-100 (computed from claims)             │
│                                                                 │
│  Validation:                                                    │
│  ✅ Multiple Claims, JTBD Connection, Structural Defensibility │
│  ❌ Generic Recommendations, Aspirational Defensibility         │
│                                                                 │
│  Coverage Computation:                                          │
│  - Number of distinct claims aggregated                         │
│  - Claim support strength distribution                          │
│  - Evidence recency across all supporting claims                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Maps to Opportunity Fields
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     OPPORTUNITY ARTIFACT                        │
│                  (see OPPORTUNITY_MODEL.md)                     │
│                                                                 │
│  Claims justify:                                                │
│  ├─ proof_points[] ← Derived from claims                        │
│  ├─ citations[] ← Aggregated from claim citations              │
│  ├─ confidence.coverage_score ← Claim count & diversity        │
│  ├─ confidence.evidence_strength ← Claim support strength      │
│  ├─ problem_today ← Synthesized from competitor claims         │
│  └─ why_now ← Market pattern claims (trends, recent changes)   │
└─────────────────────────────────────────────────────────────────┘
```

**Where confidence and coverage are computed**:
- **Confidence**: Computed at claim level (support strength, recency) and strategic bet level (aggregated claim quality)
- **Coverage**: Computed by counting distinct evidence sources, source types, and competitors covered by claims

---

## Guardrails

### What the LLM MAY Do

The LLM is permitted to:

1. ✅ **Summarize evidence**: Create concise summaries of `extracted_text` for prompts
2. ✅ **Cluster evidence**: Group related evidence sources that support the same claim
3. ✅ **Extract claims**: Derive falsifiable statements from evidence clusters
4. ✅ **Rank claims**: Prioritize claims by support strength and recency
5. ✅ **Aggregate claims**: Combine multiple claims into strategic bets
6. ✅ **Score confidence**: Compute confidence based on evidence quality metrics
7. ✅ **Identify gaps**: Flag when evidence is insufficient for a claim

### What the LLM MAY NOT Do

The LLM is **strictly forbidden** from:

1. ❌ **Inventing facts**: Cannot create claims without supporting evidence sources
2. ❌ **Inferring intent**: Cannot guess what competitors are "trying to do" or "planning"
3. ❌ **Predicting outcomes**: Cannot forecast future behavior or market changes
4. ❌ **Making opinions**: Cannot state that one approach is "better" than another
5. ❌ **Creating citations**: All citations must reference real URLs from `evidence_sources`
6. ❌ **Altering evidence**: Cannot modify `extracted_text` or invent metadata
7. ❌ **Inferring missing data**: Cannot guess missing fields (they remain null)
8. ❌ **Synthesizing without evidence**: Cannot create new claims by combining existing claims without new evidence

### Enforcement

These guardrails are enforced through:

- **Schema validation**: Claims and bets must include `evidence_source_ids` arrays
- **Citation validation**: All citations are validated against allowed URLs from evidence bundles
- **Banned pattern detection**: LLM outputs are scanned for disallowed language patterns
- **Evidence threshold checks**: Claims are rejected if they don't meet evidence requirements
- **Support strength computation**: Claims are classified as strong/medium/weak and weak claims may be rejected

See [SystemInvariants.md](./principles/SystemInvariants.md) for implementation details of these enforcement mechanisms.

---

## Rejection Rules

The system **must reject** and return explicit error messages in these cases:

### "Not Enough Evidence"

**Trigger**: When attempting to create a claim or strategic bet

**Conditions**:
- Claim requires ≥ 2 evidence sources but has < 2
- Claim requires 1 first-party source but has 0
- Strategic bet requires 3+ claims but has < 3
- Strategic bet has insufficient claim diversity (all from same competitor or source type)

**Error message**: "Not enough evidence: This claim requires at least 2 distinct evidence sources (or 1 first-party source). Found [N] sources."

**User action**: System should guide user to add more evidence sources or wait for evidence harvest to complete.

### "Weak Signal"

**Trigger**: When evidence exists but is insufficient for confident claims

**Conditions**:
- Claim has only 1 third-party evidence source (weak support strength)
- Evidence is stale (older than evidence TTL threshold, typically 90 days)
- Evidence sources are all low-confidence or ambiguous
- Strategic bet aggregates only weak-support claims

**Error message**: "Weak signal: Evidence exists but is insufficient for confident claims. Need fresher evidence or additional sources."

**User action**: System should suggest refreshing evidence or adding more source types.

### "Cannot Rank Yet"

**Trigger**: When strategic bets cannot be ranked due to insufficient coverage

**Conditions**:
- Strategic bets exist but have insufficient confidence scores (< threshold, typically 50)
- Coverage is too low (fewer than 3 competitors or 2 source types covered)
- Claims are too similar (lack diversity needed for meaningful ranking)
- Evidence recency decay factor is too low (< 0.5)

**Error message**: "Cannot rank yet: Insufficient evidence coverage. Need evidence for at least [N] competitors and [M] source types to rank strategic bets."

**User action**: System should show evidence coverage dashboard and guide user to add missing evidence.

### Rejection Flow

```
User Action → Validate Evidence → Check Thresholds
     │                │                  │
     │                │                  ├─ Threshold Met → Proceed
     │                │                  │
     │                │                  └─ Threshold Not Met → Reject
     │                │
     │                └─ Evidence Invalid → Reject ("Not Enough Evidence")
     │
     └─ Action Invalid → Reject (Schema/Validation Error)
```

**Important**: Rejections should be **explicit and actionable**. The system must tell users:
1. What's missing
2. Why it's insufficient
3. What they can do to fix it

---

## Relationship to Opportunity Model

**Claims exist to justify fields in the Opportunity artifact.**

See [OPPORTUNITY_MODEL.md](./OPPORTUNITY_MODEL.md) for the complete Opportunity structure. The mapping is:

### Claim → Opportunity Field Mapping

| Claim Type | Maps to Opportunity Field | Justification |
|------------|---------------------------|---------------|
| Competitor claims (feature X, pricing Y) | `proof_points[]` | Each proof point is a claim with citations |
| Market pattern claims (trends, gaps) | `why_now` | Explains what changed recently |
| Competitor capability claims | `problem_today` | Synthesizes what competitors do/don't do |
| Claim citations | `citations[]` | Aggregated from all supporting claims |
| Claim support strength | `confidence.evidence_strength` | Reflects quality of underlying claims |
| Claim count & diversity | `confidence.coverage_score` | Measures how comprehensively claims cover the opportunity |
| Claim recency | `confidence` scores (via decay) | Fresher claims → higher confidence |

### Example Flow

1. **Evidence**: `evidence_sources` table contains 5 records about Competitor X's pricing
2. **Claim**: "As of Jan 2024, Competitor X charges $99/month for Pro plan" (supported by 3 evidence sources)
3. **Strategic Bet**: "Offer transparent pricing below competitor Pro plans" (aggregates 5 pricing-related claims)
4. **Opportunity**: `proof_points[0]` = "Competitor X charges $99/month for Pro" with citations to the 3 evidence sources

This ensures **traceability**: Every field in an Opportunity can be traced back to specific evidence sources through the claim layer.

---

## Conservative Principles

This reasoning model is designed to be **strict and conservative**:

1. **Prefer under-claiming to over-claiming**: When in doubt, reject rather than infer
2. **Evidence-first**: All claims must trace back to stored evidence
3. **Falsifiability**: Every claim must be verifiable by examining evidence
4. **Explicit thresholds**: Minimum evidence requirements are hard constraints
5. **Rejection over inference**: Better to say "not enough evidence" than to guess

These principles ensure that Plinth's outputs are trustworthy and verifiable, even if it means being conservative about what claims can be made.

---

## Usage

### For Pipeline Developers

When building claim extraction or strategic bet generation:

1. **Validate evidence threshold**: Check that claims meet minimum evidence requirements
2. **Reject disallowed claims**: Filter out opinions, predictions, and intent inferences
3. **Compute support strength**: Classify claims as strong/medium/weak based on evidence
4. **Aggregate conservatively**: Only create strategic bets when sufficient claims exist
5. **Explicitly reject**: Return clear error messages when thresholds aren't met

### For LLM Prompt Engineers

When crafting prompts for claim extraction or strategic bet synthesis:

1. **Provide evidence context**: Include raw evidence text, not summaries (unless for length)
2. **Enforce structure**: Require claims to include `evidence_source_ids` arrays
3. **Ban disallowed patterns**: Explicitly instruct LLM to avoid opinions, predictions, inferences
4. **Require citations**: All claims must cite specific evidence sources
5. **Set minimum thresholds**: Require ≥ 2 evidence sources per claim in prompts

### For UI Developers

When displaying claims or strategic bets:

1. **Show evidence traceability**: Display evidence source links for every claim
2. **Indicate support strength**: Visual indicators for strong/medium/weak claims
3. **Surface rejections**: Show "Not Enough Evidence" messages when applicable
4. **Display confidence**: Show coverage and evidence strength scores
5. **Link to opportunities**: Show how claims map to Opportunity artifact fields

---

## Maintenance

This reasoning model is a **contract**, not implementation details. It should:

- **Change rarely**: This is a foundational contract that should remain stable
- **Be strict**: When in doubt, make it more conservative, not less
- **Guide implementation**: All claim extraction and strategic bet generation code should be evaluated against this contract

If you need to modify this contract:

1. **Justify the change**: Why is the current contract insufficient?
2. **Maintain traceability**: How does the change affect the Evidence → Claim → Bet flow?
3. **Update cross-references**: Update OPPORTUNITY_MODEL.md and related docs
4. **Consider backward compatibility**: Can existing claims/bets still be valid?

When in doubt, keep it strict and conservative. Trust is built through verifiable claims, not through confident guesses.

