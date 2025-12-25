# Navigation QA Checklist

## Purpose
Regression checklist for verifying left navigation works correctly across project pages.

## Test Scenarios

### Desktop Navigation (md breakpoint and above)

1. **Basic Navigation**
   - [ ] Navigate to any project page (e.g., `/projects/[projectId]/opportunities`)
   - [ ] Click "Competitors" in left nav
   - [ ] Verify URL changes to `/projects/[projectId]/competitors`
   - [ ] Verify page content loads (not stuck on previous page)
   - [ ] Verify "Competitors" nav item is highlighted (active state)

2. **All Nav Items**
   - [ ] Click each nav item: Opportunities, Competitors, Scorecard, Evidence, Appendix, Settings
   - [ ] For each: verify URL changes, content loads, active state updates
   - [ ] No "dead clicks" (cursor shows URL but nothing happens)

3. **Active State**
   - [ ] Navigate to `/projects/[projectId]/competitors`
   - [ ] Verify "Competitors" is highlighted
   - [ ] Navigate to `/projects/[projectId]/competitors/add` (if exists)
   - [ ] Verify "Competitors" still highlighted (nested routes should keep parent active)

4. **Back to Projects Link**
   - [ ] Click "Back to Projects" in sidebar
   - [ ] Verify navigation to `/dashboard`
   - [ ] Verify dashboard loads correctly

5. **Overlay/Click Interception**
   - [ ] With status bar or banners visible on project page
   - [ ] Verify sidebar links remain clickable
   - [ ] Verify no invisible overlays blocking clicks

### Mobile Navigation

1. **Mobile Menu**
   - [ ] On mobile viewport, verify hamburger menu appears
   - [ ] Click hamburger to open drawer
   - [ ] Click any nav item
   - [ ] Verify drawer closes and navigation occurs
   - [ ] Verify URL changes and content loads

2. **Mobile Backdrop**
   - [ ] Open mobile drawer
   - [ ] Click backdrop (dark overlay)
   - [ ] Verify drawer closes without navigation

### Edge Cases

1. **Rapid Clicks**
   - [ ] Rapidly click different nav items
   - [ ] Verify no navigation race conditions
   - [ ] Verify final destination is correct

2. **Browser Back/Forward**
   - [ ] Navigate: Opportunities → Competitors → Evidence
   - [ ] Use browser back button
   - [ ] Verify active state updates correctly
   - [ ] Use browser forward button
   - [ ] Verify active state updates correctly

3. **Direct URL Access**
   - [ ] Directly navigate to `/projects/[projectId]/settings`
   - [ ] Verify "Settings" nav item is highlighted
   - [ ] Verify page loads correctly

## Debugging

If navigation fails:

1. **Check Browser Console**
   - In dev mode, look for `[ProjectSidebar] Navigation click:` logs
   - Verify href and pathname values are correct

2. **Check Network Tab**
   - Verify Next.js router requests are being made
   - Check for 404s or other errors

3. **Check Z-Index**
   - Inspect sidebar element
   - Verify `z-10` is applied on desktop
   - Verify no overlays have higher z-index covering sidebar

4. **Check Link Elements**
   - Inspect nav link elements
   - Verify they render as `<a>` tags (not buttons)
   - Verify `href` attribute is present
   - Verify no `preventDefault` or `stopPropagation` on parent elements

## Automated Test (Optional)

If Playwright tests exist, add:

```typescript
test('project navigation works', async ({ page }) => {
  await page.goto('/projects/[projectId]/opportunities')
  await page.click('[data-testid="project-nav-item-competitors"]')
  await expect(page).toHaveURL(/\/projects\/.*\/competitors/)
  await expect(page.locator('h1, h2')).toContainText(/competitor/i)
})
```

