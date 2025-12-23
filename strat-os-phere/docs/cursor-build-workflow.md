# Cursor Build Workflow

This document outlines the recommended build workflow for Cursor and CI to prevent concurrent build failures.

## Quick Reference

**For Cursor prompts, use this one-liner:**
```
Run pnpm preflight only; do not run pnpm build unless asked; do not retry builds automatically.
```

## Build Commands

### `pnpm preflight` (Recommended for Iteration)
Fast checks that don't require a full build:
- TypeScript type checking
- ESLint linting

Use this while iterating on code changes. It's fast and safe to run multiple times.

### `pnpm build:clean` (Local Development)
Full Next.js build with safety guards:
- Checks for and handles concurrent builds
- Cleans `.next` directory before building
- In local dev: attempts to gracefully terminate existing builds if detected
- Runs the full Next.js build

Use this when you need a complete build locally.

### `pnpm build:ci` (CI/CD)
Strict build mode for CI environments:
- Fails fast if another build is detected (no killing)
- Cleans `.next` directory before building
- Ensures deterministic builds in CI

**CI should always use `pnpm build:ci` instead of `pnpm build`.**

### `pnpm build` (Legacy)
Standard Next.js build without guards. Kept for backward compatibility.

**Note:** For new workflows, prefer `build:clean` or `build:ci`.

## Best Practices

1. **During Development:**
   - Use `pnpm preflight` for quick validation
   - Only run `pnpm build:clean` when you need a full build
   - Do not run builds in parallel
   - Do not auto-retry builds if they fail

2. **In CI:**
   - Always use `pnpm build:ci`
   - Use `pnpm install --frozen-lockfile` to ensure lockfile consistency
   - Fail fast on build lock conflicts (don't retry)

3. **If Build Fails:**
   - Check for concurrent builds: `ps aux | grep "next build"`
   - Manually clean if needed: `rm -rf .next`
   - Run `pnpm build:clean` again

## How It Works

The `guard-next-build.mjs` script:
- Detects running Next.js build processes
- In CI: exits with error if concurrent build detected
- In local dev: attempts to terminate existing builds gracefully (SIGTERM → SIGKILL)
- Cleans build artifacts (`.next` and `node_modules/.cache`) before building
- Provides clear logging of all actions

This prevents the "is another instance of next build running?" error by ensuring only one build runs at a time.

