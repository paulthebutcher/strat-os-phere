# Fast Iteration Loop

## Quick Reference

**During edits:** Run `pnpm -s preflight` (fast typecheck + lint, ~seconds to 1 minute)

**Before pushing/deployment:** Run `pnpm -s verify` (preflight + full build)

## Workflow

1. **While coding:** Use `pnpm -s preflight` to catch type errors and lint issues quickly
   - Finishes in ≤2 minutes or fails with a clear timeout message
   - Includes typecheck and lint checks
   - Use `pnpm -s preflight:tests` if you also want unit tests

2. **Before committing/pushing:** Run `pnpm -s verify`
   - Runs preflight checks first (fast failure)
   - Only runs the full `pnpm build` if preflight passes
   - This is your final gate before deployment

3. **If a command hangs:** Cancel and rerun `pnpm -s preflight` (it has timeouts)

## Important Notes

- **Avoid piping output to `head`** - can cause hangs/broken-pipe issues
- **Timeouts are built-in** - preflight will fail fast if something hangs
- **Use `build:safe`** for local iteration if you need a build (cleans stale locks)

## Scripts

- `preflight` - Fast checks (typecheck + lint)
- `preflight:tests` - Same as preflight but includes unit tests
- `verify` - Preflight + full build (final gate)
- `build:safe` - Build with stale lock cleanup

