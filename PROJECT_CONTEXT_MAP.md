# Project Context Map

**Generated:** Inspection-only analysis of StratOSphere codebase  
**Purpose:** High-signal reference for efficient debugging and development

---

## 1. Stack & Runtime

### Framework & Routing
- **Framework:** Next.js 16.0.10 (App Router)
- **Routing Mode:** File-based routing with App Router (`app/` directory)
- **Build Tool:** Next.js built-in (Turbopack in dev)
- **Package Manager:** `pnpm@8.15.0` (enforced via `packageManager` field)
- **TypeScript:** Strict mode, ES2017 target, bundler module resolution
- **Node Version:** `>=20.0.0` (enforced in `package.json`)

### API Layer
- **Pattern:** Next.js Route Handlers (`app/api/**/route.ts`) + Server Actions (`'use server'`)
- **Server Actions:** Used for form submissions and mutations (e.g., `app/login/actions.ts`, `app/projects/actions.ts`)
- **Route Handlers:** Used for API endpoints (e.g., `/api/projects/[projectId]/generate/route.ts`)
- **No tRPC/REST framework:** Pure Next.js patterns

### Data Sources & Auth
- **Database:** Supabase (PostgreSQL)
  - Client: `@supabase/ssr` for SSR-compatible auth
  - Server client: `lib/supabase/server.ts` (uses Next.js `cookies()`)
  - Client client: `lib/supabase/client.ts` (browser)
  - Middleware: `middleware.ts` → `lib/supabase/middleware.ts` (session refresh)
- **Auth Flow:**
  - Magic link email auth via Supabase Auth
  - PKCE flow with 7-day cookie maxAge
  - Public routes: `/`, `/login`, `/auth/callback`, `/new`, `/api/*`, `/share/*`
  - Protected routes: `/dashboard`, `/projects/*`
  - Callback handler: `app/auth/callback/route.ts`
- **Database Schema:** TypeScript types generated from Supabase (`lib/supabase/database.types.ts`)
- **SQL Migrations:** `docs/sql/*.sql` (manual migrations, not auto-run)

---

## 2. How the App Works End-to-End

### Main User Journey (Happy Path)

1. **Landing/Login** (`/` or `/login`)
   - Public route, redirects to `/dashboard` if authenticated
   - Magic link email auth

2. **Create Project** (`/new`)
   - Authenticated: Auto-creates project → redirects to `/projects/[id]/describe`
   - Logged-out: Shows wizard (creates after login)
   - Guided mode: `?onboarding=1`

3. **Describe** (`/projects/[id]/describe`)
   - Currently redirects to competitors (Step 2)
   - Future: Edit project details

4. **Add Competitors** (`/projects/[id]/competitors`)
   - Add 3-7 competitors (URLs or search)
   - Evidence preview panel
   - Generate button appears when ready

5. **Generate Evidence** (API: `/api/projects/[id]/collect-evidence`)
   - Harvests evidence via Tavily/SerpAPI
   - Stores in `evidence_cache` (24h TTL) and `evidence_sources`
   - Two-pass shortlisting (fast triage → deep analysis)

6. **Generate Analysis** (API: `/api/projects/[id]/generate`)
   - Creates competitor snapshots (LLM)
   - Market synthesis (LLM)
   - Opportunities generation (LLM + scoring)
   - Stores artifacts in `artifacts` table (append-only)

7. **View Results** (`/projects/[id]/decision`)
   - Primary landing page for projects
   - Shows decision summary, opportunities, evidence trust panel
   - Deep-dive tabs: opportunities, competitors, scorecard, evidence, appendix

### Key Screens & Routes

| Route | Purpose | Auth Required |
|-------|---------|----------------|
| `/` | Marketing/homepage | No |
| `/login` | Magic link login | No |
| `/auth/callback` | OAuth callback | No |
| `/new` | Create new analysis | No (wizard) |
| `/dashboard` | Project list | Yes |
| `/projects/[id]/describe` | Step 1 (redirects) | Yes |
| `/projects/[id]/competitors` | Step 2: Add competitors | Yes |
| `/projects/[id]/decision` | Main results view | Yes |
| `/projects/[id]/opportunities` | Opportunities list | Yes |
| `/projects/[id]/opportunities/[oid]` | Single opportunity | Yes |
| `/projects/[id]/evidence` | Evidence sources | Yes |
| `/projects/[id]/scorecard` | Competitor scorecard | Yes |
| `/projects/[id]/strategic-bets` | Strategic bets | Yes |
| `/projects/[id]/appendix` | Appendix | Yes |
| `/share/[shareId]` | Public share view | No |

### State Management

- **URL State:** Search params for filters, onboarding flags (`?onboarding=1`)
- **Server State:** Supabase database (projects, competitors, artifacts, evidence)
- **Local State:** React `useState` in client components (forms, UI toggles)
- **No Global Store:** No Redux/Zustand/Jotai
- **Server Components:** Default (data fetching in components)
- **Client Components:** Marked with `'use client'` (forms, interactive UI)
- **Polling:** `hooks/useRunStatusPolling.ts` for run status updates

