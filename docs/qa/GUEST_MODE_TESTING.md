# Guest Mode Testing Guide

**Purpose**: Guide for testing the anonymous auth / guest onboarding flow using gated contract tests.

**When to use**: After the anonymous auth implementation PR merges, enable these tests to prevent regressions in guest onboarding behavior.

---

## Quick Start

1. **Enable tests**: `GUEST_AUTH_CONTRACT_TESTS=1 pnpm test`
2. **Run specific suite**: `GUEST_AUTH_CONTRACT_TESTS=1 pnpm test tests/auth`
3. **Verify contracts**: Tests validate that guest auth behavior matches expected contracts

---

## How to Run Gated Tests

### Prerequisites
- Tests are skipped by default (no env vars required)
- Enable with `GUEST_AUTH_CONTRACT_TESTS=1` environment variable
- No Supabase env vars or network calls required (all mocked)

### Steps

1. **Run all gated contract tests**:
   ```bash
   GUEST_AUTH_CONTRACT_TESTS=1 pnpm test
   ```

2. **Run only guest auth contract tests**:
   ```bash
   GUEST_AUTH_CONTRACT_TESTS=1 pnpm test tests/auth
   ```

3. **Run specific test file**:
   ```bash
   GUEST_AUTH_CONTRACT_TESTS=1 pnpm test tests/auth/ensureAnonSession.contract.test.ts
   ```

---

## Manual Testing Checklist (Incognito Flow)

### Anonymous Session Creation
- [ ] Visit `/new` in incognito mode
- [ ] Verify anonymous session is created automatically
- [ ] Check browser dev tools: session cookie should be set
- [ ] Verify no redirect to `/login` occurs

### Onboarding Flow
- [ ] Navigate to `/new` without authentication
- [ ] Complete onboarding steps (`/new/step-1`, `/new/step-2`, etc.)
- [ ] Verify all onboarding routes are accessible without auth
- [ ] Check that protected routes (`/dashboard`, `/projects`) still require auth

### Results Reveal Gate
- [ ] As anonymous user, view results page
- [ ] Verify email capture UI is shown instead of results
- [ ] Submit email via OTP
- [ ] Verify results are revealed after email verification
- [ ] Check that non-anonymous users see results directly

### Session Persistence
- [ ] Create anonymous session
- [ ] Refresh page
- [ ] Verify session persists (no new anonymous user created)
- [ ] Check that `signInAnonymously` is not called on refresh if session exists

---

## Contract Tests

### `ensureAnonSession.contract.test.ts`

**Contracts validated**:
- ✅ If session exists, `signInAnonymously` is NOT called
- ✅ If session is missing, `signInAnonymously` is called exactly once
- ✅ Returns a valid session after calling `signInAnonymously`

**What it tests**:
- Session detection logic
- Anonymous sign-in behavior
- Return value structure

### `revealResultsGate.contract.test.tsx`

**Contracts validated**:
- ✅ Anonymous user → renders email capture UI
- ✅ Non-anonymous user → renders children (results)

**What it tests**:
- Component conditional rendering
- User type detection
- Email capture UI presence

### `onboardingRouteGuard.contract.test.ts`

**Contracts validated**:
- ✅ `/new` route accessible without authentication
- ✅ `/new/step-1` route accessible without authentication
- ✅ Routes starting with `/new` accessible without authentication

**What it tests**:
- Middleware route guard logic
- Public route handling
- No redirect to `/login` for onboarding routes

---

## Expected Behaviors

### Anonymous User Flow
1. User visits `/new` → Anonymous session created automatically
2. User navigates onboarding → All steps accessible
3. User views results → Email capture UI shown
4. User submits email → OTP sent, results revealed after verification

### Authenticated User Flow
1. User visits `/new` → Onboarding accessible (if not completed)
2. User views results → Results shown directly (no email capture)

### Session Management
- **First visit**: `signInAnonymously` called once
- **Subsequent visits**: Session exists, `signInAnonymously` NOT called
- **Session refresh**: Middleware refreshes session, no new anonymous user

---

## Troubleshooting

### Tests Fail: "Module not found"
- **Issue**: Tests fail with "ensureAnonSession module not found"
- **Solution**: Merge the anonymous auth implementation PR first. Tests are designed to fail with helpful errors when implementation is missing.

### Tests Skipped
- **Issue**: Tests show as skipped even with env var set
- **Solution**: 
  - Verify `GUEST_AUTH_CONTRACT_TESTS=1` is set correctly
  - Check that gate helper is imported correctly
  - Ensure tests use `describeIf` pattern

### Mock Errors
- **Issue**: Supabase mocks not working
- **Solution**:
  - Verify `vi.mock` is called before imports
  - Check that mock structure matches Supabase client API
  - Ensure `vi.clearAllMocks()` in `beforeEach`

### Route Guard Tests Fail
- **Issue**: Middleware tests fail with redirect errors
- **Solution**:
  - Verify environment variables are set in test
  - Check that `updateSession` is properly mocked
  - Ensure request mock structure matches NextRequest

---

## CI Integration

### After Implementation PR Merges

1. **Enable in CI**: Add `GUEST_AUTH_CONTRACT_TESTS=1` to CI environment
2. **Run in test suite**: Include in pre-merge checks
3. **Monitor**: Watch for contract violations

### Example CI Config

```yaml
# .github/workflows/test.yml
env:
  GUEST_AUTH_CONTRACT_TESTS: 1

steps:
  - run: pnpm test
```

---

## Notes

- **No network calls**: All tests use mocked Supabase clients
- **Deterministic**: Tests don't depend on external state
- **Future-proof**: Tests handle missing implementation gracefully
- **Gated**: Tests are skipped by default, only run when explicitly enabled
- **Contract-focused**: Tests validate behavior contracts, not implementation details

---

## Related Files

- `/lib/test/gates.ts` - Test gate helper
- `/tests/auth/ensureAnonSession.contract.test.ts` - Anonymous session contract tests
- `/tests/auth/revealResultsGate.contract.test.tsx` - Results reveal gate contract tests
- `/tests/auth/onboardingRouteGuard.contract.test.ts` - Onboarding route guard contract tests
- `/lib/supabase/middleware.ts` - Middleware route guard implementation
- `/lib/auth/ensureAnonSession.ts` - Anonymous session helper (when implemented)
- `/components/auth/revealResultsGate.tsx` - Results reveal gate component (when implemented)

