# Testing

**Purpose**: Testing strategies, conventions, and setup for Plinth (Vitest, Playwright).

**When to read this**: Read this to understand how to write tests, test patterns, and testing best practices.

**Last updated**: 2025-01-27

---

## Test Pyramid

```
        /\
       /  \  E2E Tests (Playwright)
      /____\  - Key user flows
     /      \  - Full browser automation
    /________\  
   /          \ Integration Tests (Vitest)
  /____________\  - Server actions
 /              \  - Data layer
/________________\ Unit Tests (Vitest)
                  - Pure functions
                  - Schemas/parsers
                  - Utilities
```

**Target Coverage**:
- Unit: High coverage for schemas, parsers, utilities
- Integration: Critical paths (auth, data layer, analysis generation)
- E2E: Key user flows (login, create project, generate analysis)

## Commands

```bash
# Run all unit/integration tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (requires dev server)
npm run e2e

# E2E tests with UI
npm run e2e:ui
```

## Unit Tests

**Location**: `tests/unit/`

**What to test**:
- Pure functions (no side effects)
- Schema validation (Zod parsers)
- JSON extraction/parsing
- Utility functions

**Example** (`tests/unit/safeParseLLMJson.test.ts`):
```typescript
import { describe, it, expect } from 'vitest'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'
import { z } from 'zod'

const TestSchema = z.object({
  name: z.string(),
  age: z.number(),
})

describe('safeParseLLMJson', () => {
  it('extracts JSON from code fences', () => {
    const text = '```json\n{"name": "John", "age": 30}\n```'
    const result = safeParseLLMJson(text, TestSchema)
    
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ name: 'John', age: 30 })
    }
  })
})
```

**Conventions**:
- Use `describe` blocks to group related tests
- Use descriptive test names (`it('should do X when Y')`)
- Test edge cases (empty strings, null, invalid JSON)
- Test error cases (validation failures)

## Integration Tests

**Location**: `tests/integration/`

**What to test**:
- Server actions
- Data layer operations
- Auth flows
- Analysis generation (with mocked LLM)

**Example** (`tests/integration/data-layer.test.ts`):
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseStore, createMockSupabaseClient } from '../mocks/supabase'
import { createProject } from '@/lib/data/projects'

describe('Data Layer', () => {
  let store: MockSupabaseStore
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    store = new MockSupabaseStore()
    store.setUser('user-123', 'test@example.com')
    client = createMockSupabaseClient(store, 'user-123')
  })

  it('creates a project', async () => {
    const project = await createProject(client, {
      user_id: 'user-123',
      name: 'Test Project',
      market: 'SaaS',
      target_customer: 'Developers',
    })

    expect(project.id).toBeDefined()
    expect(project.name).toBe('Test Project')
  })
})
```

**Conventions**:
- Use `MockSupabaseStore` for in-memory database simulation
- Set up test data in `beforeEach`
- Test both success and error cases
- Verify data state after operations

## E2E Tests

**Location**: `tests/e2e/`

**What to test**:
- Full user flows (login → create project → generate analysis)
- UI interactions
- Route protection
- Form submissions

**Example** (`tests/e2e/basic.spec.ts`):
```typescript
import { test, expect } from '@playwright/test'

test.describe('Basic App Functionality', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Plinth/i)
  })

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })
})
```

**E2E Auth Strategy**:

Currently, E2E tests use placeholder structure. Future implementation options:

1. **E2E test helper route** (`/api/e2e/login`):
   ```typescript
   // Set up auth session via helper
   await page.request.post('/api/e2e/login', {
     data: { userId: 'test-user-123' },
   })
   ```

2. **Magic link flow** (real auth):
   - Use test email account
   - Intercept email or use Supabase test mode
   - Complete magic link flow

3. **Bypass auth** (dev-only):
   - Set `E2E_TEST_MODE=true`
   - Middleware bypasses auth checks

**Conventions**:
- Use Playwright's `page` object for interactions
- Use `expect` for assertions
- Group related tests in `test.describe` blocks
- Clean up test data after tests

## Mocking

### Supabase Mocks

**File**: `tests/mocks/supabase.ts`

**Usage**:
```typescript
import { MockSupabaseStore, createMockSupabaseClient } from '../mocks/supabase'

const store = new MockSupabaseStore()
store.setUser('user-123', 'test@example.com')
const client = createMockSupabaseClient(store, 'user-123')

// Use client in tests
const project = await createProject(client, { ... })
```

**Features**:
- In-memory data store (projects, competitors, artifacts)
- User management
- Type-safe client (matches real Supabase client interface)

### LLM Mocks

**Strategy**: Mock `callLLM` function using Vitest mocks:

```typescript
import { vi } from 'vitest'
import { callLLM } from '@/lib/llm/callLLM'

