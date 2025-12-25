# Results v2 Documentation

## Overview

Results v2 is an enhanced results generation system that produces actionable, differentiated outputs for competitive analysis. It generates three core artifact types:

1. **Jobs To Be Done (JTBD)** - Concrete, testable customer jobs with opportunity scores
2. **Competitive Scorecard** - Weighted scoring matrix evaluating competitors on key criteria
3. **Differentiation Opportunities** - Ranked opportunities with first experiments

Results v2 replaces the previous high-level synthesis with outputs designed to drive product decisions and prioritization.

## Data Model

### Artifact Storage

All Results v2 artifacts are stored in the `artifacts` table:

- **Type**: `jtbd`, `opportunities_v2`, or `scoring_matrix`
- **content_json**: Contains the artifact data with metadata
- **Schema version**: All v2 artifacts include `meta.schema_version = 2`

### Artifact Structure

Each artifact follows this structure:

```typescript
{
  meta: {
    generated_at: string (ISO 8601)
    run_id: string
    schema_version: number (2 for v2)
    model?: string
    signals?: ResultsV2QualitySignals
  },
  // ... artifact-specific content
}
```

**File locations:**
- Schemas: `lib/schemas/jtbd.ts`, `lib/schemas/opportunities.ts`, `lib/schemas/scoring.ts`
- Schema union: `lib/schemas/artifacts.ts`

## Generation Flow

### API Route

The canonical entry point for generating Results v2:

**Endpoint**: `POST /api/results/generate-v2`  
**File**: `app/api/results/generate-v2/route.ts`

**Request body:**
```json
{
  "projectId": "string"
}
```

**Success response:**
```json
{
  "ok": true,
  "runId": "string",
  "artifactIds": ["string", "string", "string"],
  "signals": { ... }
}
```

