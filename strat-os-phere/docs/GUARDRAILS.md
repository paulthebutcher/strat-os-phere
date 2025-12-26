# Guardrail System

A layered guardrail system to make Plinth's AI analysis stable, trustworthy, and resistant to silent drift.

## Goals

- Prevent low-quality inputs from producing high-confidence outputs
- Detect and surface model degradation early
- Avoid false precision in scoring
- Preserve user trust over time

## Architecture

The guardrail system is implemented in phases:

### Phase 1 — Evidence Guardrails

**1.1 Evidence Quality Checks**
- Location: `lib/guardrails/evidence.ts`
- Function: `checkEvidenceQuality()`
- Requirements: ≥2 distinct `source_types` OR ≥3 `evidence_sources` per competitor (averaged)
- Action: Marks run as low/medium/high confidence, but allows generation to proceed
- Output: `EvidenceQualityCheck` with confidence level and decay factor

**1.2 Evidence Recency Decay**
- Location: `lib/guardrails/evidence.ts`
- Function: `computeRecencyDecayFactor()`
- Logic: 
  - Evidence within 24 hours: 1.0 (full freshness)
  - Evidence between 24 hours and TTL: linear decay from 1.0 to 0.5
  - Evidence older than TTL: exponential decay from 0.5 to 0.0
- Used in: Score ceiling calculations and confidence band computation

### Phase 2 — Model Output Guardrails

**2.1 Schema Failure Tracking**
- Location: `lib/results/generateV2.ts`
- Implementation: Tracks `repairCount` throughout generation process
- Storage: Stored in `meta.signals.repairCount` in all artifacts
- Purpose: Observable repair logic, not silent failures

**2.2 Banned Pattern Validation**
- Location: `lib/guardrails/validation.ts`
- Functions: `detectBannedPatterns()`, `computeBannedPatternPenalty()`
- Patterns Detected:
  - Vague verbs: improve, enhance, optimize, streamline, leverage, utilize, facilitate, enable, empower, transform, revolutionize, disrupt, maximize, minimize
  - Unsupported absolutes: always, never, all, none, every, no one, everyone, everything, nothing
- Penalty: 0.0 (no violations) to 1.0 (many violations)
- Applied to: All artifact content before score computation

### Phase 3 — Scoring Guardrails

**3.1 Score Ceilings**
- Location: `lib/guardrails/scoring.ts`
- Function: `applyScoreCeiling()`
- Ceiling Rules:
  - High confidence (high evidence quality AND (fresh evidence OR low repairs) AND low banned patterns): 100 (no ceiling)
  - Medium confidence (medium+ evidence quality): 90
  - Low confidence (default): 85
- Applied to: All scores (JTBD opportunity scores, opportunity scores, competitor weighted scores)

**3.2 Post-Score Sanity Checks**
- Location: `lib/guardrails/scoring.ts`
- Function: `checkScoreDistribution()`
- Checks:
  - Flat distribution: stdDev < 10% of range
  - Extreme outliers: values >3 standard deviations from mean
- Storage: Flags stored in `meta.signals.scoreDistributionFlags`
- Purpose: Detect model confusion or insufficient differentiation

### Phase 4 — Output Guardrails

**4.1 Confidence Bands**
- Location: `lib/guardrails/scoring.ts`
- Function: `computeConfidenceBand()`
- Bands: `low`, `medium`, `high`
- Logic: Based on evidence quality, decay factor, repair count, banned pattern penalty, and score level
- Storage: Stored in `meta.signals.confidenceBand`

**4.2 Run History Preservation**
- Location: `lib/data/artifacts.ts`
- Implementation: Artifacts are never overwritten - `createArtifact()` always creates new records
- Metadata: Each artifact stores `run_id` and `generated_at` in `meta` field
- Purpose: Enable drift detection and historical analysis

### Phase 5 — Drift Detection

**5.1 Drift Detection Utility**
- Location: `lib/guardrails/drift.ts`, `lib/guardrails/drift-helper.ts`
- Functions: `detectDrift()`, `detectRunDrift()`
- Metrics Tracked:
  - JTBD: Average opportunity score change, job count change
  - Opportunities: Average score change, opportunity count change
  - Scoring: Mean competitor score change, competitor count change
- Thresholds: Flags drift if changes exceed 10-15 points or 2 items
- Usage: Optional utility for monitoring model degradation over time

## Signal Storage

All guardrail signals are stored in `meta.signals` of each artifact:

```typescript
{
  // Base quality signals
  jtbdCount: number
  avgJtbdOpportunityScore: number
  opportunitiesCount: number
  avgOpportunityScore: number
  criteriaCount: number
  competitorsCount: number
  hasFirstExperimentsRate: number

  // Guardrail signals
  repairCount?: number
  evidenceQuality?: 'low' | 'medium' | 'high'
  evidenceDecayFactor?: number
  bannedPatternPenalty?: number
  scoreDistributionFlags?: string[]
  confidenceBand?: 'low' | 'medium' | 'high'
}
```

## Usage

### Evidence Quality Check

```typescript
import { checkEvidenceQuality } from '@/lib/guardrails'

const qualityCheck = await checkEvidenceQuality(supabase, projectId)
if (!qualityCheck.passes) {
  // Handle low-quality evidence
  console.warn(qualityCheck.reason)
}
```

### Banned Pattern Detection

```typescript
import { detectBannedPatterns } from '@/lib/guardrails'

const violations = detectBannedPatterns(text)
if (violations.hasViolations) {
  console.warn('Banned patterns detected:', violations)
}
```

### Score Ceiling Application

```typescript
import { applyScoreCeiling } from '@/lib/guardrails'

const adjustedScore = applyScoreCeiling(rawScore, {
  evidenceQuality: 'medium',
  decayFactor: 0.8,
  repairCount: 1,
  bannedPatternPenalty: 0.2,
})
```

### Drift Detection

```typescript
import { detectRunDrift } from '@/lib/guardrails'

const drift = await detectRunDrift(supabase, projectId, currentRunId)
if (drift?.hasSignificantDrift) {
  console.warn('Significant drift detected:', drift.flags)
}
```

## Acceptance Criteria

✅ Low-quality inputs cannot produce high-confidence outputs  
✅ Scores are bounded and distribution-aware  
✅ Repair logic is observable, not silent  
✅ Regeneration never surprises users  
✅ System degrades gracefully rather than confidently wrong

