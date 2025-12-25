# Analysis Pipeline

**Purpose**: How competitive analysis generation works end-to-end in Plinth (LLM calls, validation, artifact storage).

**When to read this**: Read this to understand how the analysis pipeline orchestrates competitor snapshot and market synthesis generation.

**Last updated**: 2025-01-27

---

## Overview

The `generateAnalysis(projectId)` function (`app/projects/[projectId]/results/actions.ts`) orchestrates the end-to-end analysis generation:

1. **Validate inputs** (auth, project access, competitor count)
2. **Generate competitor snapshots** (one LLM call per competitor)
3. **Generate market synthesis** (one LLM call across all snapshots)
4. **Store artifacts** (profiles + synthesis)
5. **Return artifact IDs**

## Step-by-Step Flow

### 1. Input Validation

```typescript
// Auth check
const user = await supabase.auth.getUser()
if (!user) return { ok: false, message: 'Unauthenticated' }

// Project access check
const project = await getProjectById(supabase, projectId)
if (!project || project.user_id !== user.id) return { ok: false, ... }

// Competitor count check
const competitors = await listCompetitorsForProject(supabase, projectId)
if (competitors.length < MIN_COMPETITORS_FOR_ANALYSIS) return { ok: false, ... }
if (competitors.length > MAX_COMPETITORS_PER_PROJECT) return { ok: false, ... }
```

**Constraints**:
- `MIN_COMPETITORS_FOR_ANALYSIS = 3`
- `MAX_COMPETITORS_PER_PROJECT = 7`

### 2. Competitor Snapshot Generation

For each competitor:

```typescript
// Truncate evidence to 12,000 chars
const truncatedEvidence = competitor.evidence_text.slice(0, MAX_EVIDENCE_CHARS)

// Build prompt
const messages = buildSnapshotMessages({
  project: { market, target_customer, ... },
  competitor: { name, url, evidence_text: truncatedEvidence },
})

// Call LLM
const response = await callLLM({
  messages,
  jsonMode: true,
  temperature: 0.2,
  maxTokens: 1_600,
})

// Parse and validate
let parsed = safeParseLLMJson(response.text, CompetitorSnapshotSchema)
```

**Evidence Truncation**:
- Evidence text truncated to `MAX_EVIDENCE_CHARS = 12_000` per competitor
- Warning logged if truncation occurs
- Truncation happens before prompt building

**LLM Parameters**:
- `jsonMode: true` - Forces JSON output
- `temperature: 0.2` - Low temperature for consistent output
- `maxTokens: 1_600` - Token limit per snapshot

### 3. Schema Validation & Repair

If initial parse fails:

```typescript
if (!parsed.ok) {
  // Build repair prompt
  const repairMessages = buildRepairMessages({
    rawText: response.text,
    schemaName: 'CompetitorSnapshot',
    schemaShapeText: JSON.stringify(COMPETITOR_SNAPSHOT_SCHEMA_SHAPE, null, 2),
    validationErrors: parsed.error,
  })

  // Call LLM again with repair prompt
  const repairResponse = await callLLM({
    messages: repairMessages,
    jsonMode: true,
    temperature: 0.1,  // Even lower temperature for repair
    maxTokens: 1_600,
  })

  // Validate repaired output
  parsed = safeParseLLMJson(repairResponse.text, CompetitorSnapshotSchema)
  
  // Fail if repair also fails
  if (!parsed.ok) return { ok: false, message: 'Validation failed after repair' }
}
```

**Repair Strategy**:
- Single repair attempt per snapshot
- Repair prompt includes schema shape + validation errors
- Lower temperature (0.1) for repair to minimize creativity
- Fails if repair also fails validation

### 4. Market Synthesis Generation

After all snapshots are generated:

```typescript
// Serialize snapshots to JSON
const snapshotsJson = JSON.stringify(snapshots)

// Build synthesis prompt
const messages = buildSynthesisMessages({
  project: { market, target_customer, ... },
  snapshotsJson,
})

// Call LLM
let response = await callLLM({
  messages,
  jsonMode: true,
  temperature: 0.2,
  maxTokens: 2_400,
})

// Parse and validate (with repair if needed)
let parsed = safeParseLLMJson(response.text, MarketSynthesisSchema)
if (!parsed.ok) {
  // Repair flow (same as snapshots)
  // ...
}
```

**LLM Parameters**:
- `maxTokens: 2_400` - Higher limit for synthesis (more complex output)
- Same repair strategy as snapshots

### 5. Artifact Storage

Store both artifacts:

```typescript
// Profiles artifact
const profilesArtifact = await createArtifact(supabase, {
  project_id: projectId,
  type: 'profiles',
  content_json: {
    run_id: generateRunId(),
    generated_at: new Date().toISOString(),
    competitor_count: snapshots.length,
    llm: {
      stage: 'snapshots',
      provider: snapshotProvider,
      model: snapshotModel,
      usage: snapshotUsageTotals,
    },
    snapshots,
  },
})

// Synthesis artifact
const synthesisArtifact = await createArtifact(supabase, {
  project_id: projectId,
  type: 'synthesis',
  content_json: {
    run_id: generateRunId(),  // Same run_id for both
    generated_at: new Date().toISOString(),
    competitor_count: snapshots.length,
    llm: {
      stage: 'synthesis',
      provider: synthesisResponse.provider,
      model: synthesisResponse.model,
      usage: synthesisResponse.usage,
    },
    synthesis: parsed.data,
  },
})
```

