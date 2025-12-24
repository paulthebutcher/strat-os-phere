# Data Model

**Purpose**: Database schema and relationships for StratOSphere. This is the source of truth for data structures.

**When to read this**: Read this to understand what tables exist, their columns, relationships, and how to access data.

**Related docs**:
- [../docs/00-overview/02-core-entities.md](../docs/00-overview/02-core-entities.md) - Core entities explained
- [MIGRATIONS.md](./MIGRATIONS.md) - Schema changes and migrations
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [ANALYSIS_PIPELINE.md](./ANALYSIS_PIPELINE.md) - How artifacts are generated

---

Database schema and relationships for StratOSphere.

## Tables

### `projects`

Stores competitive analysis projects.

**Columns**:
- `id` (uuid, PK) - Project identifier
- `user_id` (uuid, FK → auth.users) - Owner
- `name` (text) - Project name
- `market` (text) - Market description
- `target_customer` (text) - Target customer description
- `your_product` (text, nullable) - Your product description
- `business_goal` (text, nullable) - Business goal
- `geography` (text, nullable) - Geographic scope
- `created_at` (timestamp) - Creation timestamp

**RLS Policy**: Users can only access their own projects.

**TypeScript**: `ProjectRow`, `ProjectInsert`, `ProjectUpdate` in `lib/supabase/database.types.ts`

### `competitors`

Stores competitors for a project.

**Columns**:
- `id` (uuid, PK) - Competitor identifier
- `project_id` (uuid, FK → projects.id) - Parent project
- `name` (text) - Competitor name
- `url` (text, nullable) - Competitor website URL
- `evidence_text` (text, nullable) - Evidence text (max 12,000 chars)
- `created_at` (timestamp) - Creation timestamp

**Constraints**:
- 3-7 competitors per project (enforced in application code)
- Evidence text truncated to 12,000 chars if longer

**RLS Policy**: Users can only access competitors via projects they own.

**TypeScript**: `CompetitorRow`, `CompetitorInsert`, `CompetitorUpdate` in `lib/supabase/database.types.ts`

### `artifacts`

Stores analysis outputs (competitor profiles, market synthesis, etc.).

**Columns**:
- `id` (uuid, PK) - Artifact identifier
- `project_id` (uuid, FK → projects.id) - Parent project
- `type` (text) - Artifact type: `'profiles'` | `'synthesis'`
- `content_json` (jsonb) - Artifact content (schema varies by type)
- `created_at` (timestamp) - Creation timestamp

**RLS Policy**: Users can only access artifacts via projects they own.

**TypeScript**: `ArtifactRow`, `ArtifactInsert`, `ArtifactUpdate` in `lib/supabase/database.types.ts`

## Relationships

```
auth.users (Supabase Auth)
  └─ user_id
      └─ projects
          ├─ project_id → competitors
          └─ project_id → artifacts
```

**Access Pattern**: All data access is scoped by `user_id` → `project_id`. Users own projects; competitors and artifacts are accessed via projects.

## Artifact Types

### `profiles`

Stores competitor snapshots (one per competitor).

**Schema** (`lib/schemas/artifacts.ts`):
```typescript
{
  type: 'profiles',
  content: CompetitorSnapshot[]  // Array of competitor profiles
}
```

**Content JSON Structure**:
```json
{
  "run_id": "uuid",
  "generated_at": "2024-01-01T00:00:00.000Z",
  "competitor_count": 5,
  "llm": {
    "stage": "snapshots",
    "provider": "openai",
    "model": "gpt-4",
    "usage": {
      "inputTokens": 15000,
      "outputTokens": 5000,
      "totalTokens": 20000
    }
  },
  "snapshots": [
    {
      "competitor_name": "Competitor A",
      "value_proposition": "...",
      "target_customer": "...",
      "pricing_model": "...",
      "key_features": [...],
      "differentiators": [...],
      "risks": [...],
      "evidence_quotes": [...]
    },
    // ... more competitors
  ]
}
```

**Competitor Snapshot Schema**: See `lib/schemas/competitorSnapshot.ts`

### `synthesis`

Stores market synthesis (landscape summary).

