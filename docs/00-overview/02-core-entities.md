# Core Entities

**Purpose**: This document explains the core data entities in plain English and their relationships.

**When to read this**: Read this to understand what data the system stores and how entities relate to each other before diving into schema details.

**Related docs**:
- [../../strat-os-phere/docs/DATA_MODEL.md](../../strat-os-phere/docs/DATA_MODEL.md) - Database schema and relationships
- [01-system-overview.md](./01-system-overview.md) - System flow context

---

## Project

**What it is**: A competitive analysis project owned by a user. This is the top-level container.

**Stable fields** (stored in `projects` table):
- `id`: Unique identifier
- `user_id`: Owner (references auth.users)
- `name`: Project name
- `created_at`: Creation timestamp

**Evolving fields** (stored in `project_inputs` table as versioned JSON):
- Market context, target customer, business goals
- Onboarding inputs (market category, primary constraint, pricing model, etc.)
- Hypothesis, problem statement, customer profile
- Decision framing, context text
- Competitor suggestions and selections
- Evidence window preferences

**Why separate**: The `projects` table should not be a dumping ground for evolving fields. All onboarding and context fields live in `project_inputs` to prevent schema drift.

## Project Inputs

**What it is**: Versioned JSON storage for all evolving project fields. Supports draft/final workflow.

**Fields**:
- `id`: Unique identifier
- `project_id`: References project
- `version`: Version number (auto-incremented)
- `status`: 'draft' or 'final'
- `input_json`: JSONB containing all evolving fields
- `created_at`: Creation timestamp

**Access pattern**: Use `getLatestProjectInput()` to get the latest final or draft input. New drafts are created with concurrency-safe versioning.

## Competitors

**What it is**: A competitor being analyzed in a project. Each project has 3-7 competitors.

**Fields**:
- `id`: Unique identifier
- `project_id`: References project
- `name`: Competitor name
- `url`: Competitor website URL (optional)
- `evidence_text`: Manual or generated evidence text (max 12,000 chars)
- `evidence_citations`: JSONB metadata for citations (optional)
- `created_at`: Creation timestamp

**Constraints**: 3-7 competitors per project (enforced in application code).

## Evidence Sources

**What it is**: Scraped web content from competitor websites. Stores raw extracted text from pages.

**Fields**:
- `id`: Unique identifier
- `project_id`: References project
- `competitor_id`: References competitor (optional, can be linked later)
- `domain`: Domain name for caching/grouping
- `url`: Full URL of scraped page
- `extracted_text`: Cleaned text content (max 12k chars)
- `page_title`: Extracted page title
- `extracted_at`: Timestamp for cache TTL
- `created_at`: Record creation timestamp

**Usage**: Evidence sources are harvested before analysis generation. They provide the raw material for competitor snapshots and opportunities.

## Evidence Cache

**What it is**: Unified cache for fetched content, extractions, and summaries. Reduces redundant fetching.

**Fields**:
- `id`: Unique identifier
- `normalized_url`: Normalized URL (unique, strips UTM params, normalizes hostname)
- `content_hash`: Hash of content for deduplication
- `fetched_at`: When content was fetched
- `http_status`: HTTP status code
- `final_url`: Final URL after redirects
- `title`: Page title
- `raw_text`: Raw extracted text
- `extract_json`: Structured extraction (JSONB)
- `summary_json`: Page summary from Pass A triage (JSONB)
- `summary_prompt_version`: Version of summary prompt used
- `stale_after_days`: TTL (default 7 days)

**Usage**: System checks cache before fetching. Cache hit avoids re-fetch and re-extraction.

## Project Runs

**What it is**: A single analysis generation execution. Tracks run metadata and state.

**Note**: Runs are tracked via artifacts (each artifact has a `run_id` and `generated_at`). The system does NOT store `latest_run_id` or `latest_generated_at` on the `projects` table. Runs are derived from artifacts, not stored directly.

**Why**: This keeps the `projects` table stable and allows full run history to be preserved in append-only artifacts.

## Artifacts

**What it is**: Analysis outputs stored as append-only records. Never overwritten.

**Fields**:
- `id`: Unique identifier
- `project_id`: References project
- `type`: Artifact type ('profiles', 'synthesis', 'opportunities_v3', 'strategic_bets', 'jtbd', 'followup_v1', etc.)
- `content_json`: Artifact content (schema varies by type)
- `created_at`: Creation timestamp

**Types**:
- `profiles`: Competitor snapshots (one per competitor)
- `synthesis`: Market synthesis (landscape summary)
- `opportunities_v3`: Ranked opportunities with JTBD, citations, scores
- `strategic_bets`: Strategic recommendations
- `jtbd`: Jobs-to-be-Done analysis
- `followup_v1`: Follow-up question answers

**Metadata**: Each artifact includes:
- `run_id`: Unique identifier for the run
- `generated_at`: When the artifact was generated
- `schema_version`: Schema version number
- `llm`: Provider, model, token usage
- `meta.signals`: Guardrail signals (repair count, evidence quality, confidence band, etc.)

**Access pattern**: Use `listArtifactsForProject()` to get all artifacts, or `getLatestArtifactsByType()` to get the newest artifact of each type.

## What Should NOT Live on Projects

The following should **never** be stored directly on the `projects` table:

- ❌ `latest_run_id` - Derive from artifacts
- ❌ `latest_generated_at` - Derive from artifacts
- ❌ `latest_opportunities` - Stored in artifacts
- ❌ Onboarding form fields - Stored in `project_inputs`
- ❌ Evolving context fields - Stored in `project_inputs`
- ❌ Run state or status - Derive from artifacts

**Why**: The `projects` table should remain stable. All evolving fields and run state should live in versioned tables (`project_inputs`) or append-only tables (`artifacts`).

## Relationships

```
auth.users
  └─ user_id
      └─ projects (1:N)
          ├─ project_id → project_inputs (1:N, versioned)
          ├─ project_id → competitors (1:N, 3-7)
          ├─ project_id → evidence_sources (1:N)
          └─ project_id → artifacts (1:N, append-only)
                └─ run_id (shared across artifacts in same run)
```

**Access Pattern**: All data access is scoped by `user_id` → `project_id`. Users own projects; competitors, evidence, and artifacts are accessed via projects.

## Next Steps

- Read [../../strat-os-phere/docs/DATA_MODEL.md](../../strat-os-phere/docs/DATA_MODEL.md) for detailed schema definitions
- Read [../../strat-os-phere/docs/ANALYSIS_PIPELINE.md](../../strat-os-phere/docs/ANALYSIS_PIPELINE.md) for how artifacts are generated

