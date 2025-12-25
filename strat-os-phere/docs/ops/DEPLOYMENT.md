# Deployment

**Purpose**: Deployment procedures, Vercel configuration, and environment setup.

**When to read this**: Read this to understand how to deploy Plinth to Vercel and configure environments.

**Last updated**: 2025-01-27

---

## Environments

### Preview
- **Trigger**: Automatic on push to any branch/PR
- **URL**: `https://plinth-git-{branch}.vercel.app`
- **Purpose**: Test changes before merging
- **Origin**: Auto-detected from `x-forwarded-host` header

### Staging (Optional)
- **Trigger**: Manual or on push to `staging` branch
- **URL**: `https://staging.myplinth.com` (custom domain)
- **Purpose**: Pre-production testing
- **Setup**: Requires DNS + Vercel domain configuration

### Production
- **Trigger**: Automatic on push to `main` branch
- **URL**: `https://myplinth.com` (custom domain)
- **Purpose**: Live application
- **Setup**: Requires DNS + Vercel domain configuration

## Vercel Setup

### Initial Setup

1. **Connect Repository**:
   - Go to Vercel Dashboard → Add New Project
   - Import Git repository
   - Select framework: **Next.js**

2. **Configure Build**:
   - Framework Preset: Next.js
   - Root Directory: `strat-os-phere` (if monorepo)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all required variables (see below)

### Environment Variables

**Required for all environments**:

| Variable | Description | Example |
|-----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

**Optional**:
- `USE_GOTRUE_DIRECT=true` - Use direct GoTrue API (preview only, debugging)
- `DEBUG_AUTH=true` - Enable auth debug logging
- `DEBUG_LLM=true` - Enable LLM debug logging

**Setting per environment**:
- Vercel allows setting variables per environment (Production, Preview, Development)
- Use same values across environments (except secrets if needed)

### Domain Setup

#### Staging Domain (`staging.myplinth.com`)

1. **DNS Configuration**:
   - Add CNAME record: `staging` → `cname.vercel-dns.com`
   - Or A record: `staging` → Vercel IP (if provided)

2. **Vercel Domain**:
   - Go to Project Settings → Domains
   - Add domain: `staging.myplinth.com`
   - Vercel will verify DNS and provision SSL

#### Production Domain (`myplinth.com`)

1. **DNS Configuration**:
   - Add A record: `@` → Vercel IP
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Or use Vercel nameservers (recommended)

2. **Vercel Domain**:
   - Go to Project Settings → Domains
   - Add domain: `myplinth.com`
   - Add domain: `www.myplinth.com` (optional)
   - Vercel will verify DNS and provision SSL

## Supabase Redirect URL Configuration

### Required Settings

**Supabase Dashboard** → Authentication → URL Configuration

### Site URL
Set to production domain:
```
https://myplinth.com
```

**Note**: This is used as fallback. Magic links use request-derived origin (see [AUTH.md](./AUTH.md)).

### Redirect URL Allowlist

Add patterns for all environments:

**Production**:
```
https://myplinth.com/auth/callback
https://www.myplinth.com/auth/callback  (if using www)
```

**Staging** (if using custom domain):
```
https://staging.myplinth.com/auth/callback
```

**Preview** (Vercel):
```
https://*.vercel.app/auth/callback
```

**Local** (optional, for testing):
```
http://localhost:3000/auth/callback
```

### Wildcard Pattern

Use `*` wildcard for preview deployments:
- `https://*.vercel.app/auth/callback` matches all preview URLs
- No need to add each preview URL individually

## Deployment Process

### Automatic Deployments

**Preview**:
1. Push to any branch or create PR
2. Vercel automatically creates preview deployment
3. Preview URL available in PR comments

**Production**:
1. Merge PR to `main` branch
2. Vercel automatically deploys to production
3. Deployment status in Vercel dashboard

### Manual Deployments

**Redeploy**:
- Go to Vercel Dashboard → Deployments
- Click "Redeploy" on any deployment
- Or use Vercel CLI: `vercel --prod`

**Promote Preview to Production**:
- Go to Preview deployment
- Click "Promote to Production"

### Verifying Deployments

**Check Deployment Status**:
1. Go to Vercel Dashboard → Deployments
2. Verify build succeeded (green checkmark)
3. Check build logs for errors

