# How to Run Health Checks

This guide explains how to run the smoke tests and health checks for StratOSphere.

## Quick Start

```bash
# Run all smoke tests
npm run health

# Or explicitly
npm run test:smoke
```

## Prerequisites

1. **Development server running**: The tests require the Next.js dev server to be running on `http://localhost:3000` (or set `PLAYWRIGHT_BASE_URL` env var).

2. **Authentication**: You have two options:

   ### Option A: Storage State (Recommended)
   
   Create a storage state file with an authenticated session:
   
   1. Log in to the app manually in a browser
   2. Open browser DevTools → Application → Cookies
   3. Copy the session cookies
   4. Create `tests/.auth/storageState.json`:
   ```json
   {
     "cookies": [
       {
         "name": "sb-...-auth-token",
         "value": "...",
         "domain": "localhost",
         "path": "/",
         "expires": -1,
         "httpOnly": true,
         "secure": false,
         "sameSite": "Lax"
       }
     ]
   }
   ```
   
   The tests will automatically use this if it exists.

   ### Option B: Environment Variables
   
   Set these environment variables:
   ```bash
   export TEST_USER_EMAIL=your-test-email@example.com
   export TEST_USER_PASSWORD=your-password
   ```
   
   Note: This requires the login flow to support automated login. Currently, the app uses magic link authentication, so storage state (Option A) is recommended.

## Running Tests

### All Smoke Tests

```bash
npm run health
```

This runs all smoke tests in `tests/smoke/` and prints a clear PASS/FAIL report.

### Individual Test Files

```bash
# Run specific test file
npx playwright test tests/smoke/appHealth.spec.ts

# Run with UI mode (interactive)
npx playwright test tests/smoke/appHealth.spec.ts --ui
```

### Debug Mode

```bash
# Run in headed mode (see browser)
npx playwright test tests/smoke/appHealth.spec.ts --headed

# Run with debugger
npx playwright test tests/smoke/appHealth.spec.ts --debug
```

## Test Coverage

The smoke tests cover these core journeys:

1. **Journey A**: Login → Projects
   - Verifies dashboard loads
   - Checks for project cards or empty state
   - Tests "New analysis" button navigation

2. **Journey B**: New Analysis → Create project
   - Fills minimum required fields
   - Submits form
   - Verifies redirect to project overview

3. **Journey C**: From a Project → Results
   - Opens existing project
   - Navigates to Results page
   - Detects infinite redirects/loops
   - Verifies URL stability

4. **Journey D**: Results → Opportunities
   - Clicks "Opportunities" in left nav
   - Verifies Opportunities section renders
   - Ensures only one primary variant is visible

5. **Journey E**: "View strategic plans" CTA
   - Clicks strategic bets CTA
   - Verifies navigation to correct section
   - Checks expected heading renders

6. **Journey F**: Left nav persistence
   - Verifies left nav is present on project subroutes
   - Tests navigation between sections
   - Checks nav persists after page refresh
   - Verifies active item matches current pathname

## Troubleshooting

### Tests fail with "Authentication required"

- Ensure you've created `tests/.auth/storageState.json` (Option A), or
- Set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` env vars (Option B)

### Tests fail with "Navigation timeout"

- Check that the dev server is running on `http://localhost:3000`
- Verify the app is accessible in a browser
- Check for console errors in the app

### Tests fail with "Redirect loop detected"

- This is a real issue! The test is catching a navigation bug.
- Check the test output for the URL sequence
- Review the routing logic in the affected page

### Tests are flaky

- Some tests may be flaky if the app is slow to load
- Increase timeouts in test helpers if needed
- Check for race conditions in the app code

## CI/CD Integration

For CI environments:

1. Set up authentication (storage state or env vars)
2. Ensure dev server starts before tests
3. Run: `npm run health`

Example GitHub Actions:

```yaml
- name: Run health checks
  run: |
    npm run dev &
    sleep 10  # Wait for server to start
    npm run health
```

## Additional Checks

### Find Dead Links

```bash
npm run lint:deadlinks
```

Scans the codebase for:
- `href="#"` (empty hash links)
- `href=""` (empty hrefs)
- `router.push("")` (empty router pushes)
- Hash links that may be placeholders

### Unit Tests

```bash
npm test
```

Runs unit tests including routing normalization tests.

## Test Output

On success:
```
✓ Journey A: Login → Projects (2.3s)
✓ Journey B: New Analysis → Create project (1.8s)
✓ Journey C: From a Project → Results (3.1s)
...
```

On failure:
- Screenshot saved to `test-results/`
- Console logs captured
- Network failures logged
- Trace file available for debugging

