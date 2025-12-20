# Testing

This directory contains the test suite for Plinth.

## Structure

- `unit/` - Unit tests for pure functions (schemas, parsers, utilities)
- `integration/` - Integration tests for server actions and data layer
- `e2e/` - End-to-end tests using Playwright
- `mocks/` - Shared mock implementations (Supabase, MSW handlers)
- `setup.ts` - Test setup and global mocks

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run e2e

# E2E tests with UI
npm run e2e:ui
```

## Environment Variables

For E2E tests, set:
- `E2E_TEST_MODE=true` - Enables E2E test helper routes
- `PLAYWRIGHT_BASE_URL` - Base URL for tests (defaults to http://localhost:3000)

For debugging, set:
- `DEBUG_AUTH=true` - Enable auth-related debug logging
- `DEBUG_LLM=true` - Enable LLM-related debug logging
- `DEBUG_ALL=true` - Enable all debug logging

## Test Patterns

### Unit Tests
Test pure functions in isolation:
```typescript
import { describe, it, expect } from 'vitest'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'

describe('safeParseLLMJson', () => {
  it('extracts JSON from code fences', () => {
    // ...
  })
})
```

### Integration Tests
Test server actions and data layer with mocked Supabase:
```typescript
import { MockSupabaseStore, createMockSupabaseClient } from '../mocks/supabase'

describe('Data Layer', () => {
  let store: MockSupabaseStore
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    store = new MockSupabaseStore()
    client = createMockSupabaseClient(store, 'user-123')
  })
  
  it('creates a project', async () => {
    // ...
  })
})
```

### E2E Tests
Test full user flows with Playwright:
```typescript
import { test, expect } from '@playwright/test'

test('create project flow', async ({ page }) => {
  await page.goto('/dashboard')
  // ...
})
```

## Mocking

### Supabase
Use `MockSupabaseStore` and `createMockSupabaseClient` to create test doubles for Supabase:

```typescript
const store = new MockSupabaseStore()
store.setUser('user-123', 'test@example.com')
const client = createMockSupabaseClient(store, 'user-123')
```

## Coverage

Current coverage targets:
- Unit tests: High coverage for schemas, parsers, and utilities
- Integration tests: Critical paths (auth, data layer, analysis generation)
- E2E tests: Key user flows

Run `npm run test:coverage` to generate coverage reports.

