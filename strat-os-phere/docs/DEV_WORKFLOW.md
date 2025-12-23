# Development Workflow

## Build Policy

**Fast iteration, slow build**: Use `pnpm preflight` during everyday development. Only run `pnpm build` when necessary.

### When to use `pnpm preflight` (fast check)
- During active development and iteration
- Before committing changes
- When verifying TypeScript and linting
- As the default verification command

### When to use `pnpm build` (full production build)
- Before merging to `main` branch
- When touching routing, layout, or deployment configuration
- When verifying production build output
- **Note**: Vercel Preview deployments are the source of truth for full production builds

## Commands

### Fast Verification
```bash
pnpm preflight
```
Runs TypeScript type checking and ESLint. Much faster than a full build.

### Full Production Build
```bash
pnpm build
```
Runs the complete Next.js production build. Use sparingly during iteration.

### Development
```bash
pnpm dev
```
Starts the Next.js development server.

### Type Checking Only
```bash
pnpm typecheck
```
Runs TypeScript compiler in check-only mode (no emit).

### Linting Only
```bash
pnpm lint
```
Runs ESLint on the codebase.

## When to Run What

| Scenario | Command | Why |
|----------|---------|-----|
| Making code changes | `pnpm preflight` | Fast feedback on types and linting |
| Before committing | `pnpm preflight` | Catch errors before they reach CI |
| Before merging to main | `pnpm build` | Verify production build succeeds |
| Changing routes/layouts | `pnpm build` | Ensure Next.js routing is valid |
| CI/CD pipeline | `pnpm ci:preflight` | Fast checks in automated workflows |
| Vercel deployment | Automatic | Vercel runs `pnpm build` on deploy |

## Dependency Management

- **Do not run `pnpm install`** unless `package.json` or lockfile (`pnpm-lock.yaml`) has changed
- Cursor and other tools should avoid unnecessary dependency reinstalls
- Use `pnpm -s` flag to keep output concise in scripts

## Integration with Cursor

If using Cursor AI, prefer `pnpm preflight` over `pnpm build` for verification. See `.cursor/rules.md` for Cursor-specific guidance.