---

## 3. Core Modules

### Folder Structure

```
strat-os-phere/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Marketing pages (grouped route)
│   ├── api/                     # Route handlers
│   │   ├── projects/[id]/       # Project APIs (generate, collect-evidence, etc.)
│   │   ├── runs/[id]/           # Run status/artifacts
│   │   ├── evidence/generate/    # Evidence generation
│   │   └── competitors/suggest/ # Competitor suggestions
│   ├── auth/callback/           # OAuth callback
│   ├── dashboard/               # Project list
│   ├── login/                   # Auth pages
│   ├── new/                     # New analysis wizard
│   └── projects/[id]/           # Project pages (describe, competitors, decision, etc.)
│
├── components/                   # React components
│   ├── competitors/             # Competitor management UI
│   ├── evidence/                # Evidence display
│   ├── results/                 # Results/opportunities display
│   ├── projects/                # Project-level components
│   ├── layout/                  # Page shells, headers, sections
│   ├── ui/                      # shadcn/ui primitives
│   └── shared/                  # Shared components
│
├── lib/                          # Core business logic
│   ├── supabase/                # DB client, middleware, types
│   ├── data/                    # Data access layer (projects, competitors, artifacts)
│   ├── evidence/                # Evidence harvesting, shortlisting, claims
│   ├── results/                 # Results generation, normalization
│   ├── llm/                     # LLM provider (OpenAI), callLLM wrapper
│   ├── tavily/                  # Tavily search client (rate-limited, retries)
│   ├── search/                  # Search abstraction (Tavily/SerpAPI)
│   ├── errors/                  # Error taxonomy (AppError, SchemaMismatchError, etc.)
│   ├── guardrails/              # Guardrails, invariants, validation
│   ├── prompts/                 # LLM prompt templates
│   ├── schemas/                 # Zod schemas for validation
│   ├── routing/                 # Route helpers, search params
│   └── ux/                      # UX helpers (analysis view model, next best action)
│
├── hooks/                        # React hooks
│   └── useRunStatusPolling.ts   # Polling for run status
│
├── scripts/                      # Build/dev scripts
│   ├── guard-next-build.mjs     # Pre-build checks
│   ├── check-schema-drift.ts     # Schema validation
│   └── checkForbiddenTokens.ts  # Security checks
│
└── tests/                        # Test suites
    ├── unit/                     # Vitest unit tests
    ├── e2e/                      # Playwright E2E tests
    └── smoke/                    # Smoke tests
```

### Important Shared Utilities

- **Error Handling:** `lib/errors/errors.ts` - Unified error types (AppError, SchemaMismatchError, NotReadyError, etc.)
- **Logging:** `lib/logger.ts` - Structured logging with categories
- **Data Contracts:** `lib/data/projectsContract.ts` - Safe data access with error handling
- **Invariants:** `lib/guardrails/invariants.ts` - Runtime assertions (INV-5 for schema mismatches)
- **Route Helpers:** `lib/routes.ts` - Type-safe route generation
- **Search Params:** `lib/routing/searchParams.ts` - Type-safe URL param parsing
- **Metadata:** `lib/seo/metadata.ts` - SEO metadata generation
- **Constants:** `lib/constants.ts` - MIN/MAX competitors, etc.

---

## 4. Integration Points

### External Services

1. **Supabase**
   - **Env Vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Usage:** Database, auth, RLS policies
   - **Location:** `lib/supabase/*`

2. **OpenAI**
   - **Env Vars:** `OPENAI_API_KEY`, `OPENAI_MODEL` (default: `gpt-4.1-mini`), `OPENAI_MAX_TOKENS` (default: 1200)
   - **Usage:** LLM calls for competitor snapshots, synthesis, opportunities
   - **Location:** `lib/llm/openai.ts`, `lib/llm/callLLM.ts`
   - **Features:** JSON mode, retries, timeouts

3. **Tavily**
   - **Env Vars:** `TAVILY_API_KEY`, `TAVILY_MAX_QPS` (default: 2), `TAVILY_TIMEOUT_MS` (default: 15000), `TAVILY_API_ENDPOINT`
   - **Usage:** Web search for evidence harvesting
   - **Location:** `lib/tavily/client.ts`
   - **Features:** Rate limiting (p-limit), exponential backoff, retries (max 3)

4. **SerpAPI** (optional fallback)
   - **Location:** `lib/search/serpapi.ts`
   - **Usage:** Alternative search provider

### Environment Variables Summary

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `TAVILY_API_KEY`

