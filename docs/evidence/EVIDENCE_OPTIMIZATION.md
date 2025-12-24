# Evidence Fetching Optimization

**Status: Source of truth (evidence system)**

**Purpose**: Describes the optimization implemented to reduce typical analysis runtime through parallel fetching, caching, and two-pass shortlisting.

**Related docs**:
- [EVIDENCE_CLAIMS.md](./EVIDENCE_CLAIMS.md) - Claim-centric evidence system
- [../../strat-os-phere/docs/EVIDENCE_GENERATION.md](../../strat-os-phere/docs/EVIDENCE_GENERATION.md) - Evidence generation flow
- [../00-overview/01-system-overview.md](../00-overview/01-system-overview.md) - System flow context

---

## Overview

This document describes the optimization implemented to reduce typical analysis runtime from >10 minutes to ~2-5 minutes through parallel fetching, caching, and two-pass shortlisting.

## Implementation Summary

### Step 1: Evidence Cache

**Files Created:**
- `docs/sql/create_evidence_cache_table.sql` - Database migration
- `strat-os-phere/lib/evidence/normalizeUrl.ts` - URL normalization utilities
- `strat-os-phere/lib/evidence/hash.ts` - Content hashing utilities
- `strat-os-phere/lib/evidence/cache.ts` - Cache management functions

**Key Features:**
- Unified `evidence_cache` table stores fetched content, extractions, and summaries
- URL normalization (strips UTM params, normalizes hostname, removes trailing slashes)
- Content hashing for deduplication
- TTL-based freshness checking (default 7 days)

### Step 2: Parallel Fetch with Limits

**Files Created:**
- `strat-os-phere/lib/evidence/parallelFetch.ts`

**Configuration:**
- `CONCURRENCY = 8` - Max parallel fetches
- `FETCH_TIMEOUT_MS = 15000` - Per-URL timeout
- `TOTAL_FETCH_BUDGET_MS_PER_COMPETITOR = 90000` - Total budget per competitor

**Features:**
- Uses `p-limit` for concurrency control
- Timeout protection per URL
- Budget enforcement to prevent stalls
- Cache integration (checks cache before fetching)
- Graceful error handling (one failing URL doesn't fail the whole run)
- Comprehensive stats tracking (cache hits, misses, successes, failures)

### Step 3: Two-Pass Shortlisting

**Files Created:**
- `strat-os-phere/lib/evidence/pageSummary.ts` - PageSummary schema and shortlist logic
- `strat-os-phere/lib/prompts/pageSummary.ts` - LLM prompt for fast triage
- `strat-os-phere/lib/evidence/shortlist.ts` - Two-pass implementation

**Pass A (Fast Triage):**
- Generates PageSummary for all fetched pages
- Uses cheap LLM call (temperature 0, max 500 tokens)
- Caches summaries by content_hash + prompt_version
- Determines: source_type, signals, coverage_score, recency_hint, credibility_hint, recommended_for_deep_read

**Shortlist Quotas (per competitor):**
- 2 pricing pages
- 2 docs pages
- 1 changelog/release notes
- 1 jobs/careers
- 2 reviews (highest coverage)
- 1 status/incidents (if exists)
- Fill remaining with highest coverage_score

**Pass B (Deep Read):**
- Only shortlisted pages are included in synthesis
- Reduces prompt size and speeds up main synthesis step

### Step 4: Feature Flag

**Files Modified:**
- `strat-os-phere/lib/flags.ts` - Added `evidenceOptimize` flag

**Configuration:**
- Default: ON (`EVIDENCE_OPTIMIZE=true` or unset)
- Can be disabled: `EVIDENCE_OPTIMIZE=false`
- Easy rollback if needed

### Step 5: Integration

**Files Modified:**
- `strat-os-phere/app/api/evidence/generate/route.ts` - Main evidence generation route

**Changes:**
- Dual path: optimized (when flag enabled) vs legacy (when disabled)
- Observability: logs timing, cache hit rates, shortlist counts
- Backward compatible: legacy path preserved for safety

**Database Types:**
- `strat-os-phere/lib/supabase/database.types.ts` - Added `EvidenceCacheRow` and table definition

## Performance Improvements

### Expected Benefits:
1. **Parallel Fetching**: 8x concurrency reduces sequential wait time
2. **Caching**: Subsequent runs use cached content (no re-fetch)
3. **Shortlisting**: Only 9-11 pages per competitor analyzed deeply (vs 10+ previously)
4. **Timeouts**: No single slow URL can stall the run
5. **Budget Limits**: Hard cap prevents runaway execution

### Metrics Tracked:
- Cache hit rate (visible in logs)
- Total fetch time
- Pass A (summary generation) time
- Shortlist counts
- Success/failure rates

## Schema Changes

### New Table: `evidence_cache`
```sql
- id uuid PK
- normalized_url text UNIQUE
- content_hash text
- fetched_at timestamptz
- http_status int
- final_url text
- title text
- raw_text text
- extract_json jsonb
- summary_json jsonb
- summary_prompt_version text
- stale_after_days int (default 7)
```

### Migration Required:
Run `docs/sql/create_evidence_cache_table.sql` in your Supabase SQL editor.

## Usage

### Enable Optimization (Default):
```bash
# Already enabled by default, or explicitly:
export EVIDENCE_OPTIMIZE=true
```

### Disable (Fallback):
```bash
export EVIDENCE_OPTIMIZE=false
```

### Observability:
Check logs for:
- `[evidence/generate] Fetch completed` - Cache hit rates, timing
- `[evidence/generate] Shortlist completed` - Summary counts, shortlist stats

## Dependencies Added

- `p-limit` - Concurrency limiting library

## Testing Considerations

1. **Cache Behavior**: Verify cache hits on second run with same URLs
2. **Shortlisting**: Verify only top pages by type are selected
3. **Timeouts**: Test with slow/unreachable URLs
4. **Budget**: Verify budget enforcement stops fetching after limit
5. **Quality**: Verify output schemas unchanged (OpportunityV3, Scorecard, etc.)
6. **Citations**: Verify evidence citations still present and accurate

## Rollback Plan

If issues occur:
1. Set `EVIDENCE_OPTIMIZE=false` environment variable
2. System will use legacy sequential fetch path
3. No database rollback needed (evidence_cache table can remain)

## Future Enhancements

Potential improvements:
- Include summary_json in synthesis prompt for better context
- Adaptive quotas based on available sources
- Batch summary generation for even faster Pass A
- Cache warming strategies

