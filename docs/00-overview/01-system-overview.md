# System Overview

**Purpose**: This document provides a narrative walkthrough of how StratOSphere works from a user's perspective and how the system processes their requests.

**When to read this**: Read this first if you want to understand the end-to-end flow before diving into architecture or data model details.

**Related docs**: 
- [02-core-entities.md](./02-core-entities.md) - Core data entities
- [../PRD.md](../PRD.md) - Product requirements
- [../../strat-os-phere/docs/ARCHITECTURE.md](../../strat-os-phere/docs/ARCHITECTURE.md) - Implementation architecture

---

## What the User Does

A strategy professional using StratOSphere:

1. **Creates a project** by describing their market, target customer, and business goals
2. **Adds competitors** (3-7) by searching for them or pasting URLs
3. **Generates evidence** for each competitor (automated web search and scraping)
4. **Reviews evidence** and may answer follow-up questions to clarify gaps or conflicts
5. **Generates analysis** which produces ranked opportunities with citations
6. **Inspects results** including opportunities, competitor profiles, strategic bets, and evidence sources

## What the System Does

### Phase 1: Evidence Harvest

When a user adds a competitor or triggers evidence generation:

1. **Search**: System searches the web (via Tavily or SerpAPI) to find the competitor's website
2. **Target URLs**: System identifies target pages (homepage, pricing, features, docs, reviews, jobs, changelog, status)
3. **Fetch & Extract**: System fetches up to 5 pages per competitor, extracts readable text (max 12,000 chars per page)
4. **Cache**: Extracted content is stored in `evidence_cache` table with normalized URLs and content hashes (24-hour TTL)
5. **Shortlist**: System uses a two-pass approach:
   - **Pass A**: Fast LLM triage generates summaries for all fetched pages
   - **Pass B**: Only shortlisted pages (2 pricing, 2 docs, 1 changelog, 1 jobs, 2 reviews, 1 status, plus highest coverage) are used in deep analysis
6. **Store Sources**: Evidence sources are stored in `evidence_sources` table with citations metadata

**Where data is stored**: `evidence_cache`, `evidence_sources`

### Phase 2: Evidence Normalization

After evidence harvest:

1. **Claim Extraction**: System extracts structured claims from evidence (pricing, docs, reviews, jobs, changelog, status, marketing)
2. **Deduplication**: Claims are deduplicated using Jaccard similarity (max 25 claims total)
3. **Support Strength**: Each claim is scored for support strength (strong: 2+ citations OR first-party + third-party; medium: 1 first-party; weak: otherwise)
4. **Recency**: System computes recency decay factor based on evidence age
5. **Follow-up Questions**: System may generate one optional clarifying question if there are conflicts, gaps, or low confidence

**Where data is stored**: Claims are computed on-demand (not stored), follow-up answers stored in `artifacts` table as `followup_v1` type

### Phase 3: Analysis Generation

When user triggers "Generate Analysis":

1. **Input Validation**: System checks auth, project access, and competitor count (3-7)
2. **Competitor Snapshots**: For each competitor:
   - System builds prompt with project context + competitor evidence (truncated to 12,000 chars)
   - Calls LLM to generate competitor snapshot (value proposition, target customer, pricing, features, differentiators, risks, evidence quotes)
   - Validates output against schema, repairs if needed (single repair attempt)
3. **Market Synthesis**: System synthesizes all snapshots:
   - Builds prompt with project context + all competitor snapshots
   - Calls LLM to generate market synthesis (market summary, competitive landscape, trends, opportunities, risks)
   - Validates and repairs if needed
4. **Opportunities Generation**: System generates ranked opportunities:
   - Extracts JTBD (Jobs-to-be-Done) from evidence
   - Scores opportunities based on evidence quality, recency, and guardrails
   - Applies score ceilings based on confidence level
   - Groups citations by claim
5. **Artifact Storage**: All outputs stored as append-only artifacts in `artifacts` table:
   - `profiles` artifact: Competitor snapshots
   - `synthesis` artifact: Market synthesis
   - `opportunities_v3` artifact: Ranked opportunities with JTBD
   - `strategic_bets` artifact: Strategic recommendations
   - `jtbd` artifact: Jobs-to-be-Done analysis

**Where data is stored**: `artifacts` table (append-only, never overwritten)

### Phase 4: Results Presentation

When user views results:

1. **Artifact Loading**: System loads all artifacts for the project
2. **Normalization**: System normalizes artifacts (handles v1/v2/v3 versions, prefers newest schema_version, then newest created_at)
3. **Evidence Summary**: System derives evidence summary from citations in all artifacts
4. **Rendering**: System renders opportunities-first view with:
   - Ranked opportunities with scores, citations, confidence bands
   - Evidence & Confidence panel showing coverage, recency, quality
   - Competitor profiles tab
   - Strategic bets tab
   - Evidence inspection (claims drawer, source list)

**Where data is read**: `artifacts` table, `evidence_sources` table, `evidence_cache` table

## What Constitutes "Trust"

The system establishes trust through:

1. **Citations**: Every claim must have real evidence sources with URLs. No invented citations.

2. **Coverage**: System tracks evidence coverage:
   - Number of distinct source types (pricing, docs, reviews, jobs, changelog, status, marketing)
   - Number of evidence sources per competitor
   - Evidence quality score (high/medium/low based on source diversity)

3. **Confidence**: System computes confidence bands (low/medium/high) based on:
   - Evidence quality
   - Evidence recency (decay factor)
   - LLM repair count (fewer repairs = higher confidence)
   - Banned pattern violations (vague verbs, unsupported absolutes)
   - Score distribution (flags flat distributions or extreme outliers)

4. **Guardrails**: System applies multiple guardrails:
   - Evidence quality checks (gates low-quality inputs)
   - Score ceilings (caps scores based on confidence level)
   - Banned pattern detection (penalizes vague language)
   - Drift detection (tracks changes across runs)

5. **Transparency**: Users can inspect:
   - Evidence sources (raw URLs and extracted text)
   - Claims (structured statements with citations)
   - Citations (grouped by claim, with support strength and recency)
   - Confidence bands (visible on opportunities and scores)

## Next Steps

- Read [02-core-entities.md](./02-core-entities.md) to understand the core data entities
- Read [../../strat-os-phere/docs/DATA_MODEL.md](../../strat-os-phere/docs/DATA_MODEL.md) for database schema details
- Read [../../strat-os-phere/docs/GUARDRAILS.md](../../strat-os-phere/docs/GUARDRAILS.md) for guardrail implementation details