**Artifact Structure**:
- Both artifacts share same `run_id` and `generated_at`
- LLM usage tracked per stage (snapshots vs synthesis)
- Token usage aggregated across all snapshot calls

## Prompt Quality Tuning

### System Prompt

**File**: `lib/prompts/system.ts`

Controls overall LLM behavior:
- Role: "experience strategy lead"
- Voice: "crisp, specific, pragmatic, non-fluffy"
- Evidence handling: "Every claim supported by evidence quote"
- Output format: "Single valid JSON object"

**To adjust**: Edit `SYSTEM_STYLE_GUIDE_CONTENT` in `lib/prompts/system.ts`

### Snapshot Prompt

**File**: `lib/prompts/snapshot.ts`

Prompts LLM to extract:
- Positioning, target audience, use cases
- Value propositions, capabilities
- Business model signals
- Proof points with evidence quotes
- Risks and unknowns

**Schema shape**: `COMPETITOR_SNAPSHOT_SCHEMA_SHAPE` defines expected output structure.

**To adjust**: Edit `buildSnapshotMessages()` or schema shape.

### Synthesis Prompt

**File**: `lib/prompts/synthesis.ts`

Prompts LLM to synthesize:
- Market summary (headline, changes, buyer concerns)
- Themes across competitors
- Competitive clusters
- Positioning map (2D axes)
- Opportunities and gaps

**Schema shape**: `MARKET_SYNTHESIS_SCHEMA_SHAPE` defines expected output structure.

**To adjust**: Edit `buildSynthesisMessages()` or schema shape.

## Cost & Token Considerations

### Token Usage

**Per competitor snapshot**:
- Input: ~2,000-5,000 tokens (project context + evidence)
- Output: ~500-1,000 tokens (snapshot JSON)
- Repair: +2,000-5,000 tokens if validation fails

**Synthesis**:
- Input: ~5,000-15,000 tokens (project context + all snapshots)
- Output: ~1,500-2,400 tokens (synthesis JSON)
- Repair: +5,000-15,000 tokens if validation fails

**Total for 5 competitors**:
- Snapshots: ~15,000-30,000 tokens
- Synthesis: ~10,000-20,000 tokens
- **Total**: ~25,000-50,000 tokens per analysis

### Guardrails

**Evidence truncation**: Prevents excessive input tokens
- Max 12,000 chars per competitor
- Applied before prompt building

**Token limits**: Prevents excessive output tokens
- Snapshots: 1,600 tokens max
- Synthesis: 2,400 tokens max

**Retry limits**: Prevents runaway costs
- Max 3 retries per LLM call (handled by `callLLM`)
- Repair attempts: 1 per snapshot/synthesis

**Timeout**: 30 seconds per LLM call (prevents hanging)

### Cost Estimation

Assuming GPT-4 pricing (approximate):
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens

**Per analysis (5 competitors)**:
- Snapshots: ~$1.50-3.00
- Synthesis: ~$0.60-1.20
- **Total**: ~$2.10-4.20 per analysis

**With repair failures**: +50-100% if many repairs needed

## Error Handling

### Validation Failures

**Snapshot validation fails after repair**:
- Returns error with competitor name
- Other snapshots continue processing
- No partial artifacts stored

**Synthesis validation fails after repair**:
- Returns error
- Snapshots artifact may be stored (if generated)
- Synthesis artifact not stored

### LLM Errors

**Retryable errors** (handled by `callLLM`):
- Timeouts (30s)
- Rate limits (429)
- Server errors (5xx)

**Non-retryable errors**:
- Client errors (4xx)
- Invalid API key
- Quota exceeded

**Behavior**: Retries up to 3 times with exponential backoff. Fails after max retries.

### Partial Failures

**Scenario**: 3 of 5 snapshots succeed, 2 fail validation after repair.

**Current behavior**: Entire analysis fails (no partial artifacts stored).

**Future consideration**: Could store partial results, but current design requires all snapshots to succeed.

## Adjusting Analysis Quality

### Temperature

**Current**: 0.2 (snapshots/synthesis), 0.1 (repair)

**To increase creativity**: Raise to 0.3-0.5 (may reduce consistency)

**To increase consistency**: Lower to 0.1 (may reduce nuance)

### Max Tokens

**Current**: 1,600 (snapshots), 2,400 (synthesis)

**To allow longer outputs**: Increase maxTokens (may increase cost)

**To constrain outputs**: Decrease maxTokens (may truncate content)

### Evidence Truncation

**Current**: 12,000 chars per competitor

**To allow more evidence**: Increase `MAX_EVIDENCE_CHARS` (may increase cost/timeout risk)

**To reduce cost**: Decrease `MAX_EVIDENCE_CHARS` (may reduce analysis quality)

### Repair Strategy

**Current**: Single repair attempt

**To increase success rate**: Add second repair attempt (may increase cost/time)

**To reduce cost**: Remove repair (may increase failure rate)

## Monitoring

**LLM usage tracked**:
- Provider, model, token counts per stage
- Stored in artifact `content_json.llm` field

**Logging**:
- Evidence truncation warnings
- Validation failures
- Repair attempts
- Unhandled errors

**Debug endpoints**:
- `/api/llm-test` - Test LLM connectivity
- Check logs for LLM errors

