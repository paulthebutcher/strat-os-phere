# Do Not Reintroduce — Plinth

**This list grows over time. Add to it whenever a bug is fixed.**

This document lists patterns that have already caused bugs, drift, or rework. They must not be reintroduced.

## Data & Schema

- ❌ **Derived fields on `projects` table** (e.g. `latest_run_id`, `latest_successful_run_id`, `coverage`, `confidence`)
  - These were added in `add_latest_run_fields_to_projects.sql` and had to be removed
  - Derived data must be computed from related tables at read time

- ❌ **Assuming database columns without updating schema docs**
  - Never assume a column exists unless documented in `/docs/reference/Schemas.md` or equivalent
  - Propose a migration instead of using undocumented columns

- ❌ **Multiple sources of truth for the same entity**
  - Don't store the same data in both `projects` table and JSON fields
  - Choose one authoritative source

- ❌ **Adding columns to `projects` for evolving onboarding fields**
  - Use `project_inputs.input_json` instead (see PR-1)
  - Adding columns causes schema drift and migration headaches

## Evidence

- ❌ **Invented evidence or citations**
  - All evidence must originate from `evidence_sources` table
  - LLMs may summarize but must not invent sources, facts, or confidence scores

- ❌ **Evidence summarized without being stored in `evidence_sources`**
  - Evidence must be persisted before use
  - No ad-hoc summarization that bypasses storage

- ❌ **Multiple evidence normalization maps**
  - Evidence types, scoring buckets, and status mappings must be defined in a single helper
  - No duplicated normalization logic across files

## Types & Logic

- ❌ **Duplicated domain types** (e.g. `EvidenceSource` defined in multiple places)
  - Define types once in a central location
  - Import from the source of truth

- ❌ **Ad-hoc normalization logic scattered across files**
  - Centralize all normalization in dedicated helper modules

- ❌ **Implicit assumptions about "latest" data**
  - Always explicitly query for latest runs, inputs, etc.
  - Never assume a field exists on `projects` for "latest" state

## UX & Routing

- ❌ **Multiple analysis entry flows**
  - Everything must go through `/new`
  - No parallel "Start analysis" or "Try" flows that bypass the main entry point

- ❌ **Pages that crash on empty state**
  - All queries must tolerate: no competitors, no evidence, no runs, no inputs
  - Pages must fail open with a clear empty or error state

- ❌ **Generic error messages without next steps**
  - Errors must explain what went wrong and what the user can do about it

## Marketing

- ❌ **Marketing pages importing server actions or app logic**
  - Marketing pages must not import: Supabase clients, server actions, app-only logic
  - Marketing previews may use static or sample data only

- ❌ **Homepage previews relying on real data or schema**
  - Marketing pages must work independently of app schema changes

## Guiding Principle

If unsure, ask or document before implementing.

