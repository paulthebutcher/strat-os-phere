# Cursor Rules for StratOSphere

## Build and Verification

- **Prefer `pnpm preflight` over `pnpm build`** for verification during development
- Only run `pnpm build` when:
  - Merging to main branch
  - Touching routing, layout, or deployment configuration
  - Verifying production build output
- Use `pnpm -s` flag in scripts to keep output concise

## Dependency Management

- **Do not run `pnpm install`** unless `package.json` or `pnpm-lock.yaml` has actually changed
- Avoid unnecessary dependency reinstalls during iteration

## Scripts

- Do not modify scripts in `package.json` unless directly related to the current task
- Keep existing scripts intact; only extend when needed

## Workflow

- Follow the fast iteration / slow build workflow documented in `docs/DEV_WORKFLOW.md`
- Vercel Preview deployments are the source of truth for full production builds

