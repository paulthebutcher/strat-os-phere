# Step 2 Competitors - QA Checklist

This document provides a checklist for validating that Step 2 "Add Competitors" works correctly end-to-end.

## Prerequisites

- User is logged in
- A project exists (created in Step 1)
- Navigate to `/projects/[projectId]/competitors`

## Test Cases

### 1. Suggestions API - No Listicles/Aggregators

**Test**: Search for competitors and verify no listicle/aggregator domains appear

**Steps**:
1. Enter a search query (e.g., "PagerDuty competitors" or "project management tools")
2. Click "Search" or press Enter
3. Review the suggestions list

**Expected**:
- ✅ No domains from blocklist appear (g2.com, capterra.com, getapp.com, softwareadvice.com, trustpilot.com, sitejabber.com, wikipedia.org, reddit.com, x.com, twitter.com, linkedin.com, etc.)
- ✅ No URLs with paths like `/alternatives`, `/compare`, `/best-`, `/top-`, `/vs/`, `/list`, `/roundup`
- ✅ Only primary company websites are shown (e.g., `pagerduty.com`, not `g2.com/products/pagerduty`)
- ✅ Company names are extracted correctly from domains or titles

**Failure Cases**:
- If suggestions are empty, should show: "No clean company domains found. Try another query or add manually."
- If API fails, should show: "Couldn't fetch suggestions. Try again."

---

### 2. Persistence - Selected Competitors Reload

**Test**: Verify selected competitors persist after page reload

**Steps**:
1. Add 3 competitors from suggestions (or manually)
2. Note the competitor names/domains
3. Refresh the page (F5 or Cmd+R)
4. Check the "Selected competitors" list on the right

**Expected**:
- ✅ All 3 competitors appear in the selected list
- ✅ Competitor names and URLs are preserved
- ✅ Order is maintained (or sorted by creation date)

**Failure Cases**:
- If no competitors exist, should show empty state: "Add competitors to map the landscape"

---

### 3. Persistence - Remove Competitor

**Test**: Verify removing a competitor persists after page reload

**Steps**:
1. Add 3 competitors
2. Click "Delete" on one competitor
3. Refresh the page
4. Check the selected list

**Expected**:
- ✅ Deleted competitor is gone
- ✅ Remaining 2 competitors are still present

---

### 4. Manual Add

**Test**: Verify manual competitor addition works

**Steps**:
1. Click "Add manually"
2. Enter a competitor name (e.g., "Monday.com")
3. Enter a URL (e.g., "monday.com" or "https://monday.com")
4. Click "Add"

**Expected**:
- ✅ Competitor is added to the selected list
- ✅ URL is normalized (https:// prefix added if missing)
- ✅ Domain is extracted correctly
- ✅ Page refreshes to show new competitor

**Validation**:
- ✅ Invalid URLs show error: "Invalid URL: [reason]"
- ✅ Empty name shows error: "Please enter a competitor name"
- ✅ Duplicate URLs show error: "This competitor is already added"

---

### 5. Minimum Competitors Gating - UI

**Test**: Verify UI prevents proceeding with <3 competitors

**Steps**:
1. Start with 0 competitors
2. Add 1 competitor
3. Check the "Generate analysis" button state
4. Add 2 more competitors (total 3)
5. Check the button state again

**Expected**:
- ✅ With <3 competitors: "Generate analysis" button is disabled
- ✅ Message shows: "Add [X] more to generate" (where X = 3 - current count)
- ✅ With ≥3 competitors: "Generate analysis" button is enabled
- ✅ Message shows: "Ready to generate"

---

### 6. Minimum Competitors Gating - Server Validation

**Test**: Verify server-side validation blocks generation with <3 competitors

**Steps**:
1. Add only 2 competitors
2. Try to trigger generation (if UI allows, or via API directly)
3. Check the error response

**Expected**:
- ✅ Server returns error: "Add at least 3 competitors to get useful evidence."
- ✅ Error code: `INSUFFICIENT_COMPETITORS`
- ✅ User is directed to add competitors

**Note**: This should be tested via API if UI properly prevents it, or by temporarily bypassing UI validation.

---

### 7. Error Handling - API Failures

**Test**: Verify error messages are actionable

**Scenarios**:

**A. Suggest API fails**:
- Expected: "Couldn't fetch suggestions. Try again."
- User can still add manually

**B. Invalid URL in manual add**:
- Expected: "Invalid URL: [specific reason]"
- Examples: "URL cannot contain spaces", "URL must include a domain name"

**C. Duplicate competitor**:
- Expected: "Already added" or "This competitor is already added"

**D. Empty suggestions**:
- Expected: "No clean company domains found. Try a specific company name or remove 'alternatives' from your query."

---

### 8. URL Normalization

**Test**: Verify URLs are normalized correctly

**Steps**:
1. Add competitor manually with various URL formats:
   - `monday.com` (no protocol)
   - `www.monday.com` (with www)
   - `https://monday.com/pricing` (with path)
   - `http://monday.com` (http instead of https)

**Expected**:
- ✅ All URLs normalized to `https://monday.com` (root domain, https, no www)
- ✅ Stored in database with normalized URL
- ✅ Display shows clean domain: `monday.com`

---

### 9. Maximum Competitors

**Test**: Verify max limit is enforced

**Steps**:
1. Add competitors until reaching max (7)
2. Try to add one more

**Expected**:
- ✅ At max: "Add manually" button is disabled
- ✅ Suggestions show "Max 7 competitors" message
- ✅ Attempting to add shows: "You can add up to 7 competitors per analysis."

---

### 10. Layout and UX

**Test**: Verify layout matches requirements

**Expected**:
- ✅ Left/Middle: Search input and suggestions list (table rows, not cards)
- ✅ Right: Selected competitors list
- ✅ Suggestions show: Company name, Domain, Add button
- ✅ Selected list shows: Company name, URL, Delete button
- ✅ Empty states are helpful and actionable

---

## Edge Cases

### Empty Query
- Search with empty query should show validation error

### Special Characters in Query
- Queries with special characters should be handled gracefully

### Very Long Company Names
- Long names should truncate or wrap appropriately

### International Domains
- Domains with non-ASCII characters should be handled

### Subdomain Handling
- `blog.company.com` should be filtered out
- `www.company.com` should normalize to `company.com`

---

## Regression Tests

After any changes to Step 2, verify:
1. ✅ Existing projects with competitors still load correctly
2. ✅ Competitors from previous sessions are preserved
3. ✅ No schema drift (only uses existing `competitors` table)
4. ✅ `pnpm run build` passes
5. ✅ No console errors in browser
6. ✅ No TypeScript errors

---

## Notes

- Quality > Quantity: It's better to return fewer, high-quality suggestions than many junk domains
- Logos are progressive enhancement only - functionality should work without them
- All errors should be user-friendly and actionable
- Server-side validation is required - UI validation can be bypassed

