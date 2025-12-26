# Architecture

High-level system design and module organization for Plinth.

## Module Map

### App Routes (`app/`)

**Public Routes**:
- `/` - Marketing homepage
- `/login` - Magic link sign-in
- `/auth/callback` - OAuth callback handler

**Protected Routes**:
- `/dashboard` - Project list
- `/projects/[projectId]/competitors` - Competitor management
- `/projects/[projectId]/results` - Analysis results view
- `/projects/new` - Create new project

**API Routes** (`app/api/`):
- `/api/whoami` - Debug auth state
- `/api/debug/origin` - Debug origin computation
- `/api/supabase-version` - Package version check
- `/api/e2e/login` - E2E test auth helper

### Server Actions

Server actions live alongside their corresponding pages:

- `app/login/actions.ts` - `signIn(email)`
- `app/projects/actions.ts` - Project CRUD
- `app/projects/[projectId]/competitors/actions.ts` - Competitor CRUD
- `app/projects/[projectId]/results/actions.ts` - `generateAnalysis(projectId)`

### Library Modules (`lib/`)

**Schemas** (`lib/schemas/`):
- `competitorSnapshot.ts` - Competitor profile schema
- `marketSynthesis.ts` - Market synthesis schema
- `artifacts.ts` - Artifact type definitions
- `safeParseLLMJson.ts` - JSON extraction + Zod validation

**Prompts** (`lib/prompts/`):
- `system.ts` - System style guide
- `snapshot.ts` - Competitor snapshot prompt builder
- `synthesis.ts` - Market synthesis prompt builder
- `repair.ts` - Schema repair prompt builder

**LLM** (`lib/llm/`):
- `callLLM.ts` - Public LLM interface (retry logic, timeout)
- `openai.ts` - OpenAI provider implementation
- `provider.ts` - Provider interface

**Data Layer** (`lib/data/`):
- `projects.ts` - Project CRUD operations
- `competitors.ts` - Competitor CRUD operations
- `artifacts.ts` - Artifact storage/retrieval

**Supabase** (`lib/supabase/`):
- `server.ts` - Server-side client factory
- `middleware.ts` - Session refresh + route protection
- `cookie-options.ts` - 7-day cookie configuration
- `database.types.ts` - TypeScript types
- `session-debug.ts` - Dev-only session debugging

**Server Utilities** (`lib/server/`):
- `origin.ts` - Request-derived origin computation

**Constants** (`lib/constants.ts`):
- `MIN_COMPETITORS_FOR_ANALYSIS = 3`
- `MAX_COMPETITORS_PER_PROJECT = 7`
- `MAX_EVIDENCE_CHARS = 12_000`
- `AUTH_COOKIE_MAX_AGE_SECONDS = 604_800` (7 days)

## Data Flow

### Request → Server Action → Supabase → LLM → Artifacts → UI

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │
       │ 1. User action (click "Generate Analysis")
       ▼
┌─────────────────────────────────────┐
│  Server Action                      │
│  (app/projects/[id]/results/       │
│   actions.ts)                       │
└──────┬──────────────────────────────┘
       │
       │ 2. Auth check + fetch project/competitors
       ▼
┌─────────────────────────────────────┐
│  Supabase Client                   │
│  (lib/supabase/server.ts)          │
│  - getProjectById()                 │
│  - listCompetitorsForProject()      │
└──────┬──────────────────────────────┘
       │
       │ 3. Build prompts + call LLM
       ▼
┌─────────────────────────────────────┐
│  LLM Provider                      │
│  (lib/llm/callLLM.ts)              │
│  - Retry logic                     │
│  - Timeout handling                │
│  - OpenAI API calls                │
└──────┬──────────────────────────────┘
       │
       │ 4. Parse + validate JSON
       ▼
┌─────────────────────────────────────┐
│  Schema Validation                 │
│  (lib/schemas/safeParseLLMJson.ts) │
│  - Extract JSON from code fences   │
│  - Zod validation                  │
│  - Repair on failure               │
└──────┬──────────────────────────────┘
       │
       │ 5. Store artifacts
       ▼
┌─────────────────────────────────────┐
│  Artifact Storage                  │
│  (lib/data/artifacts.ts)           │
│  - createArtifact()                │
│  - Type: 'profiles' | 'synthesis'   │
└──────┬──────────────────────────────┘
       │
       │ 6. Return artifact IDs
       ▼
