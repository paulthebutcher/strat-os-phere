# StratOSphere Documentation

**Start Here** → This is the canonical entry point for understanding StratOSphere.

**New to the codebase?** Developers should start with **[../strat-os-phere/docs/onboarding/START_HERE.md](../strat-os-phere/docs/onboarding/START_HERE.md)**.

---

## Start Here

StratOSphere (also referred to as Plinth) is an AI-enabled operating system for experience strategy work. The platform helps strategy professionals conduct competitive analysis by generating strategic insights grounded in public evidence, producing ranked opportunities with citations.

**What problem does it solve?** Strategy professionals spend hours manually researching competitors, gathering evidence from fragmented sources, and struggling to structure competitive insights. StratOSphere automates evidence collection from competitor websites, reviews, docs, and pricing pages, then transforms this evidence into structured, citable opportunities.

**Core differentiator:** Public evidence → structured opportunities with citations. Unlike generic competitive analysis tools, StratOSphere harvests real evidence from competitor sites, normalizes it into claims with citations, and generates opportunities that are grounded in verifiable sources. Every claim can be traced back to its source.

---

## How the system works (high level)

The system follows this end-to-end flow:

1. **Project** → User creates a competitive analysis project with market context and business goals
2. **Competitors** → User adds 3-7 competitors to analyze
3. **Evidence collection** → System automatically searches and scrapes competitor websites (homepage, pricing, docs, reviews, jobs, changelog, status pages)
4. **Normalization** → Evidence is normalized into structured claims with citations, deduplicated, and scored for support strength
5. **Coverage gating** → System checks evidence quality (source diversity, recency) and applies coverage gates
6. **Opportunities** → LLM generates ranked opportunities with JTBD (Jobs-to-be-Done) analysis, citations, and confidence bands
7. **Shareable outputs** → Results include opportunities, competitor profiles, market synthesis, and strategic bets—all with inspectable evidence sources

---

## Reading path (recommended order)

Follow this path to understand the system in ≤30 minutes:

1. **[00-overview/01-system-overview.md](./00-overview/01-system-overview.md)** - End-to-end system narrative from user and system perspectives
2. **[00-overview/02-core-entities.md](./00-overview/02-core-entities.md)** - Core data entities (projects, competitors, evidence, artifacts) explained in plain English
3. **[00-overview/03-definition-of-done.md](./00-overview/03-definition-of-done.md)** - Viability checklist: what "done" looks like for evidence, coverage, opportunities
4. **[reference/Schemas.md](./reference/Schemas.md)** - Data schemas (reference only; see `strat-os-phere/docs/data/DATA_MODEL.md` for source of truth)
5. **[../strat-os-phere/docs/architecture/ARCHITECTURE.md](../strat-os-phere/docs/architecture/ARCHITECTURE.md)** - Implementation architecture and module organization
6. **[../strat-os-phere/docs/data/DATA_MODEL.md](../strat-os-phere/docs/data/DATA_MODEL.md)** - Database schema source of truth
7. **[evidence/EVIDENCE_CLAIMS.md](./evidence/EVIDENCE_CLAIMS.md)** - Claim-centric evidence system and follow-up questions
8. **[evidence/EVIDENCE_OPTIMIZATION.md](./evidence/EVIDENCE_OPTIMIZATION.md)** - Evidence performance optimizations
9. **[evidence/RESULTS_STABILIZATION.md](./evidence/RESULTS_STABILIZATION.md)** - Results architecture and normalization
10. **[principles/Decisions.md](./principles/Decisions.md)** - Key architectural and design decisions
11. **[principles/DesignRules.md](./principles/DesignRules.md)** - UI design rules and patterns
12. **[principles/DesignSystem.md](./principles/DesignSystem.md)** - Design system tokens and components
13. **[history/](./history/)** - Historical PR summaries and explorations (context only)

---

## Source of truth vs context

**Source of truth (current system behavior):**

- **`/docs/00-overview/`** - Narrative overview documents
- **`/docs/reference/`** - Reference documentation (schemas, etc.)
- **`/docs/evidence/`** - Evidence system documentation
- **`/docs/principles/`** - Design decisions and rules
- **`/strat-os-phere/docs/`** - Implementation-level truth (architecture, data model, pipelines)

**Historical context (not source of truth):**

- **`/docs/history/`** - PR summaries and past explorations. These documents are snapshots of past work and provide context, but they are not the source of truth for current implementation.

**Product intent:**

- **`/docs/PRD.md`** - Product requirements and user flows

---

## If you're here to help with...

### Fix schema drift
1. Read [data/MIGRATIONS.md](../strat-os-phere/docs/data/MIGRATIONS.md) for migration patterns
2. Review [data/DATA_MODEL.md](../strat-os-phere/docs/data/DATA_MODEL.md) for current schema
3. Check [guards/GUARDRAILS.md](../strat-os-phere/docs/guards/GUARDRAILS.md) for drift detection utilities

### Improve evidence
1. Start with [pipeline/EVIDENCE_GENERATION.md](../strat-os-phere/docs/pipeline/EVIDENCE_GENERATION.md) for the generation flow
2. Review [evidence/EVIDENCE_CLAIMS.md](./evidence/EVIDENCE_CLAIMS.md) for claim extraction
3. Check [evidence/EVIDENCE_OPTIMIZATION.md](./evidence/EVIDENCE_OPTIMIZATION.md) for performance considerations

### Improve results quality
1. Read [evidence/RESULTS_STABILIZATION.md](./evidence/RESULTS_STABILIZATION.md) for current architecture
2. Review [PRD.md](./PRD.md) for product requirements
3. Check [guards/GUARDRAILS.md](../strat-os-phere/docs/guards/GUARDRAILS.md) for quality checks and scoring guardrails

---

## Implementation Documentation

For implementation details, see **[../strat-os-phere/docs/README.md](../strat-os-phere/docs/README.md)**.

**New developers**: Start with **[../strat-os-phere/docs/onboarding/START_HERE.md](../strat-os-phere/docs/onboarding/START_HERE.md)** for onboarding.
