# Canonical Domain Model & Contracts

**Purpose**: Defines the single source of truth for domain entity shapes and API contracts. This document explains how to use the contracts system to prevent drift between UI, API, and DB.

**When to read this**: Read this when:
- Adding or modifying API endpoints
- Understanding how domain entities are structured
- Debugging schema mismatches or contract violations
- Onboarding new developers

**Related docs**:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system architecture
- [../data/DATA_MODEL.md](../data/DATA_MODEL.md) - Database schema
- [../../docs/OPPORTUNITY_MODEL.md](../../docs/OPPORTUNITY_MODEL.md) - Opportunity model reference

**Last updated**: 2025-01-27

---

## Overview

The canonical model system establishes **Zod-backed contracts** at API boundaries to prevent drift between:
- UI expectations
- API response shapes
- Database schema

All domain entities are defined in `lib/contracts/domain.ts` as Zod schemas, with TypeScript types inferred from the schemas (no duplicated interfaces).

## Core Entities

### Run Status

**Schema**: `RunStatusSchema` in `lib/contracts/domain.ts`

**Shape**:
```typescript
{
  id: string (UUID)
  projectId: string (UUID)
  state: 'queued' | 'running' | 'completed' | 'failed'
  currentStep?: 'context' | 'evidence' | 'analysis' | 'opportunities'
  stepStatus?: string
  createdAt: string (ISO datetime)
  updatedAt: string (ISO datetime)
  error?: { code: string; message: string; details?: Record<string, unknown> }
  progress?: { completed?: number; total?: number }
}
```

**Used by**:
- `/api/runs/[runId]/status` - Returns `ApiResponse<RunStatus>`
- Run status polling hooks
- Toast notifications

### Opportunities

**Schema**: `OpportunitySchema` in `lib/contracts/domain.ts`

**Shape**: See `lib/contracts/domain.ts` for full schema. Supports both v2 and v3 artifact formats with optional fields for backward compatibility.

**Used by**:
- Decision page (`/projects/[projectId]/decision`)
- `getDecisionModel()` function
- Opportunities list views

### Evidence Sources

**Schema**: `EvidenceSourceSchema` in `lib/contracts/domain.ts`

**Shape**:
```typescript
{
  url: string
  title?: string
  snippet?: string
  retrievedAt?: string (ISO datetime)
  provider?: string
  confidence?: 'low' | 'medium' | 'high' | number
  score?: number
}
```

**Used by**:
- Evidence collection endpoints
- Evidence preview components

### Artifacts

**Schema**: `ArtifactSchema` in `lib/contracts/domain.ts`

**Shape**:
```typescript
{
  id: string (UUID)
  projectId: string (UUID)
  runId?: string (UUID)
  type: string
  version?: string
  createdAt: string (ISO datetime)
  payload: unknown // Validated per artifact type when read
}
```

## API Response Envelopes

All API responses follow a consistent envelope pattern:

**Success**:
```typescript
{ ok: true; data: T }
```

**Error**:
```typescript
{ ok: false; error: { code: string; message: string; details?: Record<string, unknown>; requestId?: string } }
```

**Helper functions** (in `lib/contracts/api.ts`):
- `ok(data)` - Create success response
- `fail(code, message, details?)` - Create error response
- `parseOrFail(schema, value)` - Validate and parse with error handling

## Error Codes

Stable error code taxonomy (see `lib/contracts/errors.ts`):

- `UNAUTHENTICATED` - User not signed in
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource doesn't exist
- `VALIDATION_ERROR` - Input validation failed
- `SCHEMA_MISMATCH` - DB schema doesn't match code
- `NOT_READY` - Prerequisites not met (e.g., insufficient competitors)
- `UPSTREAM_TIMEOUT` - External service timeout
- `UPSTREAM_RATE_LIMIT` - External service rate limit
- `INTERNAL_ERROR` - Unexpected server error

## Happy Path Flow

### 1. Context → Evidence → Analysis → Opportunities

```
User creates project
  ↓
User adds competitors (3-7)
  ↓
POST /api/projects/[projectId]/collect-evidence
  → Returns: ApiResponse<{ runId, message }>
  → Background: Evidence collection runs
  ↓
POST /api/projects/[projectId]/generate
  → Returns: ApiResponse<{ runId }>
  → Background: Analysis pipeline runs
  ↓
GET /api/runs/[runId]/status (polled)
  → Returns: ApiResponse<RunStatus>
  → Status: 'queued' → 'running' → 'completed'
  ↓
GET /projects/[projectId]/decision (server component)
  → Uses: getDecisionModel() to read opportunities
  → Returns: Opportunities in canonical shape
```

