# PR: Toast Notifications + Progress UI + Polling

**Status: Historical / reference (not source of truth)**

This document is a snapshot of past work. It provides context but is not the source of truth for current implementation.

## Summary

This PR adds toast notifications, progress UI components, and background polling for analysis runs. It's designed to be parallel-safe with ongoing serial data/schema work (project_inputs/project_runs), requires no DB migrations, and degrades gracefully if run APIs are not fully available yet.

## Changes

### A) Toast System (Global)

- **Installed sonner** - shadcn/ui recommended toast library
- **Added Toaster component** (`components/ui/toaster.tsx`) - global toast provider
- **Created toast helpers** (`lib/toast/toast.ts`):
  - `toastSuccess(title, description?)`
  - `toastError(title, description?)`
  - `toastInfo(title, description?)`
- **Integrated into root layout** - Toaster component added to `app/layout.tsx`

### B) Progress UI Components

- **RunStatusPill** (`components/runs/RunStatusPill.tsx`)
  - Props: `status`, `lastUpdatedAt?`, `className?`
  - Displays status badges (idle, queued, running, succeeded, failed, unknown)
  - Calm styling with appropriate colors

- **RunProgressPanel** (`components/runs/RunProgressPanel.tsx`)
  - Props: `status`, `message?`, `steps?`, `onRetry?`, `onViewDetails?`, `className?`
  - Shows headline, message, optional step list, and action buttons
  - Works even if only status is known (degraded gracefully)

### C) Background Polling

- **Tolerant runStatusClient adapter** (`lib/runs/runStatusClient.ts`)
  - `fetchLatestRunStatus(projectId, runId?)` - always returns a response, never throws
  - Tries `/api/runs/[runId]/status` first
  - Falls back to `/api/projects/[projectId]/runs/latest` if no runId
  - Returns `unknown` status if endpoints unavailable (no crashes)

- **useRunStatusPolling hook** (`hooks/useRunStatusPolling.ts`)
  - Polls every 3 seconds (configurable) while status is queued|running
  - Stops on terminal states (succeeded|failed) or after 2-minute timeout
  - Exposes: `status`, `run`, `isPolling`, `error`, `startPolling()`, `stopPolling()`
  - Handles errors gracefully

### D) Wired into Generate Analysis UX

Updated all "Generate analysis" buttons to show immediate toasts:
- `components/projects/GenerateAnalysisButton.tsx`
- `components/competitors/GenerateAnalysisButton.tsx`
- `components/results/RegenerateButton.tsx`
- `components/results/RerunAnalysisButton.tsx`
- `components/results/GenerateResultsV2Button.tsx`
- `components/projects/ProjectsTable.tsx`

On click:
1. Immediate toast: "Starting analysis…"
2. Call existing `startEvidenceRun` action
3. On success: run registered with RunToasts (existing behavior)
4. On error: error toast shown

Updated `components/toasts/RunToasts.tsx` to show toasts on status transitions:
- queued → running → succeeded: "Analysis complete"
- failed: "Analysis failed" with error message

### E) Optional SSE/WebSocket Scaffolding

Created `lib/runs/runStatusTransport.ts`:
- Configurable transport: `'polling' | 'sse' | 'websocket' | 'auto'`
- Default: `polling`
- `connectRunStatusSSE()` - scaffold only, fails silently and falls back to polling
- `connectRunStatusWebSocket()` - placeholder interface only, no implementation
- Controlled by `RUN_STATUS_TRANSPORT` constant (can be moved to env vars/feature flags)

## Parallel Safety

✅ **No DB migrations** - All changes are client-side only
✅ **No schema changes** - Does not modify Supabase schema
✅ **No edits to lib/db/*** - Does not touch data contract files
✅ **Works without project_runs** - Degrades gracefully if run endpoints don't exist
✅ **Build passes** - `pnpm run build` succeeds
✅ **Type-safe** - All TypeScript checks pass

## Acceptance Criteria

✅ `pnpm run build` passes
✅ Clicking "Generate analysis" always shows immediate toast
✅ While running, user sees stable progress panel (even if status is unknown)
✅ Polling stops on terminal states or timeout
✅ No DB/schema changes; PR can merge in parallel with PR-2
✅ If no run-status endpoint exists, app still works (status shows "unknown", no crashes)

## Manual Test Steps

1. **Click "Generate analysis"**
   - ✅ Should see immediate toast: "Starting analysis…"
   - ✅ Button should show "Starting..." state
   - ✅ RunToasts component should appear with progress

2. **Observe progress UI**
   - ✅ RunToasts shows progress indicator
   - ✅ Status updates as run progresses
   - ✅ Can continue navigating - toast persists

3. **Status transitions**
   - ✅ When run completes: toast "Analysis complete"
   - ✅ When run fails: toast "Analysis failed"
   - ✅ RunToasts shows appropriate actions (View results, Retry)

4. **Verify timeout behavior**
   - ✅ Polling stops after 2 minutes if run doesn't complete
   - ✅ Status remains stable (no crashes)

5. **Verify build**
   - ✅ `pnpm run build` succeeds
   - ✅ No TypeScript errors in new files

## Files Added

- `components/ui/toaster.tsx` - Sonner toast provider
- `lib/toast/toast.ts` - Toast helper functions
- `components/runs/RunStatusPill.tsx` - Status badge component
- `components/runs/RunProgressPanel.tsx` - Progress panel component
- `lib/runs/runStatusClient.ts` - Tolerant run status client adapter
- `hooks/useRunStatusPolling.ts` - Polling hook
- `lib/runs/runStatusTransport.ts` - SSE/WebSocket scaffolding

## Files Modified

- `app/layout.tsx` - Added Toaster component
- `components/projects/GenerateAnalysisButton.tsx` - Added immediate toasts
- `components/competitors/GenerateAnalysisButton.tsx` - Added immediate toasts
- `components/results/RegenerateButton.tsx` - Added immediate toasts
- `components/results/RerunAnalysisButton.tsx` - Added immediate toasts
- `components/results/GenerateResultsV2Button.tsx` - Added immediate toasts
- `components/projects/ProjectsTable.tsx` - Added immediate toasts
- `components/toasts/RunToasts.tsx` - Added toasts on status transitions

## Dependencies Added

- `sonner@2.0.7` - Toast notification library

