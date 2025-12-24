# Implementation Documentation

**Purpose**: This folder contains implementation-level truth for StratOSphere's architecture, data model, and development workflows.

**When to read this**: Read these docs when you need to understand how the system is built, what the code structure looks like, or how to make changes.

**Related docs**: 
- [../../docs/README.md](../../docs/README.md) - Main documentation entry point (start here for product intent and narrative overview)
- [../../docs/00-overview/](../../docs/00-overview/) - Narrative overview documents

---

## This Folder is Implementation Truth

The documents in this folder describe **how the system is built**, not product intent. They are the source of truth for:
- System architecture and module organization
- Database schema and data access patterns
- Development workflows and build policies
- Analysis pipeline and evidence generation
- Guardrails and quality checks

For product intent, design decisions, and historical context, see the [../../docs/](../../docs/) folder.

## Documentation Index

### Core Implementation Docs

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - High-level system design, module organization, data flow, and how to add new modules
- **[DATA_MODEL.md](./DATA_MODEL.md)** - Database schema, table definitions, relationships, and data access patterns
- **[ANALYSIS_PIPELINE.md](./ANALYSIS_PIPELINE.md)** - How competitive analysis generation works end-to-end (LLM calls, validation, artifact storage)
- **[MIGRATIONS.md](./MIGRATIONS.md)** - SQL migrations for schema changes
- **[DEV_WORKFLOW.md](./DEV_WORKFLOW.md)** - Development workflow, build policies, and when to use `preflight` vs `build`
- **[GUARDRAILS.md](./GUARDRAILS.md)** - Layered guardrail system for stable, trustworthy outputs (evidence quality, scoring, drift detection)

### Additional Implementation Docs

- **[EVIDENCE_GENERATION.md](./EVIDENCE_GENERATION.md)** - Web search and scraping for evidence generation, evidence cache, and source storage
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment procedures and configuration
- **[TESTING.md](./TESTING.md)** - Testing strategies and practices
- **[Auth.md](./Auth.md)** - Authentication and authorization implementation

### Related Documentation

- **[../../docs/README.md](../../docs/README.md)** - Main documentation entry point (product intent, narrative overview)
- **[../../docs/00-overview/](../../docs/00-overview/)** - Narrative overview documents
- **[../../docs/reference/](../../docs/reference/)** - Reference documentation
- **[../../docs/evidence/](../../docs/evidence/)** - Evidence system documentation
- **[../../docs/principles/](../../docs/principles/)** - Design decisions and rules

## Quick Reference

**Need to understand the system flow?**
→ Start with [../../docs/00-overview/01-system-overview.md](../../docs/00-overview/01-system-overview.md), then read [ANALYSIS_PIPELINE.md](./ANALYSIS_PIPELINE.md)

**Need to modify the database schema?**
→ Read [DATA_MODEL.md](./DATA_MODEL.md) and [MIGRATIONS.md](./MIGRATIONS.md)

**Need to add a new artifact type?**
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md) section "Adding New Modules" and [DATA_MODEL.md](./DATA_MODEL.md) section "Adding New Artifact Types"

**Need to improve evidence quality?**
→ Read [EVIDENCE_GENERATION.md](./EVIDENCE_GENERATION.md) and [../../docs/evidence/EVIDENCE_CLAIMS.md](../../docs/evidence/EVIDENCE_CLAIMS.md)

**Need to understand guardrails?**
→ Read [GUARDRAILS.md](./GUARDRAILS.md) and [../../docs/00-overview/03-definition-of-done.md](../../docs/00-overview/03-definition-of-done.md)

## Maintenance Notes

- Keep these docs updated when making architectural changes
- Prefer adding new sections over rewriting existing ones
- Link to related docs in both `/docs` and `/strat-os-phere/docs` folders
- When in doubt, link to the main [../../docs/README.md](../../docs/README.md) for navigation

