# Project Navigation

## Overview

Project navigation is **canonical** and must not be forked or modified per-page. All project pages use the same left navigation structure.

## Canonical Structure

The project navigation follows a fixed structure defined in `lib/navigation/projectNavSchema.ts`:

### Top Utility
- **Back to Projects** (link to `/dashboard`)

### Project Context
- Project title (or "Untitled Project" if not set)
- Subtitle (optional, e.g., market)

### WORKFLOW (project-scoped)
1. **Decision** - Executive readout and primary recommendation
2. **Competitors** - Competitor management
3. **Evidence** - Supporting evidence and citations
4. **Scorecard** - Competitive scorecard
5. **Appendix** - Additional artifacts

### META
- **Settings** - Project settings (pinned at bottom)

## Rules

### Never Do These

1. **Never hide steps conditionally**
   - If a step is unavailable, render it as disabled with status text/badge
   - All steps must always be visible

2. **Never reorder steps**
   - The order is fixed: Decision → Competitors → Evidence → Scorecard → Appendix → Settings
   - Do not change order based on state or user progress

3. **Never conditionally render different group headings**
   - The structure is fixed and must not vary

4. **Never create page-specific nav variants**
   - Do not create new nav components for specific pages
   - Do not duplicate nav item definitions

5. **Never hard-code nav labels**
   - All labels must come from `projectNavSchema.ts`
   - Do not create local arrays of nav items

### Always Do These

1. **Use ProjectAppShell for all project pages**
   - All project pages must use `ProjectAppShell` from `@/components/layout/ProjectAppShell`
   - This ensures consistent layout and 24px gutter enforcement

2. **Use ProjectNav for navigation**
   - The only nav component is `ProjectNav` from `@/components/nav/ProjectNav`
   - It uses the canonical schema automatically

3. **Selection highlighting is route-based only**
   - Active item highlighting is determined by the current route
   - Do not add custom logic for highlighting

4. **Status metadata is optional**
   - Step state (ready/blocked/complete) can be passed to ProjectNav
   - But it must not change layout height significantly

## Implementation

### Adding a New Step

If you need to add a new navigation step:

1. **Edit the schema** (`lib/navigation/projectNavSchema.ts`):
   ```typescript
   export const PROJECT_NAV_STEPS: ProjectNavStep[] = [
     // ... existing steps
     {
       id: 'new-step',
       label: 'New Step',
       href: paths.newStep,
       icon: NewIcon,
       matchers: (id) => [paths.newStep(id)],
     },
   ]
   ```

2. **Add the route** (`lib/routes.ts`):
   ```typescript
   export const paths = {
     // ... existing paths
     newStep: (projectId: string) => `/projects/${projectId}/new-step`,
   }
   ```

3. **Create the page** (`app/projects/[projectId]/new-step/page.tsx`):
   ```typescript
   export default async function NewStepPage() {
     // Page content - ProjectAppShell is provided by layout.tsx
     return <PageShell>...</PageShell>
   }
   ```

4. **Update tests** - Add test cases to `tests/unit/navigation/projectNavSchema.test.ts`

### Layout Contract

The `ProjectAppShell` enforces:

- **Sidebar width**: 240px (desktop)
- **Gutter**: 24px maximum between nav and content
- **Main content margin-left**: 240px (sidebar width)
- **Main content padding-left**: 24px (creates the gutter)

This ensures no "white strip" or extra column between nav and content.

## Drift Prevention

### Automated Checks

Run the drift guard script:

```bash
pnpm nav:check
```

This checks for:
- Old nav component names being used
- Hard-coded nav labels outside the schema
- Duplicate nav definitions

### Manual Checklist

Before merging PRs that touch navigation:

- [ ] All project pages use `ProjectAppShell`
- [ ] No page-specific nav components
- [ ] No hard-coded nav labels
- [ ] Nav order matches schema exactly
- [ ] Settings is pinned at bottom
- [ ] All steps always visible (never conditionally hidden)

## Deprecated Components

The following components are deprecated and should not be used:

- `ProjectSidebar` → Use `ProjectNav`
- `ProjectLayoutShell` → Use `ProjectAppShell`
- `ProjectShell` → Use `ProjectAppShell`
- `ProjectNavigator` → Use `ProjectNav`

## Testing

### Unit Tests

- `tests/unit/navigation/projectNavSchema.test.ts` - Schema structure and helpers
- `tests/unit/navigation/projectNav.test.tsx` - Component rendering

### Manual QA

1. Navigate to each project step route; confirm left nav looks identical (same order, same spacing)
2. Confirm Settings is pinned at bottom and always visible
3. Confirm main content starts within 24px of nav (no blank column)
4. Confirm long pages scroll (Decision page with expanded "additional details" should scroll)
5. Confirm active item highlighting follows route
6. Confirm no blank screen if a step fetch fails: nav still renders

## Related Files

- **Schema**: `lib/navigation/projectNavSchema.ts`
- **Component**: `components/nav/ProjectNav.tsx`
- **Shell**: `components/layout/ProjectAppShell.tsx`
- **Drift Guard**: `scripts/checkProjectNavDrift.ts`
- **Routes**: `lib/routes.ts`

