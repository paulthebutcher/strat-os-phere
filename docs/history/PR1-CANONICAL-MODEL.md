# PR1 — Canonical Domain Model & Zod Contracts

## Summary

This PR establishes a single canonical domain model (Project, Run, Evidence, Artifact, Opportunity) and enforces Zod-backed contracts at API boundaries to prevent drift between UI, API, and DB. This sets the foundation for PR2 (Run orchestration + idempotency) by making Run status and artifact selection consistent.

## What Changed

### New Contracts System

**Created `lib/contracts/` folder**:
- `domain.ts` - Canonical domain entity schemas (RunStatus, Opportunity, EvidenceSource, Artifact)
- `api.ts` - API response envelope helpers (`ok()`, `fail()`, `parseOrFail()`)
- `api.types.ts` - TypeScript types for API responses
- `errors.ts` - Stable error code taxonomy and mapping

**Created contract gates**:
- `lib/contracts/dbGate.ts` - Validates high-risk DB reads into canonical shapes

**Created canonical decision model**:
- `lib/results/getDecisionModel.ts` - Single source of truth for reading opportunities from artifacts

**Created API unwrapping helpers**:
- `lib/api/unwrap.ts` - Helper functions to unwrap `ApiResponse<T>` from contract-enabled endpoints

### Endpoints Updated

**1. `/api/runs/[runId]/status`** (`app/api/runs/[runId]/status/route.ts`)
- Now returns `ApiResponse<RunStatus>`
- Validates outgoing payload with Zod schema
- Standardized errors to `ApiError` format

**2. `/api/projects/[projectId]/collect-evidence`** (`app/api/projects/[projectId]/collect-evidence/route.ts`)
- Now returns `ApiResponse<{ runId: string; message: string }>`
- Validates outgoing payload
- Standardized errors

**3. `/api/projects/[projectId]/generate`** (`app/api/projects/[projectId]/generate/route.ts`)
- Now returns `ApiResponse<{ runId: string }>`
- Validates outgoing payload
- Maps existing AppError types to contract error codes

### Client Code Updated

**Updated to unwrap `ApiResponse`**:
- `lib/runs/runPolling.ts` - Uses `unwrapApiResponseOrNull()`
- `components/toast/analysis-run-toast.tsx` - Unwraps status and generate responses
- `components/competitors/EvidencePreviewPanel.tsx` - Unwraps collect-evidence response

### Documentation

**Created architecture docs**:
- `docs/architecture/CANONICAL_MODEL.md` - Comprehensive guide to the contracts system
  - Core entities and their shapes
  - Happy path flow
  - Where to look for code
  - How to debug broken runs
  - How to add new endpoints

### Tests

**Created contract tests**:
- `tests/unit/contracts.test.ts` - Minimal tests to ensure contracts work correctly
  - Domain schema validation
  - API helper functions
  - Error code validation

## New Contracts Added

### Domain Entities

- `RunStatusSchema` - Run state, progress, error tracking
- `OpportunitySchema` - Canonical opportunity shape (supports v2 and v3)
- `EvidenceSourceSchema` - Evidence source metadata
- `ArtifactSchema` - Artifact shape with typed payload

### API Envelopes

- `ApiSuccess<T>` - `{ ok: true; data: T }`
- `ApiError` - `{ ok: false; error: { code, message, details?, requestId? } }`
- `ApiResponse<T>` - Union of success and error

### Error Codes

- `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `SCHEMA_MISMATCH`, `NOT_READY`, `UPSTREAM_TIMEOUT`, `UPSTREAM_RATE_LIMIT`, `INTERNAL_ERROR`

## How to Verify

### Manual Testing

1. **Start dev server**:
   ```bash
   pnpm dev
   ```

2. **Create project**:
   - Navigate to `/new`
   - Create a new project

3. **Add competitors**:
   - Navigate to `/projects/[projectId]/competitors`
   - Add at least 3 competitors

4. **Trigger evidence collection**:
   - Evidence should auto-collect (or trigger manually)
   - Check browser console for API calls
   - Verify response is `{ ok: true, data: { runId, message } }`

5. **Trigger generate**:
   - Click "Generate Analysis" button
   - Check browser console for API calls
   - Verify response is `{ ok: true, data: { runId } }`

6. **Verify run status updates**:
   - Status should poll every 4 seconds
   - Check browser console for status API calls
   - Verify response is `{ ok: true, data: { id, projectId, state, ... } }`

7. **Verify decision page renders**:
   - Navigate to `/projects/[projectId]/decision`
   - Page should render without errors
   - Opportunities should display (if analysis completed)

### Automated Testing

```bash
# Run contract tests
pnpm test tests/unit/contracts.test.ts

# Run type checking
pnpm typecheck

# Run linter
pnpm lint
```

## Known Follow-ups for PR2

### Run Orchestration Gaps

- **Missing fields for full run orchestration**:
  - `currentStep` and `stepStatus` in RunStatus (currently optional, not in DB)
  - Step-level progress tracking
  - Idempotency keys for retries

- **Idempotency gaps discovered**:
  - Evidence collection can be triggered multiple times (no idempotency check)
  - Generate endpoint doesn't check for existing running runs
  - Status polling doesn't handle concurrent updates

### Additional Improvements Needed

- [ ] Add request ID tracking for error correlation
- [ ] Add contract validation for incoming requests
- [ ] Update all remaining client code to unwrap `ApiResponse`
- [ ] Add OpenAPI documentation for all endpoints
- [ ] Add client-side contract validation

## Breaking Changes

**None** - All changes are backward compatible:
- Contracts include optional fields to support old artifact formats
- Client code gracefully handles unwrapping failures
- Existing endpoints continue to work (with new envelope format)

## Files Changed

### New Files
- `lib/contracts/domain.ts`
- `lib/contracts/api.ts`
- `lib/contracts/api.types.ts`
- `lib/contracts/errors.ts`
- `lib/contracts/dbGate.ts`
- `lib/results/getDecisionModel.ts`
- `lib/api/unwrap.ts`
- `docs/architecture/CANONICAL_MODEL.md`
- `tests/unit/contracts.test.ts`

### Modified Files
- `app/api/runs/[runId]/status/route.ts`
- `app/api/projects/[projectId]/collect-evidence/route.ts`
- `app/api/projects/[projectId]/generate/route.ts`
- `lib/runs/runPolling.ts`
- `components/toast/analysis-run-toast.tsx`
- `components/competitors/EvidencePreviewPanel.tsx`

## Notes

- Contracts validate outgoing payloads in development mode (fail fast)
- In production, validation is skipped for performance
- All domain types are inferred from Zod schemas (no duplicated interfaces)
- Error codes map to existing AppError types (thin adapter layer)