**Schema** (`lib/schemas/artifacts.ts`):
```typescript
{
  type: 'synthesis',
  content: MarketSynthesis  // Single synthesis object
}
```

**Content JSON Structure**:
```json
{
  "run_id": "uuid",
  "generated_at": "2024-01-01T00:00:00.000Z",
  "competitor_count": 5,
  "llm": {
    "stage": "synthesis",
    "provider": "openai",
    "model": "gpt-4",
    "usage": {
      "inputTokens": 20000,
      "outputTokens": 8000,
      "totalTokens": 28000
    }
  },
  "synthesis": {
    "market_summary": "...",
    "competitive_landscape": "...",
    "key_trends": [...],
    "opportunities": [...],
    "risks": [...]
  }
}
```

**Market Synthesis Schema**: See `lib/schemas/marketSynthesis.ts`

## Data Access Layer

### Projects

**File**: `lib/data/projects.ts`

- `getProjectById(supabase, projectId)` - Get single project
- `listProjectsByUserId(supabase, userId)` - List user's projects
- `createProject(supabase, data)` - Create project
- `updateProject(supabase, projectId, data)` - Update project
- `deleteProject(supabase, projectId)` - Delete project

### Competitors

**File**: `lib/data/competitors.ts`

- `listCompetitorsForProject(supabase, projectId)` - List competitors
- `getCompetitorById(supabase, competitorId)` - Get single competitor
- `createCompetitor(supabase, data)` - Create competitor
- `updateCompetitor(supabase, competitorId, data)` - Update competitor
- `deleteCompetitor(supabase, competitorId)` - Delete competitor

### Artifacts

**File**: `lib/data/artifacts.ts`

- `listArtifactsForProject(supabase, projectId)` - List all artifacts
- `getArtifactById(supabase, artifactId)` - Get single artifact
- `getLatestArtifactsByType(supabase, projectId, type)` - Get latest by type
- `createArtifact(supabase, data)` - Create artifact

## RLS (Row Level Security) Intent

**Projects**:
- Users can SELECT/INSERT/UPDATE/DELETE their own projects
- Users cannot access other users' projects

**Competitors**:
- Users can SELECT/INSERT/UPDATE/DELETE competitors for projects they own
- Access controlled via `project_id` foreign key

**Artifacts**:
- Users can SELECT/INSERT/UPDATE/DELETE artifacts for projects they own
- Access controlled via `project_id` foreign key

**Implementation Note**: RLS policies should be configured in Supabase dashboard. Application code assumes RLS is enforced and does not add additional access checks beyond `user_id` validation.

## Adding New Artifact Types

1. **Update database enum** (if using enum type):
   ```sql
   ALTER TYPE artifact_type ADD VALUE 'newType';
   ```

2. **Update TypeScript types** (`lib/supabase/database.types.ts`):
   ```typescript
   export type ArtifactType = 'profiles' | 'synthesis' | 'newType'
   ```

3. **Add Zod schema** (`lib/schemas/artifacts.ts`):
   ```typescript
   export const NewTypeArtifactSchema = z.object({
     type: z.literal('newType'),
     content: NewTypeContentSchema,
   })
   ```

4. **Update artifact schema union**:
   ```typescript
   export const ArtifactSchema = z.discriminatedUnion('type', [
     ProfilesArtifactSchema,
     SynthesisArtifactSchema,
     NewTypeArtifactSchema,  // Add here
   ])
   ```

5. **Add to `getArtifactContentSchema()`**:
   ```typescript
   case 'newType':
     return NewTypeContentSchema
   ```

6. **Update generation logic** to create new artifact type

## Schema Validation

Artifact content is validated using Zod schemas:

- **On creation**: `validateArtifactContent(type, content)` in `lib/data/artifacts.ts`
- **On retrieval**: Schemas ensure type safety when reading artifacts
- **Schema location**: `lib/schemas/artifacts.ts`, `lib/schemas/competitorSnapshot.ts`, `lib/schemas/marketSynthesis.ts`

See [Analysis Pipeline](./ANALYSIS_PIPELINE.md) for how artifacts are generated and validated.

