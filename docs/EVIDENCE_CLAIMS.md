# Evidence Claims & Follow-up Questions

This document describes the claim-centric evidence system and smart follow-up question feature.

## Overview

The evidence claims system extracts structured claims from harvested evidence bundles and groups citations by claim (rather than by source). This provides a more actionable view of the evidence.

The follow-up question system asks at most one optional clarifying question after evidence harvest completes, based on uncertainty, gaps, or conflicts in the evidence.

## Feature Flags

Both features are behind feature flags for gradual rollout:

- `CLAIMS_ENABLED`: Enables claim extraction and the claims drawer UI
- `FOLLOWUP_ENABLED`: Enables follow-up question generation and UI

To enable locally, set in your `.env.local`:

```bash
CLAIMS_ENABLED=true
FOLLOWUP_ENABLED=true
```

## Claims System

### What are Claims?

Claims are concise, specific statements extracted from evidence, grouped by category (pricing, docs, reviews, jobs, changelog, status, marketing, other). Each claim includes:

- **Statement**: A concise, specific claim extracted from evidence
- **Category**: The type of evidence (pricing, docs, reviews, etc.)
- **Support**: Strength of support (strong, medium, weak)
  - Strong: 2+ citations across distinct URLs OR first-party + third-party corroboration
  - Medium: 1 citation but from first-party
  - Weak: Otherwise
- **Recency**: Days since the evidence was published/retrieved
- **Citations**: Array of citations supporting the claim
- **Conflicts**: Optional conflicting signals

### Claim Extraction

Claims are extracted deterministically using heuristics (no LLM required):

- **Pricing**: Extracts plan names, limits, "per seat", "starting at", "billed annually", "contact sales"
- **Reviews**: Extracts recurring complaints/praise phrases (sentences containing "too", "hard", "slow", "expensive", "support", "onboarding", "bug")
- **Jobs**: Extracts required skills/roles, "enterprise", "SOC2", "SSO"
- **Changelog**: Extracts feature verbs + dates, "added", "launched", "improved", "deprecated"
- **Status**: Extracts uptime, incidents, "degraded", "partial outage"
- **Docs**: Extracts integration lists, auth, API, SSO, RBAC

Claims are deduplicated using Jaccard similarity and limited to 25 total claims.

### API

**POST /api/claims/generate**

Generates claims from the latest evidence bundle for a project.

Request body:
```json
{
  "projectId": "string",
  "competitorId": "string (optional)"
}
```

Response:
```json
{
  "schema_version": 1,
  "meta": {
    "generatedAt": "ISO string",
    "company": "string (optional)",
    "evidenceWindowDays": "number (optional)",
    "sourceCountsByType": {}
  },
  "claims": [...]
}
```

### UI

The claims drawer is accessible from the Evidence & Confidence panel in the Opportunities view. Click "View key claims (n)" to open the drawer.

The drawer shows claims grouped by category, with support badges, recency badges, and citation lists.

## Follow-up Questions

### What are Follow-up Questions?

Follow-up questions are optional clarifying questions asked after evidence harvest completes (or after Generate Analysis). They help address uncertainty, gaps, or conflicts in the evidence.

### Question Generation

Questions are generated deterministically based on:

1. **Conflicts**: Pricing evidence suggests both enterprise-only and public pricing
2. **Gaps**: Missing evidence types (pricing, reviews, etc.) or limited evidence (< 10 sources)
3. **Low Confidence**: Many claims have weak support

At most one question is generated, prioritized: conflicts > gaps > low confidence.

### Question Types

- **Single Select**: Multiple choice options
- **Free Text**: Open-ended textarea

### Storage

Follow-up answers are stored as artifacts with type `followup_v1`. They are non-breaking and optional - the app works without them.

### Integration

Follow-up answers are included in the next generation run as "Decision context clarifier" in the prompt. If no answer exists, nothing is added.

### UI

The follow-up question card appears after analysis completes, showing:
- Question text
- Rationale (why we're asking)
- Input (single select or free text)
- "Apply" and "Skip" buttons

After applying, a confirmation message is shown: "Applied. Next run will incorporate this."

## Implementation Notes

- All features are additive and non-breaking
- No database migrations required (uses existing artifacts table)
- Feature flags default to `false` for safe rollout
- Deterministic extraction (no LLM) for performance and cost
- Claims are cached in component state (don't refetch on every open)

## Testing

Unit tests are available in:
- `tests/unit/claimsExtract.test.ts` - Claim extraction tests
- `tests/unit/followupGenerate.test.ts` - Follow-up question generation tests

Integration tests:
- `tests/integration/claimsApi.test.ts` - API route tests (to be added)

