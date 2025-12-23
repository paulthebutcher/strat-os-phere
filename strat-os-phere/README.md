# Plinth

A quiet workspace for serious strategy work. Plinth is an AI-enabled platform that helps strategy professionals conduct competitive analysis and generate strategic insights through an intuitive, AI-powered workflow.

## Features

### MVP
- **Magic link authentication** with 7-day session persistence
- **Project management** - Create and manage competitive analysis projects
- **Competitor management** - Add 3-7 competitors per project with evidence
- **AI-powered analysis** - Generate executive-ready competitive landscape summaries
- **Results presentation** - View competitor profiles and market synthesis in organized tabs

### Roadmap
- Export results (PDF, markdown)
- Historical analysis tracking
- Custom prompt templates
- Team collaboration features

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (SSR with PKCE)
- **LLM**: OpenAI (GPT-4)
- **Validation**: Zod
- **UI**: shadcn/ui + Tailwind CSS
- **Testing**: Vitest (unit/integration) + Playwright (e2e)

## Local Setup

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase project (for auth and database)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
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

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

**Optional**:
- `USE_GOTRUE_DIRECT=true` - Use direct GoTrue API calls (preview only, for debugging)
- `DEBUG_AUTH=true` - Enable auth debug logging
- `DEBUG_LLM=true` - Enable LLM debug logging

## Environments

### Local Development
- Origin: `http://localhost:3000` (computed from request headers)
- Cookies: `secure: false` (allows localhost)
- No `NEXT_PUBLIC_SITE_URL` required

### Vercel Preview
- Origin: Computed from `x-forwarded-host` and `x-forwarded-proto` headers
- Automatically uses preview deployment URL (e.g., `https://plinth-git-branch.vercel.app`)
- Cookies: `secure: true` (HTTPS)

### Staging / Production
- Origin: Request-derived (no `NEXT_PUBLIC_SITE_URL` dependency)
- Uses domain from request headers
- Cookies: `secure: true` (HTTPS)

**Key Point**: Origin is always computed from request headers. The Supabase Site URL setting should be set to production, but magic links will use the correct origin based on where the login request originated.

## Core App Flows

### 1. Create Project
- Navigate to `/dashboard`
- Click "New Project"
- Fill in project details (market, target customer, etc.)
- Save project

### 2. Add Competitors
- Open project → `/projects/[projectId]/competitors`
- Add 3-7 competitors with:
  - Name
  - URL (optional)
  - Evidence text (up to 12,000 chars per competitor)

### 3. Generate Analysis
- Click "Generate Analysis" when 3+ competitors are added
- System generates:
  - **Competitor snapshots** (one per competitor)
  - **Market synthesis** (landscape summary)
- Results stored as artifacts in database

### 4. View Results
- Navigate to `/projects/[projectId]/results`
- View competitor profiles and synthesis in tabs
- Copy sections or regenerate analysis

## Testing

### Unit & Integration Tests
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests use Vitest with mocked Supabase client. See [docs/TESTING.md](./docs/TESTING.md) for details.

### E2E Tests
```bash
# Run Playwright tests
npm run e2e

# Run with UI
npm run e2e:ui
```

E2E tests require the dev server running. See [docs/TESTING.md](./docs/TESTING.md) for auth setup.

## Deployment

### Vercel Setup

1. **Connect repository** to Vercel
2. **Set environment variables** (same as local `.env.local`)
3. **Deploy** - automatic on push to main

### Environments

- **Preview**: Auto-deployed on PR/branch push
- **Production**: Deployed on push to `main` branch

### Supabase Redirect URLs

Configure in Supabase Dashboard → Authentication → URL Configuration:

**Production**:
- Site URL: `https://myplinth.com`
- Redirect URLs: `https://myplinth.com/auth/callback`

**Staging** (if using custom domain):
- Redirect URLs: `https://staging.myplinth.com/auth/callback`

**Preview** (Vercel):
- Redirect URLs: `https://*.vercel.app/auth/callback`

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment guide.

## Troubleshooting

### `auth-code-exchange-failed` error
**Cause**: PKCE verifier cookie missing or expired.

**Fix**:
- Ensure `signInWithOtp` uses SSR client (see `app/login/actions.ts`)
- Check Supabase redirect URL allowlist includes your domain
- Verify cookies are not blocked by browser

### `redirect_to` falling back to Site URL
**Cause**: Supabase redirect URL not in allowlist.

**Fix**:
- Add your domain pattern to Supabase redirect URL allowlist
- For preview: `https://*.vercel.app/auth/callback`
- For production: `https://myplinth.com/auth/callback`

### Session expires unexpectedly
**Cause**: Cookie `maxAge` not set correctly.

**Fix**:
- Check middleware and callback route set cookies with 7-day `maxAge`
- Verify `mergeAuthCookieOptions` is applied (see `lib/supabase/cookie-options.ts`)
- Ensure PKCE verifier cookies are NOT forced to 7-day maxAge

## Documentation

- [Development Workflow](./docs/DEV_WORKFLOW.md) - Fast iteration workflow and build policy
- [Architecture](./docs/ARCHITECTURE.md) - System design and module map
- [Authentication](./docs/AUTH.md) - Auth flow and implementation details
- [Data Model](./docs/DATA_MODEL.md) - Database schema and relationships
- [Analysis Pipeline](./docs/ANALYSIS_PIPELINE.md) - How analysis generation works
- [Testing](./docs/TESTING.md) - Test strategy and conventions
- [Deployment](./docs/DEPLOYMENT.md) - Deployment guide and environment setup

## License

See [LICENSE](../LICENSE) file.
