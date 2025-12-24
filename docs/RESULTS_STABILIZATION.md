# Results Stabilization

**Purpose**: Describes the stabilized Results architecture with a single canonical route and centralized normalization.

**When to read this**: Read this to understand how results are loaded, normalized, and displayed, especially if working on results UI or artifact handling.

**Related docs**:
- [../strat-os-phere/docs/DATA_MODEL.md](../strat-os-phere/docs/DATA_MODEL.md) - Artifact schema
- [../strat-os-phere/docs/ANALYSIS_PIPELINE.md](../strat-os-phere/docs/ANALYSIS_PIPELINE.md) - How artifacts are generated
- [PRD.md](./PRD.md) - Product requirements for results

---

## Summary

This document describes the stabilized Results architecture after removing dead paths, establishing a single canonical entry point, and centralizing artifact normalization.

## Canonical Route

**Single canonical route**: `/projects/[projectId]/results`

This is the ONE entry point for viewing project results. All other routes redirect here:
- `/projects/[projectId]/opportunities` → redirects to `/results`
- `/projects/[projectId]/strategic-bets` → redirects to `/results`
- `/projects/[projectId]/jobs` → redirects to `/results`

The canonical route:
- Loads artifacts for the project
- Normalizes them once using `normalizeResultsArtifacts` from `lib/results/normalizeResults.ts`
- Renders opportunities-first view (no tabs, single unified view)
- Shows empty states gracefully when artifacts are missing

## Normalization

**Single normalization function**: `normalizeResultsArtifacts(artifacts, projectId)` in `lib/results/normalizeResults.ts`

This function:
- Handles multiple artifact versions (v1/v2/v3) gracefully
- Prefers newest `schema_version`, then newest `created_at`
- Handles both envelope (content_json wrapped) and bare content formats
- Returns null for missing sections (never throws)
- Derives evidence summary from all artifacts
- Returns metadata about available artifact types and schema versions

### Return Shape

```typescript
interface NormalizedResults {
  opportunities: {
    v3: NormalizedOpportunitiesV3Artifact | null
    v2: NormalizedOpportunitiesV2Artifact | null
    best: NormalizedOpportunitiesV3Artifact | NormalizedOpportunitiesV2Artifact | null
  }
  strategicBets: NormalizedStrategicBetsArtifact | null
  profiles: NormalizedProfilesArtifact | null
  jtbd: NormalizedJtbdArtifact | null
  evidenceSummary: EvidenceSummary | null
  meta: {
    projectId: string
    lastGeneratedAt: string | null
    availableArtifactTypes: string[]
    schemaVersionsPresent: number[]
  }
}
```

### Normalization Rules

1. **Opportunities**: Prefer v3 over v2, then newest by `created_at`
2. **Strategic Bets**: Prefer highest `schema_version`, then newest by `created_at`
3. **Profiles**: Prefer newest by `created_at`
4. **Evidence Summary**: Derived from citations extracted from all artifacts
5. **Missing artifacts**: Return `null` for that section (never throw)

## Deprecated Routes

The following routes are deprecated and redirect to `/results`:

- `/projects/[projectId]/opportunities` - Legacy opportunities route
- `/projects/[projectId]/strategic-bets` - Legacy strategic bets route  
- `/projects/[projectId]/jobs` - Legacy jobs route

All redirects preserve the `projectId` and maintain backwards compatibility.

## Implementation Details

### Results Page (`app/projects/[projectId]/results/page.tsx`)

- Server component that loads artifacts
- Calls `normalizeResultsArtifacts` ONCE
- Renders `ResultsReadout` and `OpportunitiesContent` components
- No tab-based routing - single unified view

### Normalization Module (`lib/results/normalizeResults.ts`)

- Server-safe (no React imports)
- Uses existing `normalizeArtifacts.ts` internally for artifact parsing
- Adds evidence summary derivation
- Adds metadata aggregation
- Provides clean, normalized interface for UI

### Legacy Support

- Old URLs still work via redirects
- No breaking changes to existing links
- Tab parameters are ignored (redirected to canonical route)

## Testing

Unit tests in `tests/unit/normalizeResults.test.ts` verify:
- Picks newest `schema_version` correctly
- Falls back to `created_at` when `schema_version` ties
- Handles envelope vs bare content formats
- Returns null sections safely for missing artifacts