**Test Preview URL**:
1. Click preview URL in Vercel dashboard
2. Verify app loads correctly
3. Test auth flow (magic link)
4. Test core functionality

**Test Production**:
1. Visit production domain
2. Verify app loads correctly
3. Test auth flow
4. Monitor error logs

## Git Push Workflow

### Typical Flow

```
1. Create feature branch
   git checkout -b feature/new-feature

2. Make changes and commit
   git add .
   git commit -m "Add new feature"

3. Push to remote
   git push origin feature/new-feature

4. Vercel creates preview deployment
   → https://plinth-git-feature-new-feature.vercel.app

5. Test preview deployment

6. Create PR (optional)
   → Preview URL in PR comments

7. Merge to main
   git checkout main
   git merge feature/new-feature
   git push origin main

8. Vercel deploys to production
   → https://myplinth.com
```

### Branch Protection (Recommended)

**GitHub/GitLab Settings**:
- Require PR reviews before merging to `main`
- Require status checks (Vercel build) to pass
- Prevent force push to `main`

## Troubleshooting

### Build Failures

**Common Causes**:
- Missing environment variables
- TypeScript errors
- Linting errors
- Dependency issues

**Fix**:
1. Check build logs in Vercel dashboard
2. Fix errors locally (`npm run build`)
3. Push fix and redeploy

### Preview URL Not Working

**Symptoms**:
- Preview deployment succeeds but URL returns 404
- Auth redirects to wrong domain

**Fix**:
1. Verify Supabase redirect URL allowlist includes `https://*.vercel.app/auth/callback`
2. Check origin computation (see `/api/debug/origin`)
3. Verify environment variables are set

### Production Domain Not Working

**Symptoms**:
- Domain shows "Not Found" or SSL error
- DNS not resolving

**Fix**:
1. Verify DNS records are correct
2. Check Vercel domain status (should show "Valid Configuration")
3. Wait for DNS propagation (up to 48 hours)
4. Verify SSL certificate is provisioned

### Auth Not Working in Preview

**Symptoms**:
- Magic link redirects to production domain
- `auth-code-exchange-failed` error

**Fix**:
1. Add `https://*.vercel.app/auth/callback` to Supabase redirect allowlist
2. Verify `getOrigin()` returns correct preview URL
3. Check `/api/debug/origin` endpoint

### Environment Variables Not Applied

**Symptoms**:
- App works locally but fails in Vercel
- Missing API keys or config

**Fix**:
1. Verify environment variables are set in Vercel dashboard
2. Check which environment (Production/Preview/Development)
3. Redeploy after adding variables (variables don't apply to existing deployments)

## Monitoring

### Vercel Analytics

**Enable**:
- Go to Project Settings → Analytics
- Enable Vercel Analytics (if using paid plan)

**Monitor**:
- Page views, performance metrics
- Error rates
- Deployment status

### Error Tracking

**Vercel Logs**:
- Go to Deployments → Select deployment → Functions
- View serverless function logs
- Check for runtime errors

**Application Logs**:
- Use `logger` utility (`lib/logger.ts`)
- Logs appear in Vercel function logs
- Use debug flags (`DEBUG_AUTH`, `DEBUG_LLM`) for verbose logging

### Health Checks

**Debug Endpoints**:
- `/api/whoami` - Check auth state
- `/api/debug/origin` - Inspect origin computation
- `/api/supabase-version` - Check package versions

**Use in Monitoring**:
- Set up uptime monitoring (e.g., UptimeRobot)
- Ping health check endpoint
- Alert on failures

## Rollback

### Rollback to Previous Deployment

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Confirm rollback

### Rollback via Git

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or checkout previous commit
git checkout <previous-commit-hash>
git push origin main --force  # ⚠️ Use with caution
```

## CI/CD Integration

### GitHub Actions (Optional)

If you want custom CI/CD:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Note**: Vercel's built-in Git integration is usually sufficient. Custom CI/CD is only needed for advanced workflows.

## Best Practices

1. **Test in Preview First**: Always test changes in preview before merging to main
2. **Monitor Deployments**: Check deployment status and logs after each deploy
3. **Environment Parity**: Keep environment variables consistent across environments
4. **Rollback Plan**: Know how to rollback if production deployment fails
5. **DNS Propagation**: Allow time for DNS changes to propagate (up to 48 hours)
6. **SSL Certificates**: Vercel automatically provisions SSL, but verify after domain setup

