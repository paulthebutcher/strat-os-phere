# PR-3 Summary: Step 2 Competitors as Entities

**Status: Historical / reference (not source of truth)**

This document is a snapshot of past work. It provides context but is not the source of truth for current implementation.

## Overview
Implemented PR-3 to ensure Step 2 competitor selection uses real companies (entities) with primary websites, not listicles/aggregators. All downstream pipelines now rely on the competitors table only.

## Changes Made

### 1. Database Schema
- **Created migration**: `docs/sql/create_competitors_table.sql`
  - Ensures `url` is NOT NULL
  - Adds unique constraint on `(project_id, url)` to prevent duplicates
  - Adds index on `(project_id, created_at DESC)` for efficient queries
  - Includes RLS policies for project owners

### 2. API Route (`/api/competitors/suggest`)
- **Simplified API**: Changed from complex LLM-based extraction to direct Tavily search + filtering
  - Input: `{ query: string, market?: string }`
  - Output: `{ ok: boolean, results: Array<{ name, website, domain }> }`
- **Stricter listicle filtering**:
  - Blocks known aggregator domains (g2.com, capterra.com, zapier.com, etc.)
  - Blocks URL paths containing `/best-`, `/top-`, `/alternatives/`, etc.
  - Blocks titles with listicle keywords
  - Normalizes all URLs to root domain (`https://hostname`)
- **Returns up to 10 results** (deduplicated by domain)

### 3. Step 2 UI (`CompetitorsPageClient`)
- **Replaced cards with table/list view**:
  - Search input with "Search for competitors" placeholder
  - Results displayed in a table with: checkbox, company name, domain, Add button
  - Selected competitors shown in a separate section
- **Manual add section**:
  - Name input (required)
  - Website input (optional, validated)
  - Add button
- **Persistence**: Selected competitors saved to DB immediately via `addCompetitorFromSearch` action
- **Gating**: Shows helper text "Select at least 3 competitors to generate credible comparisons" when < 3 competitors

### 4. Data Layer (`lib/data/competitors.ts`)
- **Added convenience functions**:
  - `listCompetitors(projectId)` - alias for `listCompetitorsForProject`
  - `addCompetitor(projectId, { name, url })` - simplified add function
  - `addCompetitorsBulk(projectId, competitors[])` - bulk insert with deduplication
  - `removeCompetitorByUrl(projectId, url)` - remove by URL

### 5. Server Actions (`app/projects/[projectId]/competitors/actions.ts`)
- **Added `addCompetitorFromSearch`**:
  - Accepts `{ name, url }` (no evidence required for Step 2)
  - Validates and normalizes URL
  - Checks for duplicates
  - Saves to DB immediately

### 6. Downstream Code Audit
- **Verified** `lib/results/generateV2.ts` uses `listCompetitorsForProject` from competitors table
- **No old JSON fields found** - all code already uses the competitors table

### 7. Compatibility Updates
- **Updated `WizardStep2Confirm.tsx`** to use new API format (with backward compatibility)
- **Updated `TryStep2Confirm.tsx`** to handle new API response format

## Acceptance Criteria ✅

✅ **No listicles appear as competitor options**
- API filters block known aggregator domains and listicle patterns
- UI only shows filtered results

✅ **Selected competitors persist and reload from DB**
- Competitors saved immediately when selected
- Page refresh shows persisted competitors from DB

✅ **At least 3 competitors required to proceed**
- Helper text shown when < 3 competitors
- Generate button disabled until 3+ competitors (handled by existing `readyForAnalysis` logic)

✅ **Downstream uses competitors table only**
- All code verified to use `listCompetitorsForProject` from competitors table
- No fallback to old JSON fields

✅ **Build passes**
- TypeScript compilation successful
- No linting errors

✅ **Works if Tavily is down**
- Manual add still works
- API returns empty results gracefully

## Manual Test Steps

1. **Open Step 2** (`/projects/[projectId]/competitors`)
2. **Search competitors** for a known company (e.g., "PagerDuty")
3. **Verify no listicles shown** - only primary company websites appear
4. **Select 3 competitors** - they save to DB immediately
5. **Reload page** - selections persist from DB
6. **Run downstream flow** - verify uses DB competitors (check results generation)

## Files Changed

- `docs/sql/create_competitors_table.sql` (new)
- `app/api/competitors/suggest/route.ts` (rewritten)
- `components/competitors/CompetitorsPageClient.tsx` (rewritten)
- `lib/data/competitors.ts` (added functions)
- `app/projects/[projectId]/competitors/actions.ts` (added action)
- `components/onboarding/WizardStep2Confirm.tsx` (updated API usage)
- `app/try/TryStep2Confirm.tsx` (updated API usage)

## Notes

- The competitors table already existed but `url` was nullable. Migration ensures it's NOT NULL going forward.
- The API route was significantly simplified - removed LLM extraction in favor of direct filtering for better performance and reliability.
- Manual add remains available as a fallback if Tavily is unavailable.
- The UI now uses a table/list view instead of cards for better scanability of competitor options.

