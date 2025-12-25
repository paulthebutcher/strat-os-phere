# Troubleshooting

**Purpose**: Common issues, solutions, and debugging tips for Plinth development.

**When to read this**: When you encounter build failures, environment issues, or unexpected behavior.

**Last updated**: 2025-01-27

---

## Build Failures

### Forbidden Token Violations

**Error**: Build fails with `❌ Forbidden token check failed`

**Cause**: Code references a database column or field that doesn't exist (schema drift risk).

**Solution**:
1. Check the error message for which token/column is forbidden
2. Use centralized data access functions in `lib/data/` instead of direct column references
3. Run `pnpm check:forbidden` before committing to catch issues early
4. Review [data/MIGRATIONS.md](../data/MIGRATIONS.md) for current schema

**Example**:
```typescript
// ❌ Bad: Direct column reference
const result = await supabase.from('projects').select('nonexistent_column')

// ✅ Good: Use centralized selector
import { getProjectById } from '@/lib/data/projects'
const project = await getProjectById(supabase, projectId)
```

### Schema Drift Errors

**Error**: `[SCHEMA_DRIFT]` error in logs or PostgREST missing column errors

**Cause**: Database schema has changed but code still references old columns, or PostgREST cache is stale.

**Solution**:
1. Verify schema changes have been applied: run migrations if needed
2. Check for forbidden tokens: `pnpm check:schema`
3. Clear PostgREST schema cache (if using Supabase):
   - Supabase Dashboard → API → Rebuild Schema Cache
   - Or restart Supabase instance
4. Review [data/MIGRATIONS.md](../data/MIGRATIONS.md) for recent schema changes

### Next.js Build Stuck / Lock File Issues

**Error**: Build hangs or `.next` lock file errors

**Cause**: Stale `.next` directory or build cache issues.

**Solution**:
```bash
# Clean build directory
rm -rf .next

# Run guarded build (includes lock file check)
pnpm build
```

The build process includes automatic lock file checking via `scripts/guard-next-build.mjs`.

## Environment Setup Issues

### Missing Environment Variables

**Error**: `NEXT_PUBLIC_SUPABASE_URL is undefined` or similar

**Solution**:
1. Create `.env.local` file in project root
2. Add required variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   OPENAI_API_KEY=your-openai-api-key
   ```
3. Restart dev server: `pnpm dev`

See the root [README.md](../../README.md) for complete environment variable list.

### Supabase Connection Issues

**Error**: Cannot connect to Supabase or auth fails

**Solutions**:
1. **Check Supabase project status**: Ensure project is active in Supabase Dashboard
2. **Verify environment variables**: Double-check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Check redirect URLs**: Ensure your domain is in Supabase auth redirect URL allowlist
   - For localhost: `http://localhost:3000/auth/callback`
   - For preview: `https://*.vercel.app/auth/callback`
4. **Review auth flow**: See [security/Auth.md](../security/Auth.md) for auth implementation details

### Local Supabase Reset

**Problem**: Need to reset local Supabase database for testing

**Solution** (if using local Supabase):
```bash
# Stop Supabase
supabase stop

# Reset database
supabase db reset

# Start Supabase
supabase start
```

**Note**: This project typically uses a remote Supabase instance. For production reset, use Supabase Dashboard → Database → Reset.

## Migration Order Issues

**Error**: Migration fails due to dependency order or conflicting changes

**Solution**:
1. Review [data/MIGRATIONS.md](../data/MIGRATIONS.md) for migration order
2. Check for conflicting migrations (e.g., adding same column twice)
3. Ensure migrations are idempotent (use `IF NOT EXISTS` where appropriate)
4. Test migrations on a local/staging database first

## PostgREST Schema Cache

**Error**: Column doesn't exist in PostgREST API even though it exists in database

**Cause**: PostgREST schema cache is stale after schema changes.

**Solution**:
1. **Supabase Dashboard**: Go to API → Rebuild Schema Cache
2. **Local Supabase**: Restart Supabase instance
3. **Wait**: Sometimes takes a few minutes to propagate

## Local Development Gotchas

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
PORT=3001 pnpm dev
```

### TypeScript Errors After Dependency Changes

**Error**: TypeScript errors appear after `pnpm install`

**Solution**:
1. Restart TypeScript server in your IDE
2. Clear TypeScript cache: `rm -rf node_modules/.cache`
3. Re-run type checking: `pnpm typecheck`

### Hot Reload Not Working

**Error**: Changes not reflected in browser after file save

**Solution**:
1. Check browser console for errors
2. Restart dev server: `pnpm dev`
3. Clear browser cache or use incognito mode
4. Check file is not in `.gitignore` or build exclusion

## Testing Issues

### Tests Fail Due to Missing Mocks

**Error**: Tests fail with Supabase or API errors

**Solution**:
1. Ensure mocks are set up in test files (see [testing/TESTING.md](../testing/TESTING.md))
2. Check `tests/setup.ts` for global test configuration
3. Review existing test files for mock patterns

### E2E Tests Fail

**Error**: Playwright tests fail with auth or navigation errors

**Solution**:
1. Ensure dev server is running: `pnpm dev`
2. Check auth setup in test files (see [testing/TESTING.md](../testing/TESTING.md))
3. Verify test user exists in Supabase or use test auth helpers
4. Run with UI to debug: `pnpm e2e:ui`

## Performance Issues

### Slow Build Times

**Problem**: `pnpm build` takes too long during development

**Solution**:
- Use `pnpm preflight` for fast checks during iteration (type checking + linting only)
- Only run `pnpm build` before merging to main
- See [onboarding/DEV_WORKFLOW.md](../onboarding/DEV_WORKFLOW.md) for build policy

### Slow Dev Server Startup

**Problem**: `pnpm dev` takes a long time to start

**Solution**:
1. Check for large dependencies or unnecessary imports
2. Ensure Node.js version is 20+ (check with `node --version`)
3. Clear `.next` directory: `rm -rf .next`

## Getting More Help

- Review relevant documentation:
  - [onboarding/START_HERE.md](../onboarding/START_HERE.md) - Setup and workflows
  - [INDEX.md](../INDEX.md) - Documentation index
- Check existing issues in the repository
- Review code comments and inline documentation

