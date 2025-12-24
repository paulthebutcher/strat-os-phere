# Definition of Done

**Purpose**: A viability checklist for external users to verify the system is working correctly.

**When to read this**: Use this as a checklist when testing the system or verifying that a feature is complete.

**Related docs**:
- [01-system-overview.md](./01-system-overview.md) - System flow
- [../../strat-os-phere/docs/GUARDRAILS.md](../../strat-os-phere/docs/GUARDRAILS.md) - Guardrail implementation

---

## Evidence Visibility

✅ **Evidence sources are visible and inspectable**
- Users can see all evidence sources for each competitor
- Evidence sources show URL, page title, extracted text, and extraction timestamp
- Evidence cache shows cache hit/miss status and freshness

✅ **Evidence citations are present and accurate**
- Every claim in opportunities, profiles, and synthesis has citations
- Citations link to real evidence sources with URLs
- No invented or hallucinated citations

✅ **Evidence coverage is transparent**
- System shows evidence coverage (number of sources, source types)
- Coverage gaps are visible (missing pricing, docs, reviews, etc.)
- Evidence quality score (high/medium/low) is displayed

## Coverage Gating Works

✅ **Low-quality evidence produces low-confidence outputs**
- System checks evidence quality (≥2 distinct source types OR ≥3 evidence sources per competitor)
- Low-quality evidence results in lower confidence bands
- Score ceilings are applied based on evidence quality

✅ **Evidence recency affects confidence**
- Fresh evidence (within 24 hours) has full weight
- Older evidence has decay factor applied
- Recency is visible in evidence sources and claims

✅ **Missing evidence types are flagged**
- System detects gaps (missing pricing, reviews, etc.)
- Follow-up questions may be generated for gaps or conflicts
- Coverage panel shows missing source types

## Opportunities Have Citations + JTBD

✅ **Every opportunity has citations**
- Opportunities list evidence sources that support them
- Citations are grouped by claim
- Support strength (strong/medium/weak) is visible

✅ **JTBD (Jobs-to-be-Done) is present**
- Opportunities include JTBD analysis
- JTBD shows what job the opportunity addresses
- JTBD opportunity scores are computed and visible

✅ **Opportunities are ranked by score**
- Opportunities are sorted by score (highest first)
- Scores are bounded by confidence level (score ceilings)
- Confidence bands (low/medium/high) are visible

## Deterministic Scoring Visible

✅ **Scores are bounded and transparent**
- Score ceilings are applied based on confidence level
- High confidence: 100 (no ceiling)
- Medium confidence: 90
- Low confidence: 85

✅ **Score distribution is checked**
- System flags flat distributions (stdDev < 10% of range)
- System flags extreme outliers (>3 standard deviations)
- Distribution flags are stored in artifact metadata

✅ **Scoring guardrails are observable**
- Banned pattern violations are detected and penalized
- Repair count is tracked and visible
- Evidence quality and decay factor affect scores

## Run Lifecycle Tracked

✅ **Runs are append-only**
- Each run creates new artifacts (never overwrites)
- Artifacts include `run_id` and `generated_at` metadata
- Full run history is preserved

✅ **Run metadata is complete**
- Each artifact includes LLM usage (provider, model, tokens)
- Guardrail signals are stored (repair count, evidence quality, confidence band)
- Schema version is tracked

✅ **Drift detection is possible**
- System can compare runs to detect significant changes
- Drift metrics (score changes, count changes) are computable
- Historical analysis is enabled by append-only artifacts

## Trust Indicators

✅ **Confidence bands are visible**
- Opportunities show confidence bands (low/medium/high)
- Confidence is based on evidence quality, recency, repairs, and banned patterns
- Users can see why confidence is low/medium/high

✅ **Evidence claims are inspectable**
- Claims drawer shows structured claims with citations
- Claims are grouped by category (pricing, docs, reviews, etc.)
- Support strength and recency are visible for each claim

✅ **No false precision**
- Scores are bounded by confidence level
- Vague language is penalized (banned patterns)
- System degrades gracefully rather than confidently wrong

## Next Steps

- Read [../../strat-os-phere/docs/GUARDRAILS.md](../../strat-os-phere/docs/GUARDRAILS.md) for guardrail implementation details
- Read [../../strat-os-phere/docs/ANALYSIS_PIPELINE.md](../../strat-os-phere/docs/ANALYSIS_PIPELINE.md) for generation flow details

