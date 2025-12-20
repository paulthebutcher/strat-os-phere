import { test, expect } from '@playwright/test'

/**
 * Basic E2E tests for Plinth
 * 
 * Note: These tests require E2E_TEST_MODE=true and may need auth setup.
 * For now, these are placeholders that demonstrate the test structure.
 */

test.describe('Basic App Functionality', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Plinth/i)
  })

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  // TODO: Add more E2E tests once auth helper is properly configured
  // test('create project flow', async ({ page }) => {
  //   // Set up auth session via E2E helper
  //   await page.request.post('/api/e2e/login', {
  //     data: { userId: 'test-user-123' },
  //   })
  //
  //   await page.goto('/dashboard')
  //   // ... continue with project creation flow
  // })
})

