# Start Here

**Purpose**: Onboarding guide for new developers joining the Plinth codebase.

**When to read this**: Read this first if you're new to the codebase. This is your entrypoint to understanding the system and getting set up.

**Last updated**: 2025-01-27

---

## What is Plinth?

Plinth is an AI-enabled platform for competitive strategy analysis:

- **Decision system** for competitive strategy using evidence-based analysis
- **Evidence → normalization → opportunities → confidence boundaries** flow
- **Runs are append-only**; inputs are versioned JSON (immutable project state)
- **AI-powered generation** produces competitor snapshots and market synthesis
- **Strategy professionals** use it to conduct competitive analysis and generate strategic insights

## 15-Minute Quickstart

### Prerequisites

- Node.js 20+
- pnpm (package manager)
- Supabase project (for auth and database)
- OpenAI API key

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the project root:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   ```
   
   See [../README.md](../README.md) in the project root for detailed setup instructions.

3. **Run the development server**:
   ```bash
   pnpm dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

5. **Verify your setup**:
   ```bash
   # Run fast checks (type checking + linting)
   pnpm preflight

   # Run full production build
   pnpm build

   # Run tests
   pnpm test
   ```

### You're set up when...

- ✅ Dev server runs without errors (`pnpm dev`)
- ✅ Type checking passes (`pnpm typecheck`)
- ✅ Linting passes (`pnpm lint`)
- ✅ You can access [http://localhost:3000](http://localhost:3000)
- ✅ Tests run successfully (`pnpm test`)

## Repo Map

### `/app` - Routes and Pages

- **`/app/(marketing)/`** - Public marketing pages (homepage, how-it-works, etc.)
- **`/app/dashboard`** - Project list (protected)
- **`/app/projects/[projectId]/`** - Project detail pages (competitors, results)
- **`/app/api/`** - API routes (auth, projects, runs, evidence, etc.)
- **`/app/login`** - Magic link authentication
- **`/app/auth/callback`** - OAuth callback handler

### `/lib` - Core Libraries

- **`lib/data/`** - Data access layer (projects, competitors, artifacts)
- **`lib/analysis/`** - Analysis pipeline orchestration
- **`lib/evidence/`** - Evidence generation (web search, scraping)
- **`lib/results/`** - Result generation (LLM calls, validation)
- **`lib/supabase/`** - Supabase client configuration
- **`lib/schemas/`** - Zod schemas for validation
- **`lib/prompts/`** - LLM prompt templates

### `/components` - React Components

- **`components/projects/`** - Project-related UI components
- **`components/results/`** - Results display components
- **`components/evidence/`** - Evidence management UI
- **`components/layout/`** - Layout and navigation components

### `/docs` - Documentation

- **`docs/onboarding/`** - Getting started guides (you are here)
- **`docs/architecture/`** - System architecture and module organization
- **`docs/data/`** - Database schema and migrations
- **`docs/pipeline/`** - Analysis and evidence generation pipelines
- **`docs/ops/`** - Deployment and operations
- **`docs/security/`** - Authentication and authorization
- **`docs/testing/`** - Testing strategies
- **`docs/troubleshooting/`** - Common issues and solutions

See [INDEX.md](../INDEX.md) for a complete documentation index.

## Top Workflows

### Create a Project

1. Navigate to `/dashboard`
2. Click "New Project"
3. Fill in project details (market, target customer, etc.)
4. Save project

📖 **Read more**: [architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md) (Module Map section)

### Add Competitors

1. Open project → `/projects/[projectId]/competitors`
2. Add 3-7 competitors with:
   - Name
   - URL (optional)
   - Evidence text (up to 12,000 chars per competitor)

📖 **Read more**: [data/DATA_MODEL.md](../data/DATA_MODEL.md) (competitors table)

### Run Analysis

1. Click "Generate Analysis" when 3+ competitors are added
2. System generates:
   - **Competitor snapshots** (one per competitor)
   - **Market synthesis** (landscape summary)
3. Results stored as artifacts in database

📖 **Read more**: [pipeline/ANALYSIS_PIPELINE.md](../pipeline/ANALYSIS_PIPELINE.md)

### View Results

1. Navigate to `/projects/[projectId]/results`
2. View competitor profiles and synthesis in tabs
3. Copy sections or regenerate analysis

📖 **Read more**: [pipeline/ANALYSIS_PIPELINE.md](../pipeline/ANALYSIS_PIPELINE.md) (Artifact storage)

## Read This Next

Recommended reading order for new developers:

1. **[architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md)** - System design, module organization, data flow
2. **[data/DATA_MODEL.md](../data/DATA_MODEL.md)** - Database schema, tables, relationships
3. **[pipeline/ANALYSIS_PIPELINE.md](../pipeline/ANALYSIS_PIPELINE.md)** - How analysis generation works end-to-end
4. **[pipeline/EVIDENCE_GENERATION.md](../pipeline/EVIDENCE_GENERATION.md)** - Web search and evidence generation
5. **[data/MIGRATIONS.md](../data/MIGRATIONS.md)** - Schema changes and migration patterns
6. **[onboarding/DEV_WORKFLOW.md](../onboarding/DEV_WORKFLOW.md)** - Development workflow and build policies
7. **[testing/TESTING.md](../testing/TESTING.md)** - Testing strategies and conventions

## Common Pitfalls

### Schema Drift Avoidance

**Problem**: Directly selecting database columns can lead to schema drift when columns are removed or renamed.

**Solution**: Use centralized selectors in `lib/data/` instead of inline selects. The build process checks for forbidden tokens to catch violations.

📖 **Read more**: [data/MIGRATIONS.md](../data/MIGRATIONS.md), [guards/GUARDRAILS.md](../guards/GUARDRAILS.md)

### Forbidden Tokens

**Problem**: Build fails with forbidden token violations for non-existent columns.

**Solution**: Run `pnpm check:forbidden` before committing. Use centralized data access functions instead of direct column references.

📖 **Read more**: [troubleshooting/TROUBLESHOOTING.md](../troubleshooting/TROUBLESHOOTING.md)

### Idempotency / Runs Append-Only

**Problem**: Analysis runs should be idempotent and append-only. Creating duplicate runs can cause data inconsistencies.

**Solution**: Use `idempotency_key` when creating runs. Never modify existing runs; always create new ones.

📖 **Read more**: [pipeline/ANALYSIS_PIPELINE.md](../pipeline/ANALYSIS_PIPELINE.md), [data/DATA_MODEL.md](../data/DATA_MODEL.md)

### Coverage Gating Philosophy

**Problem**: Low-quality evidence can produce high-confidence outputs, leading to false precision.

**Solution**: The guardrail system enforces evidence quality checks and confidence boundaries. Review guardrails before modifying scoring logic.

📖 **Read more**: [guards/GUARDRAILS.md](../guards/GUARDRAILS.md)

## Getting Help

- **Stuck?** Check [troubleshooting/TROUBLESHOOTING.md](../troubleshooting/TROUBLESHOOTING.md)
- **Need to find a specific doc?** See [INDEX.md](../INDEX.md)
- **Want to understand the overall system?** See [architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

