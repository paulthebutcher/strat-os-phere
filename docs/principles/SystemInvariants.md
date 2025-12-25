# System Invariants & Guardrails

**Purpose**: Defines the core system invariants that must always be true and how violations are handled.

**When to read this**: Read this to understand the foundational rules that prevent drift and trust failures. Required reading before making changes to analysis generation, evidence handling, or project data access.

**Related docs**:
- [../strat-os-phere/docs/guards/GUARDRAILS.md](../strat-os-phere/docs/guards/GUARDRAILS.md) - Guardrail system for AI analysis quality
- [Decisions.md](./Decisions.md) - Architectural decisions
- [../strat-os-phere/docs/architecture/ARCHITECTURE.md](../strat-os-phere/docs/architecture/ARCHITECTURE.md) - System architecture

---

## What Are System Invariants?

System invariants are properties that must always be true for the system to function correctly and maintain user trust. These are not feature flags or preferences—they are hard constraints that prevent silent failures and data integrity issues.

This document defines:
1. **What must always be true** (invariants)
2. **What happens when invariants are violated** (error handling)
3. **Where invariants are enforced** (code locations)

---

## A) System Invariants (Must Always Be True)

### INV-1: Evidence Must Be Harvested Before LLM Analysis

**Invariant**: Evidence must be harvested and stored in `evidence_sources` (or equivalent store) before it can be consumed by LLM analysis.

**Rationale**: Citations must reference real, stored evidence records. We cannot allow LLMs to "invent" citations that don't exist in our database. This prevents hallucinated sources and maintains auditability.

**What this means**:
- Analysis runs MUST check for evidence existence before starting LLM generation
- Evidence coverage thresholds MUST be met before analysis proceeds
- No analysis should proceed if no evidence sources exist for the project

**Violation**: Attempting to generate analysis without evidence stored in the database.

---

### INV-2: Citations Must Reference Stored Evidence

**Invariant**: All citations in opportunities, claims, and analysis outputs MUST reference only URLs/IDs from stored `evidence_sources` records (or equivalent store like `evidence_bundle_v1` artifacts).

**Rationale**: Citations without backing evidence records cannot be verified, audited, or displayed to users. This ensures traceability from analysis outputs back to source data.

**What this means**:
- When building evidence bundles for LLM prompts, all URLs must come from stored evidence
- Citations returned by LLMs must be validated against allowed URLs from evidence bundles
- Citations without matching evidence sources must be dropped (not used)

**Violation**: A citation references a URL that doesn't exist in any stored evidence record.

---

### INV-3: Readiness Gating Must Be Deterministic

**Invariant**: "Readiness gating" rules (deciding if analysis can proceed) must be deterministic and based solely on stored evidence coverage metrics, not on LLM outputs or external API calls.

**Rationale**: Readiness must be predictable and reproducible. Users should always see the same readiness state for the same evidence state.

**What this means**:
- Readiness checks must only query database records (evidence_sources, competitors, etc.)
- Readiness thresholds must be based on counts/types of stored evidence, not subjective quality metrics
- Readiness state must be computable without external API calls

**Violation**: Readiness check depends on LLM evaluation or external API responses.

---

### INV-4: Missing Optional Data Must Not Crash Pages

**Invariant**: Missing optional data (no evidence yet, no runs yet, etc.) must never crash pages. UI must show appropriate empty states, CTAs, or safe fallbacks.

**Rationale**: Users often land on pages with incomplete data (new projects, projects in progress). The system must gracefully handle these states without throwing errors.

**What this means**:
- Project pages must handle missing evidence gracefully (show "Add evidence" CTA, not error)
- Pages must handle missing run history gracefully (show empty state, not crash)
- Database queries for optional data must use safe error handling patterns

**Violation**: A page crashes or shows a generic error when optional data (evidence, runs) is missing.

---

### INV-5: Project Pages Must Use Safe Selects

**Invariant**: Project pages must never query non-existent columns. All database selects must use stable, versioned column lists (e.g., `PROJECT_DASHBOARD_SELECT`) or safe contracts (e.g., `listProjectsForOwnerSafe`).

**Rationale**: Schema drift can cause production outages if queries reference columns that don't exist. Safe selects prevent this by using whitelisted, stable column lists.

**What this means**:
- All project queries must use functions from `lib/data/projectsContract.ts` or safe select constants
- Direct `.select('*')` or dynamic column lists are forbidden for project queries
- Missing column errors must be detected and handled gracefully (return schema mismatch error, not crash)

**Violation**: A project page query references a column that doesn't exist in production schema.

---

## B) What To Do When Invariants Are Violated

### Error Type Mapping

When an invariant is violated, map it to one of these error types:

#### NotReady
**When**: Invariant prevents operation from proceeding (INV-1, INV-3)  
**User sees**: Clear message explaining what's missing + CTA to fix it (e.g., "Add evidence for at least 3 competitors")  
**Developer sees**: Structured log with `invariantId`, `projectId`, `details`  
**Example**: "Evidence coverage insufficient: Need evidence for 2 more competitors"