vi.mock('@/lib/llm/callLLM', () => ({
  callLLM: vi.fn(),
}))

// In test
const mockCallLLM = vi.mocked(callLLM)
mockCallLLM.mockResolvedValue({
  text: JSON.stringify({ competitor_name: 'Test', ... }),
  provider: 'openai',
  model: 'gpt-4',
  usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
})
```

**MSW (Mock Service Worker)**:

For HTTP-level mocking (if needed):
- Install: `npm install -D msw`
- Create handlers in `tests/mocks/handlers.ts`
- Set up in `tests/setup.ts`

## Test Setup

**File**: `tests/setup.ts`

**What it does**:
- Configures test environment
- Sets up global mocks
- Configures MSW (if used)
- Sets up test utilities

**Vitest Config** (`vitest.config.ts`):
- Environment: `jsdom` (for React components)
- Setup file: `tests/setup.ts`
- Coverage: v8 provider
- Aliases: `@` → project root

**Playwright Config** (`playwright.config.ts`):
- Base URL: `http://localhost:3000` (or `PLAYWRIGHT_BASE_URL`)
- Auto-starts dev server (unless `CI=true`)
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, parallel locally

## Writing New Tests

### Unit Test Example

**File**: `tests/unit/newFunction.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { newFunction } from '@/lib/utils'

describe('newFunction', () => {
  it('handles valid input', () => {
    const result = newFunction('valid')
    expect(result).toBe('expected')
  })

  it('handles invalid input', () => {
    expect(() => newFunction('invalid')).toThrow()
  })
})
```

### Integration Test Example

**File**: `tests/integration/newAction.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseStore, createMockSupabaseClient } from '../mocks/supabase'
import { newAction } from '@/app/path/actions'

describe('newAction', () => {
  let store: MockSupabaseStore
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    store = new MockSupabaseStore()
    store.setUser('user-123', 'test@example.com')
    client = createMockSupabaseClient(store, 'user-123')
  })

  it('succeeds with valid input', async () => {
    const result = await newAction('input')
    expect(result.success).toBe(true)
  })
})
```

### E2E Test Example

**File**: `tests/e2e/newFlow.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('New Flow', () => {
  test('completes flow successfully', async ({ page }) => {
    await page.goto('/path')
    await page.fill('[name="input"]', 'value')
    await page.click('button[type="submit"]')
    await expect(page.locator('.success')).toBeVisible()
  })
})
```

## CI Notes

### Deterministic Testing

**Rules**:
- No flaky tests (use `waitFor` instead of `sleep`)
- Mock external services (Supabase, OpenAI)
- Use fixed test data (no random values)
- Clean up test data after tests

### Test Execution

**CI Pipeline** (typical):
1. Install dependencies
2. Run linting
3. Run unit/integration tests
4. Run E2E tests (if configured)
5. Generate coverage report

**Environment Variables** (CI):
- `CI=true` - Enables CI-specific behavior
- `PLAYWRIGHT_BASE_URL` - E2E test base URL
- Test credentials (Supabase, OpenAI) - Use test accounts

### Coverage Goals

**Current Targets**:
- Unit tests: >80% coverage for schemas, parsers, utilities
- Integration tests: Critical paths covered
- E2E tests: Key user flows covered

**Generate Report**:
```bash
npm run test:coverage
# Opens coverage/html/index.html
```

## Debugging Tests

### Unit/Integration

**Vitest UI**:
```bash
npm run test:watch
# Opens interactive UI
```

**Debug in VS Code**:
- Set breakpoints
- Run "Debug Test" from test file
- Step through code

### E2E

**Playwright UI Mode**:
```bash
npm run e2e:ui
# Opens Playwright UI with test runner
```

**Debug Mode**:
```bash
npx playwright test --debug
# Opens browser with DevTools
```

**Trace Viewer**:
```bash
npx playwright show-trace trace.zip
# View test execution trace
```

## Common Issues

### Tests Flaking

**Cause**: Timing issues, async operations

**Fix**:
- Use `waitFor` instead of `sleep`
- Use `expect` with `toBeVisible()` instead of checking immediately
- Increase timeouts if needed

### Mock Not Working

**Cause**: Mock not set up correctly

**Fix**:
- Verify `vi.mock()` is called before imports
- Check mock implementation matches real function signature
- Use `vi.mocked()` for type safety

### E2E Tests Failing Locally

**Cause**: Dev server not running or wrong URL

**Fix**:
- Ensure dev server is running (`npm run dev`)
- Check `PLAYWRIGHT_BASE_URL` matches dev server URL
- Verify no port conflicts