**Error response:**
```json
{
  "ok": false,
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

### Orchestrator Function

**File**: `lib/results/generateV2.ts`

The generation function (`generateResultsV2`) orchestrates:

1. **Validation**: Checks authentication, project access, competitor count
2. **Input loading**: Loads existing profiles and synthesis artifacts
3. **LLM generation**: Generates JTBD, Scoring Matrix, and Opportunities in sequence
4. **Validation & repair**: Validates with Zod, repairs once on failure
5. **Score computation**: Computes deterministic scores using helper functions
6. **Quality signals**: Computes and stores quality metrics
7. **Artifact storage**: Stores all three artifacts with `schema_version=2`

**Dependencies:**
- Requires existing `profiles` artifact (from `generateAnalysis`)
- Optionally uses `synthesis` artifact for context
- Uses project context (market, target_customer, etc.)

### Zod Validation & Repair

**Strategy:**
1. Parse LLM JSON output with Zod schema
2. On validation failure, call repair prompt with error details
3. Repair once—if still invalid, fail with error
4. Repair prompts: `lib/prompts/repair.ts`

**Repair schema names:**
- `JtbdArtifactContent`
- `OpportunitiesArtifactContent`
- `ScoringMatrixArtifactContent`

## Deterministic Scoring

All scores are computed deterministically (not from LLM) to ensure consistency and explainability.

### JTBD Opportunity Score

**Function**: `computeJtbdOpportunityScore` in `lib/results/scoringHelpers.ts`

**Formula:**
```
opportunity = round((importance_score * 20) + ((5 - satisfaction_score) * 20))
score = min(100, round(opportunity / 2))
```

**Range**: 0–100

### Opportunity Score

**Function**: `computeOpportunityScore` in `lib/results/scoringHelpers.ts`

**Formula:**
- Start at 0
- Impact: low=20, med=50, high=80
- Effort: S=+15, M=+0, L=-15
- Confidence: low=-10, med=0, high=+10
- Add JTBD contribution: `round(jtbd_opportunity_score * 0.2)`
- Clamp to 0–100

### Weighted Competitor Scores

**Function**: `computeWeightedCompetitorScores` in `lib/results/scoringHelpers.ts`

**Process:**
1. Normalize criterion weights (sum to 1.0)
2. Convert 1–5 scores to 0–100 per criterion: `((score - 1) / 4) * 100`
3. Weighted sum: `sum(normalized_score * weight)`
4. Round to 2 decimals

## UI Rendering

### Results Page

**File**: `app/projects/[projectId]/results/page.tsx`

**Tabs:**
- Jobs (JTBD)
- Scorecard (Scoring Matrix)
- Opportunities (Opportunities v2)

**Key components:**
- `RecommendedNextStepsPanel` - Shows top 2 opportunities at top of page
- `JtbdSection` - Renders JTBD cards sorted by opportunity score
- `ScoringSection` - Renders criteria, bar chart, and competitor summaries
- `OpportunitiesV2Section` - Renders ranked opportunities with experiments

**Normalization:**
- `normalizeResultsArtifacts` in `lib/results/normalizeArtifacts.ts`
- Prefers `schema_version=2` artifacts over v1
- Falls back to v1 if v2 not present
- Sorts by `created_at` (newest first)

### Charts

**Library**: Recharts (already installed)

**Components:**
- `CompetitorScoreBarChart` - Bar chart showing competitor total scores
- Accessible: includes table fallback
- Uses design tokens: `hsl(var(--primary))` for fill

**Location**: In `ScoringSection` component

## Quality Signals

**File**: `lib/results/qualitySignals.ts`

**Computed signals:**
- `jtbdCount`: Number of JTBD generated
- `avgJtbdOpportunityScore`: Average opportunity score across JTBD
- `opportunitiesCount`: Number of opportunities
- `avgOpportunityScore`: Average opportunity score
- `criteriaCount`: Number of scoring criteria
- `competitorsCount`: Number of competitors in scoring
- `hasFirstExperimentsRate`: Percentage of opportunities with >=2 experiments

**Logging:**
- Logged via `logger.info` (environment gated)
- Stored in `meta.signals` for each artifact
- No sensitive data (no evidence text, only counts/scores)

## Debugging

### Local Development

1. **Generate Results v2**:
   ```bash
   # Via UI: Click "Generate Results" button on results page
   # Or via API:
   curl -X POST http://localhost:3000/api/results/generate-v2 \
     -H "Content-Type: application/json" \
     -d '{"projectId": "your-project-id"}'
   ```

2. **Check logs**:
   ```bash
   # Quality signals are logged with INFO level
   # Enable with: DEBUG_ALL=true npm run dev
   ```

3. **Inspect artifacts**:
   - Check `artifacts` table in Supabase
   - Verify `content_json.meta.schema_version = 2`
   - Check `content_json.meta.signals` for quality metrics

### Common Issues

**"Missing profiles" error:**
- Solution: Run `generateAnalysis` first to create profiles artifact

**Validation failures:**
- Check repair logs in console
- Verify LLM output format matches schema
- Check for schema mismatches after repair

**No v2 artifacts showing:**
- Verify `schema_version=2` in artifact meta
- Check `normalizeResultsArtifacts` is preferring v2
- Ensure artifacts were created with latest code

## Future Work

### Planned Enhancements

1. **Scatterplot chart**: Effort vs Score for opportunities (X=effort, Y=score, size=confidence)
2. **JTBD de-duplication**: Merge similar jobs to reduce redundancy
3. **Export formats**: PDF/CSV export for results
4. **Version comparison**: Compare results across runs
5. **Custom criteria**: Allow users to define scoring criteria

### Code Locations

- **Schemas**: `lib/schemas/{jtbd,opportunities,scoring}.ts`
- **Prompts**: `lib/prompts/{jtbd,opportunities,scoring}.ts`
- **Generation**: `lib/results/generateV2.ts`
- **Scoring helpers**: `lib/results/scoringHelpers.ts`
- **Quality signals**: `lib/results/qualitySignals.ts`
- **Normalization**: `lib/results/normalizeArtifacts.ts`
- **API route**: `app/api/results/generate-v2/route.ts`
- **UI components**: `app/projects/[projectId]/results/page.tsx`

## Related Documentation

- **Architecture**: See [architecture/ARCHITECTURE.md](./architecture/ARCHITECTURE.md) for overall system design
- **Data Model**: See [data/DATA_MODEL.md](./data/DATA_MODEL.md) for database schema
- **Auth**: See [security/Auth.md](./security/Auth.md) for authentication flow

