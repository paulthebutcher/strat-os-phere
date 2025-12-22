# Information Architecture Map

This document serves as the canonical source of truth for routes and navigation structure in StratOSphere.

## Core Routes

### Public Routes
- `/` - Marketing landing page
- `/login` - Authentication page
- `/auth/callback` - OAuth callback handler (redirects to `/dashboard`)

### Authenticated Routes

#### Dashboard
- `/dashboard` - Projects list (post-login landing)
  - Component: `app/dashboard/page.tsx`
  - Shows project cards or empty state
  - "New analysis" button → `/projects/new`

#### Project Creation
- `/projects/new` - New analysis form
  - Component: `app/projects/new/page.tsx`
  - Creates project and redirects to project overview

#### Project Routes (all under `/projects/[projectId]`)
- `/projects/[projectId]` - Project overview (default route)
  - Component: `app/projects/[projectId]/page.tsx`
  - Shows readiness checklist, workflow timeline, primary CTA

- `/projects/[projectId]/overview` - Project overview (explicit)
  - Same as above, explicit route

- `/projects/[projectId]/competitors` - Competitors management
  - Component: `app/projects/[projectId]/competitors/page.tsx`
  - Add/edit competitors

- `/projects/[projectId]/results` - Results page (main results view)
  - Component: `app/projects/[projectId]/results/page.tsx`
  - Query params:
    - `?tab=<tabId>` - Show specific tab (opportunities_v3, strategic_bets, jobs, scorecard, etc.)
    - `?frame=<frame>` - Filter frame (jobs, differentiation_themes, strategic_bets, customer_struggles)
    - `?generating=true` - Show generation experience
    - `?view=results` - Explicitly show results (overrides generating)
    - `?new=true` - Show "new insights" badge
  - Default: Shows memo view (no tab param)
  - With tab param: Shows specific tab in appendix mode

- `/projects/[projectId]/opportunities` - Opportunities page (redirects to results)
  - Component: `app/projects/[projectId]/opportunities/page.tsx`
  - **Currently redirects to** `/projects/[projectId]/results?tab=opportunities_v3`
  - TODO: Extract section components and render properly

- `/projects/[projectId]/strategic-bets` - Strategic bets page
  - Component: `app/projects/[projectId]/strategic-bets/page.tsx`
  - TODO: Extract section components and render properly

- `/projects/[projectId]/jobs` - Jobs page
  - Component: `app/projects/[projectId]/jobs/page.tsx`
  - TODO: Extract section components and render properly

- `/projects/[projectId]/scorecard` - Scorecard page
  - Component: `app/projects/[projectId]/scorecard/page.tsx`
  - TODO: Extract section components and render properly

## Navigation Structure

### Left Sidebar Navigation (AppShell)
- Defined in: `lib/navigation/appNav.ts`
- Rendered in: `components/layout/AppShell.tsx`
- Navigation items:
  1. Overview → `/projects/[projectId]/overview`
  2. Opportunities → `/projects/[projectId]/opportunities` (redirects to results)
  3. Strategic Bets → `/projects/[projectId]/strategic-bets` (conditional)
  4. Jobs → `/projects/[projectId]/jobs`
  5. Scorecard → `/projects/[projectId]/scorecard`
  6. Competitors → `/projects/[projectId]/competitors`
  7. Evidence → `/projects/[projectId]/evidence` (conditional)
  8. Settings → `/projects/[projectId]/settings` (conditional)

### Results Page Tabs
- Defined in: `lib/ui/resultsTab.ts`
- Available tabs:
  - `opportunities_v3` - Primary opportunities view (canonical)
  - `opportunities_v2` - Legacy opportunities view
  - `opportunities` - Legacy opportunities (from synthesis)
  - `strategic_bets` - Strategic bets
  - `jobs` - Jobs to be done
  - `scorecard` - Competitive scorecard
  - `profiles` - Competitor profiles
  - `themes` - Differentiation themes
  - `positioning` - Positioning map
  - `angles` - Differentiation angles

## Known Issues & Patterns

### Opportunities Variants
- **Issue**: Multiple opportunities variants exist (v3, v2, legacy)
- **Current state**: 
  - `opportunities_v3` is canonical (preferred)
  - `opportunities_v2` is legacy but still supported
  - `opportunities` (from synthesis) is legacy
- **Navigation**: Left nav "Opportunities" → `/projects/[projectId]/opportunities` → redirects to results with `?tab=opportunities_v3`
- **Guardrail needed**: Normalize to single canonical route

### Results Page Navigation
- **Default behavior**: Shows memo view (no tab param)
- **Tab mode**: With `?tab=<tabId>`, shows specific tab in appendix mode
- **Potential issue**: Redirect loops if tab resolution is incorrect
- **Guardrail needed**: Ensure tab resolution doesn't cause loops

### Left Nav Persistence
- **Implementation**: Uses `usePathname()` in AppShell to highlight active item
- **Active detection**: `pathname === href || pathname?.startsWith(href + '/')`
- **Potential issue**: May not correctly highlight when on results page with tab param
- **Guardrail needed**: Ensure active state matches current route, not transient tab state

## Route Definitions

### File Locations
- Dashboard: `app/dashboard/page.tsx`
- Login: `app/login/page.tsx`
- New Project: `app/projects/new/page.tsx`
- Project Overview: `app/projects/[projectId]/page.tsx`
- Project Overview (explicit): `app/projects/[projectId]/overview/page.tsx` (if exists)
- Competitors: `app/projects/[projectId]/competitors/page.tsx`
- Results: `app/projects/[projectId]/results/page.tsx`
- Opportunities: `app/projects/[projectId]/opportunities/page.tsx`
- Strategic Bets: `app/projects/[projectId]/strategic-bets/page.tsx`
- Jobs: `app/projects/[projectId]/jobs/page.tsx`
- Scorecard: `app/projects/[projectId]/scorecard/page.tsx`

### Navigation Source of Truth
- Left nav items: `lib/navigation/appNav.ts`
- Results tabs: `lib/ui/resultsTab.ts`