**Optional:**
- `OPENAI_MODEL` (default: `gpt-4.1-mini`)
- `OPENAI_MAX_TOKENS` (default: 1200)
- `TAVILY_MAX_QPS` (default: 2)
- `TAVILY_TIMEOUT_MS` (default: 15000)
- `TAVILY_API_ENDPOINT` (default: `https://api.tavily.com/search`)
- `PLAYWRIGHT_BASE_URL` (default: `http://localhost:3000`)

### Background Processing

- **No Queue System:** All processing is request-driven (API routes)
- **Long-Running Tasks:** Handled via API routes with status polling
  - Run status: `/api/runs/[runId]/status`
  - Polling hook: `hooks/useRunStatusPolling.ts`
- **Evidence Harvesting:** Synchronous API calls (may be slow, consider async in future)

---

## 5. Known Risk Areas

### Routing & Navigation
- **Legacy redirects:** `next.config.ts` has many redirects (may indicate route churn)
- **Route params:** Async params in Next.js 15+ (`params: Promise<{...}>`)
- **Auth redirects:** Cookie preservation on redirects is critical (`lib/supabase/middleware.ts`)

### Data Fetching
- **Schema Mismatch:** High risk - app may be ahead of DB schema
  - Detection: `SchemaMismatchError` in `lib/errors/errors.ts`
  - Guard: `lib/data/projectsContract.ts` uses safe selects
  - Invariant: `INV-5` checks for missing columns
- **Parallel Fetches:** `Promise.allSettled` used in dashboard (may mask errors)
- **Error Handling:** Mixed patterns (some try/catch, some Result types)

### Parsing & Validation
- **LLM JSON Parsing:** `lib/schemas/safeParseLLMJson.ts` - LLM may return invalid JSON
- **Zod Schemas:** Used throughout, but repair logic exists (single repair attempt)
- **Evidence Parsing:** HTML extraction, content truncation (12k chars/page)

### Caching
- **Evidence Cache:** 24-hour TTL in `evidence_cache` table
- **No CDN/Edge Cache:** All data from Supabase
- **Browser Cache:** Standard Next.js caching (may need tuning)

### Build Config
- **Guarded Builds:** `scripts/guard-next-build.mjs` runs pre-build checks
- **Schema Drift:** `scripts/check-schema-drift.ts` validates schema
- **Forbidden Tokens:** `scripts/checkForbiddenTokens.ts` security check
- **Timeouts:** Build scripts have timeouts (`run-with-timeout.mjs`)

### Error-Prone Areas
- **Cookie Handling:** Complex cookie merging in middleware (7-day maxAge)
- **Auth State:** Session refresh in middleware (must preserve cookies)
- **LLM Calls:** Network timeouts, rate limits, JSON parsing failures
- **Evidence Harvesting:** External API failures (Tavily rate limits, timeouts)
- **Artifact Normalization:** Version handling (v1/v2/v3) in `lib/results/normalizeResults.ts`

---

## 6. Quick Commands

### Development
```bash
pnpm dev                    # Start dev server (Next.js)
```

### Build
```bash
pnpm build                  # Standard build
pnpm build:guarded          # Build with pre-flight checks (lint, typecheck, schema, forbidden tokens)
pnpm build:fast             # Fast build (no checks)
pnpm build:clean            # Clean build with guards (no lint/typecheck)
pnpm build:ci               # CI build (CI=true)
```

### Testing
```bash
pnpm test                   # Run Vitest unit tests
pnpm test:watch             # Watch mode
pnpm test:coverage          # Coverage report
pnpm e2e                    # Playwright E2E tests
pnpm e2e:ui                 # Playwright UI mode
pnpm test:smoke             # Smoke tests
```

### Linting & Type Checking
```bash
pnpm lint                   # ESLint
pnpm lint:file <file>       # Lint single file
pnpm lint:changed           # Lint only changed files
pnpm typecheck              # TypeScript check
pnpm typecheck:fast         # Fast typecheck (no pretty)
pnpm fast                   # lint:fast + typecheck:fast
```

### Pre-flight Checks
```bash
pnpm preflight              # Full pre-flight (typecheck + lint + tests)
pnpm preflight:fast         # Fast pre-flight (typecheck + lint only)
pnpm verify                 # preflight + build
```

### Schema & Health
```bash
pnpm check:schema           # Check for schema drift
pnpm schema:health          # Schema health check
pnpm check:forbidden        # Check for forbidden tokens
```

### Production
```bash
pnpm start                  # Start production server (after build)
```

### Other
```bash
pnpm format                 # Format with Prettier
pnpm format:check           # Check formatting
pnpm lint:deadlinks         # Find dead links
pnpm harvest:evidence       # Harvest evidence script
```

---

## Additional Notes

- **Component Library:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts
- **Toasts:** Sonner
- **Testing:** Vitest (unit), Playwright (E2E), MSW (mocks)
- **Code Quality:** ESLint (Next.js config), Prettier
- **Documentation:** Extensive docs in `/docs` folder (PRD, architecture, data model, etc.)