#### SchemaMismatch
**When**: Database schema doesn't match code expectations (INV-5)  
**User sees**: "Data mismatch" message with recovery options (try again, create new analysis)  
**Developer sees**: Structured log with `invariantId`, `route`, `missingColumn`, `query`  
**Example**: "Column 'latest_run_id' does not exist in 'projects' table"

#### ExternalFetch
**When**: External dependency fails but operation can degrade (rare for invariants)  
**User sees**: Degraded functionality with explanation  
**Developer sees**: Structured log with `invariantId`, `externalService`, `error`

### Structured Log Format

All invariant violations must log structured data:

```typescript
{
  type: 'invariant_violation',
  invariantId: 'INV-1' | 'INV-2' | 'INV-3' | 'INV-4' | 'INV-5',
  projectId?: string,
  route?: string,
  context?: string,
  details: {
    // Safe, non-PII details
    message: string,
    // ... additional context
  }
}
```

### User-Facing Error Handling

- **NotReady errors**: Return structured result (e.g., `{ ok: false, error: { code: 'NOT_READY', message: '...', details: {...} } }`) that UI can render as actionable CTAs
- **SchemaMismatch errors**: Detect missing columns, return schema mismatch error, show recoverable error state
- **Never crash**: All invariant violations must be caught and converted to structured errors

---

## C) Where Invariants Are Enforced in Code

### INV-1: Evidence Must Be Harvested Before LLM Analysis

**Enforced in**:
- `lib/analysis/runProjectAnalysis.ts` (lines ~260-335)
  - Checks `evidence_sources` table exists and has records
  - Checks evidence coverage meets readiness thresholds via `getEvidenceCoverage()` and `evaluateReadiness()`
  - Returns `INSUFFICIENT_EVIDENCE` or `INSUFFICIENT_EVIDENCE_COVERAGE` error codes if invariant violated

**Guard implementation**: Uses `invariant()` helper from `lib/guardrails/invariants.ts`

---

### INV-2: Citations Must Reference Stored Evidence

**Enforced in**:
- `lib/evidence/citations.ts` - `formatEvidenceBundleForPrompt()` (returns `allowedUrls` Set)
- `lib/results/generateOpportunitiesV3.ts` (lines ~367-412)
  - Validates citations against `allowedUrls` from evidence bundle
  - Drops citations not in allowed set
  - Logs warnings for dropped citations

**Guard implementation**: Uses `invariant()` helper to validate citations match stored evidence URLs

---

### INV-3: Readiness Gating Must Be Deterministic

**Enforced in**:
- `lib/evidence/readiness.ts` - `evaluateReadiness()`
  - Only queries database records (evidence coverage metrics)
  - No LLM calls or external APIs
  - Deterministic thresholds: `MIN_COMPETITORS_WITH_EVIDENCE`, `MIN_EVIDENCE_TYPES_COVERED`

**Guard implementation**: Readiness logic is pure function based on coverage data

---

### INV-4: Missing Optional Data Must Not Crash Pages

**Enforced in**:
- `app/dashboard/page.tsx` (lines ~57-113)
  - Uses `listProjectsForOwnerSafe()` with error handling
  - Shows `PageErrorState` for recoverable errors, `EmptyState` for no projects
  - Never throws, always renders something
- All project page loaders should follow this pattern

**Guard implementation**: Uses safe contract functions that return Result types, never throw

---

### INV-5: Project Pages Must Use Safe Selects

**Enforced in**:
- `lib/data/projectsContract.ts`
  - All project queries use `PROJECT_FULL_SELECT` or `PROJECT_DASHBOARD_SELECT` constants
  - Functions detect missing column errors and return `isMissingColumn: true` in error result
- `app/dashboard/page.tsx` (lines ~58-113)
  - Uses `listProjectsForOwnerSafe()` which handles missing columns gracefully
  - Detects `isMissingColumn` flag and shows schema mismatch error state

**Guard implementation**: Safe contract functions + invariant checks for missing column errors

---

## Usage

### Adding a New Invariant Check

1. Add invariant definition to section A above
2. Add enforcement location to section C above
3. Use `invariant()` helper from `lib/guardrails/invariants.ts`:

```typescript
import { invariant } from '@/lib/guardrails/invariants'

// In production: logs warning, returns false (doesn't throw)
// In development: can throw or warn (configurable)
const isValid = invariant(
  evidenceSources.length > 0,
  {
    invariantId: 'INV-1',
    projectId,
    context: 'evidence_check',
    details: { message: 'No evidence sources found' }
  }
)

if (!isValid) {
  // Handle violation - return structured error, don't proceed
  return { ok: false, error: { code: 'NOT_READY', message: '...' } }
}
```

---

## Maintenance

- **When to update**: Add new invariants when discovering new failure modes that cause drift or trust issues
- **When not to update**: Don't add invariants for feature flags, business logic preferences, or temporary constraints
- **Review frequency**: Review during architecture reviews or when investigating production issues

