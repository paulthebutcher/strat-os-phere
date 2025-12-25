# Implementation Documentation

**Purpose**: This folder contains implementation-level truth for StratOSphere's architecture, data model, and development workflows.

**When to read this**: Read these docs when you need to understand how the system is built, what the code structure looks like, or how to make changes.

**Related docs**: 
- **[onboarding/START_HERE.md](./onboarding/START_HERE.md)** - **Start here!** New developer onboarding guide
- **[INDEX.md](./INDEX.md)** - Complete documentation index
- [../../docs/README.md](../../docs/README.md) - Main documentation entry point (start here for product intent and narrative overview)
- [../../docs/00-overview/](../../docs/00-overview/) - Narrative overview documents

---

## New Here?

**→ Read [onboarding/START_HERE.md](./onboarding/START_HERE.md) first!**

This is your entrypoint to understanding the codebase, getting set up, and knowing what to read next.

## This Folder is Implementation Truth

The documents in this folder describe **how the system is built**, not product intent. They are the source of truth for:
- System architecture and module organization
- Database schema and data access patterns
- Development workflows and build policies
- Analysis pipeline and evidence generation
- Guardrails and quality checks

For product intent, design decisions, and historical context, see the [../../docs/](../../docs/) folder.

## Documentation Index

See **[INDEX.md](./INDEX.md)** for a complete index of all documentation.

### Quick Links

**Getting Started**
- **[onboarding/START_HERE.md](./onboarding/START_HERE.md)** - Onboarding guide (start here!)
- **[onboarding/DEV_WORKFLOW.md](./onboarding/DEV_WORKFLOW.md)** - Development workflow and build policies
- **[troubleshooting/TROUBLESHOOTING.md](./troubleshooting/TROUBLESHOOTING.md)** - Common issues and solutions

**Core Implementation**
- **[architecture/ARCHITECTURE.md](./architecture/ARCHITECTURE.md)** - High-level system design, module organization, data flow
- **[data/DATA_MODEL.md](./data/DATA_MODEL.md)** - Database schema, table definitions, relationships
- **[data/MIGRATIONS.md](./data/MIGRATIONS.md)** - SQL migrations for schema changes
- **[pipeline/ANALYSIS_PIPELINE.md](./pipeline/ANALYSIS_PIPELINE.md)** - How competitive analysis generation works
- **[pipeline/EVIDENCE_GENERATION.md](./pipeline/EVIDENCE_GENERATION.md)** - Evidence generation via web search and scraping
- **[guards/GUARDRAILS.md](./guards/GUARDRAILS.md)** - Guardrail system for stable outputs

**Additional Docs**
- **[ops/DEPLOYMENT.md](./ops/DEPLOYMENT.md)** - Deployment procedures and configuration
- **[security/Auth.md](./security/Auth.md)** - Authentication and authorization implementation
- **[testing/TESTING.md](./testing/TESTING.md)** - Testing strategies and practices

### Related Documentation

- **[../../docs/README.md](../../docs/README.md)** - Main documentation entry point (product intent, narrative overview)
- **[../../docs/00-overview/](../../docs/00-overview/)** - Narrative overview documents
- **[../../docs/reference/](../../docs/reference/)** - Reference documentation
- **[../../docs/evidence/](../../docs/evidence/)** - Evidence system documentation
- **[../../docs/principles/](../../docs/principles/)** - Design decisions and rules

## Quick Reference

**Need to understand the system flow?**
→ Start with [../../docs/00-overview/01-system-overview.md](../../docs/00-overview/01-system-overview.md), then read [pipeline/ANALYSIS_PIPELINE.md](./pipeline/ANALYSIS_PIPELINE.md)

**Need to modify the database schema?**
→ Read [data/DATA_MODEL.md](./data/DATA_MODEL.md) and [data/MIGRATIONS.md](./data/MIGRATIONS.md)

**Need to add a new artifact type?**
→ Read [architecture/ARCHITECTURE.md](./architecture/ARCHITECTURE.md) section "Adding New Modules" and [data/DATA_MODEL.md](./data/DATA_MODEL.md) section "Adding New Artifact Types"

**Need to improve evidence quality?**
→ Read [pipeline/EVIDENCE_GENERATION.md](./pipeline/EVIDENCE_GENERATION.md) and [../../docs/evidence/EVIDENCE_CLAIMS.md](../../docs/evidence/EVIDENCE_CLAIMS.md)

**Need to understand guardrails?**
→ Read [guards/GUARDRAILS.md](./guards/GUARDRAILS.md) and [../../docs/00-overview/03-definition-of-done.md](../../docs/00-overview/03-definition-of-done.md)

## Maintenance Notes

- Keep these docs updated when making architectural changes
- Prefer adding new sections over rewriting existing ones
- Link to related docs in both `/docs` and `/strat-os-phere/docs` folders
- When in doubt, link to [INDEX.md](./INDEX.md) or [onboarding/START_HERE.md](./onboarding/START_HERE.md) for navigation

