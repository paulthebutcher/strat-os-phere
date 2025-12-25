# Test PR Validation Checklist

**Purpose**: Guide for validating test PR changes using the dev-only QA harness.

**When to use**: After creating or modifying opportunity UI components to verify edge case handling without depending on Supabase state.

---

## Quick Start

1. **Run locally**: `pnpm dev`
2. **Navigate**: Open `http://localhost:3000/dev/qa`
3. **Validate**: Click through each scenario and verify rendering

---

## How to Run

### Prerequisites
- Local dev server running (`pnpm dev`)
- No authentication required (dev-only route)

### Steps

1. Start the dev server:
   ```bash
   pnpm dev
   ```

2. Visit the QA dashboard:
   ```
   http://localhost:3000/dev/qa
   ```

3. Click through each scenario in the left sidebar:
   - **Full Opportunity**: Complete opportunity with all fields
   - **Missing Optional Fields**: Tests missing excerpt/retrievedAt handling
   - **Thin Evidence**: Tests "thin evidence" callout (3 citations, 2 types)
   - **Empty State**: Tests empty state rendering

4. For scenarios with opportunities:
   - Verify the opportunity card renders correctly
   - Click "View evidence" to test evidence drawer
   - Expand/collapse "Risks & assumptions" section
   - Check that all fields display properly

---

## What to Verify

### ✅ Visual Checks

#### Full Opportunity Scenario
- [ ] All sections render: title, confidence badge, evidence strength, "What to do", "Why now", "Why this ranks"
- [ ] Evidence strength shows "Strong" with citation count
- [ ] Evidence type pills display correctly
- [ ] "View evidence" button works and opens drawer
- [ ] Evidence drawer shows all 6 citations with correct metadata
- [ ] "Risks & assumptions" section expands/collapses
- [ ] Risks and assumptions display in separate sections
- [ ] All links are clickable (evidence drawer links open in new tab)

#### Missing Optional Fields Scenario
- [ ] Opportunity renders without crashing
- [ ] Citations without `retrievedAt` still display
- [ ] Citations without `label` use domain as fallback
- [ ] Empty risks array doesn't show errors
- [ ] Assumptions section still displays correctly
- [ ] No "undefined" or "null" text appears

#### Thin Evidence Scenario
- [ ] "Evidence is thin" callout appears (yellow/border styling)
- [ ] Evidence strength shows "Limited"
- [ ] Callout text: "Evidence is thin — treat as directional."
- [ ] "Improve evidence coverage" button is present and links correctly
- [ ] Evidence drawer works normally

#### Empty State Scenario
- [ ] Empty state component renders
- [ ] Message explains there are no opportunities
- [ ] Action button allows navigation to another scenario
- [ ] No errors or crashes

### ✅ Functional Checks

- [ ] Scenario switcher updates preview correctly
- [ ] Evidence drawer opens/closes smoothly
- [ ] All external links open in new tab with `rel="noopener noreferrer"`
- [ ] Collapsible sections (Risks & assumptions) expand/collapse
- [ ] No console errors or warnings
- [ ] No TypeScript errors in build

---

## Regression Questions

### Missing Optional Fields Handling
- ✅ **Does it handle missing optional fields?**
  - Check that citations without `retrievedAt` still render
  - Check that citations without `label` use domain as fallback
  - Check that empty arrays (risks, assumptions) don't cause crashes
  - Verify no "undefined" or "null" strings appear in UI

### Empty State
- ✅ **Does empty state explain next step?**
  - Empty state should clearly indicate no opportunities exist
  - Should provide action to view other scenarios or add opportunities
  - Should not show error messages or broken UI

### Links and Navigation
- ✅ **Do links open correctly?**
  - Evidence drawer "Open source" links open in new tab
  - Links have proper `target="_blank"` and `rel="noopener noreferrer"`
  - Internal navigation (scenario switching) works smoothly

### Thin Evidence Detection
- ✅ **Does thin evidence callout trigger correctly?**
  - Appears when exactly 3 citations OR only 2 types
  - Callout styling is visually distinct (border, background)
  - "Improve evidence coverage" link works

### Component Integration
- ✅ **Do components compose correctly?**
  - `OpportunityCardV1` renders without errors
  - `OpportunityEvidenceDrawer` integrates properly
  - Empty state component works in context

---

## Expected Behaviors by Scenario

### Full Opportunity
- **Evidence strength**: "Strong (6 citations across 4 types)"
- **Confidence badge**: "Investment Ready"
- **Evidence drawer**: 6 citations with full metadata
- **Risks**: 2 items listed
- **Assumptions**: 2 items listed
- **Why this ranks**: 3 items listed

### Missing Optional Fields
- **Evidence strength**: "Moderate (3 citations across 3 types)"
- **Confidence badge**: "Directional"
- **Some citations**: Missing `retrievedAt` (handled gracefully)
- **Risks**: Empty array (section hidden)
- **Assumptions**: 2 items listed

### Thin Evidence
- **Evidence strength**: "Limited (3 citations across 2 types)"
- **Thin evidence callout**: Visible with warning styling
- **Confidence badge**: "Exploratory"
- **Evidence drawer**: 3 citations, all from reviews/changelog
- **Improve evidence link**: Present and functional

### Empty State
- **No opportunities**: Empty state component rendered
- **Message**: Clear explanation of empty state
- **Action**: Button to view other scenarios

---

## Troubleshooting

### Route Not Found
- **Issue**: `/dev/qa` returns 404
- **Solution**: Check that `NODE_ENV !== 'production'` or `ENABLE_DEV_TOOLS === 'true'`

### Components Not Rendering
- **Issue**: Opportunities don't appear or show errors
- **Solution**: 
  - Check browser console for errors
  - Verify fixtures match OpportunityV1 schema
  - Ensure all required imports are present

### Evidence Drawer Not Opening
- **Issue**: "View evidence" button doesn't work
- **Solution**:
  - Check that `OpportunityEvidenceDrawer` is imported correctly
  - Verify citations array is populated
  - Check for JavaScript errors in console

### Type Errors
- **Issue**: TypeScript errors in build
- **Solution**:
  - Run `pnpm typecheck` to see specific errors
  - Verify fixture types match component expectations
  - Check that all imports use correct types

---

## Notes

- **No backend calls**: All fixtures are deterministic and don't require Supabase
- **Dev-only**: This route is never accessible in production builds
- **Isolated**: Changes here don't affect production UI components
- **Reusable**: Can be re-run anytime without data dependencies

---

## Related Files

- `/app/dev/qa/page.tsx` - Dev-only route entry point
- `/app/dev/qa/QADashboardClient.tsx` - Scenario switcher UI
- `/lib/content/qa/fixtures.ts` - Deterministic test fixtures
- `/components/opportunities/OpportunityCardV1.tsx` - Opportunity card component
- `/components/evidence/OpportunityEvidenceDrawer.tsx` - Evidence drawer component