┌─────────────────────────────────────┐
│  UI Re-render                      │
│  (app/projects/[id]/results/       │
│   page.tsx)                        │
│  - Fetch artifacts                  │
│  - Display in tabs                 │
└─────────────────────────────────────┘
```

## Adding New Modules

### New Artifact Type

1. **Update schema** (`lib/schemas/artifacts.ts`):
   ```typescript
   export const ArtifactTypeSchema = z.enum(['profiles', 'synthesis', 'newType'])
   
   export const NewTypeArtifactSchema = z.object({
     type: z.literal('newType'),
     content: NewTypeContentSchema,
   })
   ```

2. **Add to database types** (`lib/supabase/database.types.ts`):
   ```typescript
   export type ArtifactType = 'profiles' | 'synthesis' | 'newType'
   ```

3. **Create prompt builder** (`lib/prompts/newType.ts`):
   ```typescript
   export function buildNewTypeMessages(context: NewTypeContext): Message[] {
     // ...
   }
   ```

4. **Add generation logic** to `generateAnalysis()` or create new action

5. **Create results view** (`app/projects/[projectId]/results/page.tsx`):
   - Add new tab
   - Fetch and render new artifact type

### New Prompt/Schema

1. **Define Zod schema** (`lib/schemas/newSchema.ts`):
   ```typescript
   export const NewSchema = z.object({ ... })
   export type NewSchema = z.infer<typeof NewSchema>
   ```

2. **Create prompt builder** (`lib/prompts/newPrompt.ts`):
   ```typescript
   export function buildNewPromptMessages(context: Context): Message[] {
     return [
       getSystemStyleGuide(),
       { role: 'user', content: '...' },
     ]
   }
   ```

3. **Add schema shape** for repair prompts:
   ```typescript
   export const NEW_SCHEMA_SHAPE = { ... }
   ```

4. **Use in action**:
   ```typescript
   const response = await callLLM({ messages: buildNewPromptMessages(...) })
   const parsed = safeParseLLMJson(response.text, NewSchema)
   ```

### New Results View

1. **Create page** (`app/projects/[projectId]/newView/page.tsx`):
   ```typescript
   export default async function NewViewPage({ params }: Props) {
     const supabase = await createClient()
     const artifacts = await listArtifactsByType(supabase, params.projectId, 'newType')
     // Render UI
   }
   ```

2. **Add navigation** from results page or dashboard

3. **Add server action** if needed (`app/projects/[projectId]/newView/actions.ts`)

## Key Design Decisions

### Request-Derived Origin
Origin is computed from request headers (`x-forwarded-host`, `x-forwarded-proto`) rather than `NEXT_PUBLIC_SITE_URL`. This enables:
- Preview deployments to work without config changes
- Staging domains to work automatically
- No environment-specific env vars needed

See `lib/server/origin.ts` for implementation.

### 7-Day Session Persistence
Auth cookies are set with `maxAge: 604_800` (7 days) in:
- Callback route (`app/auth/callback/route.ts`)
- Middleware (`lib/supabase/middleware.ts`)
- Server client (`lib/supabase/server.ts`)

**Important**: PKCE verifier cookies are NOT forced to 7-day maxAge (they remain short-lived for security).

### LLM Retry Strategy
- Max 3 retries with exponential backoff
- Retries on: timeouts, 429 (rate limit), 5xx errors
- No retry on: 4xx (client errors), validation failures

See `lib/llm/callLLM.ts` for details.

### Schema Repair Flow
When LLM output fails Zod validation:
1. Extract validation errors
2. Build repair prompt with schema shape + errors
3. Call LLM again with repair prompt
4. Validate repaired output
5. Fail if repair also fails

See `app/projects/[projectId]/results/actions.ts` for implementation.

## File Organization Principles

1. **Co-location**: Server actions live next to their pages
2. **Type safety**: Database types in `lib/supabase/database.types.ts`
3. **Schema-first**: Zod schemas define data contracts
4. **Provider abstraction**: LLM calls go through `callLLM()`, not direct provider
5. **Server-only**: Utilities that must run server-side use `"server-only"` import