### 2. Key Endpoints

**Evidence Collection**:
- Route: `POST /api/projects/[projectId]/collect-evidence`
- Response: `ApiResponse<{ runId: string; message: string }>`
- File: `app/api/projects/[projectId]/collect-evidence/route.ts`

**Generate Analysis**:
- Route: `POST /api/projects/[projectId]/generate`
- Response: `ApiResponse<{ runId: string }>`
- File: `app/api/projects/[projectId]/generate/route.ts`

**Run Status**:
- Route: `GET /api/runs/[runId]/status`
- Response: `ApiResponse<RunStatus>`
- File: `app/api/runs/[runId]/status/route.ts`

**Decision Model**:
- Function: `getDecisionModel(supabase, projectId)`
- Returns: `{ opportunities: Opportunity[]; runId: string | null; generatedAt: string | null }`
- File: `lib/results/getDecisionModel.ts`

## Where to Look

### Contracts
- `lib/contracts/domain.ts` - Domain entity schemas
- `lib/contracts/api.ts` - API response helpers
- `lib/contracts/api.types.ts` - API response types
- `lib/contracts/errors.ts` - Error code taxonomy

### Route Handlers
- `app/api/projects/[projectId]/collect-evidence/route.ts`
- `app/api/projects/[projectId]/generate/route.ts`
- `app/api/runs/[runId]/status/route.ts`

### Results Assembly
- `lib/results/getDecisionModel.ts` - Canonical decision model
- `lib/results/normalizeResults.ts` - Artifact normalization

### Data Access
- `lib/data/runs.ts` - Run CRUD
- `lib/data/artifacts.ts` - Artifact CRUD
- `lib/contracts/dbGate.ts` - Contract gates for DB reads

## How to Debug a Broken Run

1. **Check run status**:
   ```bash
   GET /api/runs/[runId]/status
   ```
   - Should return `ApiResponse<RunStatus>`
   - Check `state` field: `'queued' | 'running' | 'completed' | 'failed'`
   - If `'failed'`, check `error` field

2. **Check artifacts**:
   - Query `artifacts` table for `project_id`
   - Look for artifacts with `run_id` in `content_json`
   - Expected types: `'profiles'`, `'synthesis'`, `'opportunities_v3'`, etc.

3. **Check evidence**:
   - Query `evidence_sources` table for `project_id` and `run_id`
   - Should have sources for each competitor

4. **Check logs**:
   - Server logs: Look for `[collect-evidence]` and `[generate]` prefixes
   - Client logs: Check browser console for API errors

5. **Validate contracts**:
   - In dev mode, contracts validate outgoing payloads
   - Check console for `[Contract Violation]` warnings

## Contract Validation

### Development Mode

In development, contracts validate **outgoing** payloads before sending:
- If validation fails, throws error (fail fast)
- Logs violation details to console

### Production Mode

In production, validation is skipped for performance, but schemas are still used for:
- Type inference
- Documentation
- Client-side validation (if implemented)

## Adding a New Endpoint

1. **Define response schema** in the route file:
   ```typescript
   const MyResponseSchema = z.object({ ... })
   ```

2. **Use contract helpers**:
   ```typescript
   import { ok, fail } from '@/lib/contracts/api'
   
   // Success
   return NextResponse.json(ok(validatedData))
   
   // Error
   return NextResponse.json(fail('ERROR_CODE', 'Message', { details }))
   ```

3. **Validate outgoing payload** (dev mode):
   ```typescript
   const validated = MyResponseSchema.parse(responseData)
   return NextResponse.json(ok(validated))
   ```

4. **Update client code** to unwrap `ApiResponse`:
   ```typescript
   const response = await fetch('/api/...')
   const result = await response.json()
   if (result.ok) {
     // Use result.data
   } else {
     // Handle result.error
   }
   ```

## Known Limitations

- **Backward compatibility**: Contracts include optional fields to support old artifact formats
- **DB schema drift**: Contract gates (`lib/contracts/dbGate.ts`) help catch mismatches, but don't prevent them
- **Client unwrapping**: Not all client code has been updated to unwrap `ApiResponse` yet (work in progress)

## Future Work

- [ ] Add client-side `ApiResponse` unwrapping helper
- [ ] Add contract validation for incoming requests
- [ ] Add automated contract tests
- [ ] Document all endpoints in OpenAPI format
- [ ] Add request ID tracking for error correlation

