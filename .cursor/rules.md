These rules are authoritative. If unclear, ask before generating code.

# Cursor Rules — Plinth

## 1. Schema Authority
- Cursor must NEVER assume a database column exists unless it is defined in /docs/DATA_MODEL.md.
- If a column is missing, propose a migration instead of using it.

## 2. No Derived State in `projects`
- The `projects` table must not store derived fields (e.g. latest_run_id, coverage, confidence).
- Derived data must be computed from related tables at read time.

## 3. Evidence Integrity
- All evidence must originate from `evidence_sources`.
- LLMs may summarize evidence but must not invent sources, facts, or confidence.
- If evidence is missing, the UI must prompt to collect more.

## 4. Centralized Normalization
- Evidence types, scoring buckets, and status mappings must be defined in a single helper.
- No ad-hoc normalization or duplicated maps are allowed.

## 5. Guarded Queries
- All server-side queries must tolerate empty state:
  - no competitors
  - no evidence
  - no runs
- Pages must fail open with a clear empty or error state.

## 6. Marketing Isolation
- Marketing pages must not import:
  - Supabase clients
  - server actions
  - app-only logic
- Marketing previews may use static or sample data only.

## 7. Single Analysis Entry Flow
- All "Start analysis" or "Try" CTAs must route through /new.
- No parallel analysis flows are allowed.

