# Implementation Documentation

**Purpose**: This folder contains implementation source of truth for StratOSphere's architecture, data model, and development workflows.

**When to read this**: Read these docs when you need to understand how the system is implemented, what the code structure looks like, or how to make changes.

**Related docs**: 
- [../../docs/README.md](../../docs/README.md) - Main documentation entry point with reading path
- [../../docs/00-overview/](../../docs/00-overview/) - Narrative overview documents

---

## This Folder is Implementation Truth

The documents in this folder describe **how the system works today**. They are the source of truth for:
- System architecture and module organization
- Database schema and data access patterns
- Development workflows and build policies
- Analysis pipeline and evidence generation
- Guardrails and quality checks

For product intent, design decisions, and historical context, see the [../../docs/](../../docs/) folder.

## Documentation Index

### Architecture & Design

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - High-level system design, module organization, data flow, and how to add new modules
- **[ANALYSIS_PIPELINE.md](./ANALYSIS_PIPELINE.md)** - How competitive analysis generation works end-to-end (LLM calls, validation, artifact storage)

### Data Model

- **[DATA_MODEL.md](./DATA_MODEL.md)** - Database schema, table definitions, relationships, and data access patterns
- **[MIGRATIONS.md](./MIGRATIONS.md)** - SQL migrations for schema changes

### Evidence System

- **[EVIDENCE_GENERATION.md](./EVIDENCE_GENERATION.md)** - Web search and scraping for evidence generation, evidence cache, and source storage

### Operations & Quality

- **[GUARDRAILS.md](./GUARDRAILS.md)** - Layered guardrail system for stable, trustworthy outputs (evidence quality, scoring, drift detection)
- **[DEV_WORKFLOW.md](./DEV_WORKFLOW.md)** - Development workflow, build policies, and when to use `preflight` vs `build`

### Additional Documentation

- **[../docs/](../../docs/)** - Product docs, PR summaries, and design decisions
- **[../docs/00-overview/](../../docs/00-overview/)** - Narrative overview documents

## Quick Reference

**Need to understand the system flow?**
→ Start with [../../docs/00-overview/01-system-overview.md](../../docs/00-overview/01-system-overview.md), then read [ANALYSIS_PIPELINE.md](./ANALYSIS_PIPELINE.md)

**Need to modify the database schema?**
→ Read [DATA_MODEL.md](./DATA_MODEL.md) and [MIGRATIONS.md](./MIGRATIONS.md)

**Need to add a new artifact type?**
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md) section "Adding New Modules" and [DATA_MODEL.md](./DATA_MODEL.md) section "Adding New Artifact Types"

**Need to improve evidence quality?**
→ Read [EVIDENCE_GENERATION.md](./EVIDENCE_GENERATION.md) and [../../docs/EVIDENCE_CLAIMS.md](../../docs/EVIDENCE_CLAIMS.md)

**Need to understand guardrails?**
→ Read [GUARDRAILS.md](./GUARDRAILS.md) and [../../docs/00-overview/03-definition-of-done.md](../../docs/00-overview/03-definition-of-done.md)

## Maintenance Notes

- Keep these docs updated when making architectural changes
- Prefer adding new sections over rewriting existing ones
- Link to related docs in both `/docs` and `/strat-os-phere/docs` folders
- When in doubt, link to the main [../../docs/README.md](../../docs/README.md) for navigation

