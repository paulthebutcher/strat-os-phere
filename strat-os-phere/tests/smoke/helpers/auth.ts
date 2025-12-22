import { test as base, type Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

/**
 * Auth helper for smoke tests
 * Supports both automated login and storage state
 */

const STORAGE_STATE_PATH = path.join(__dirname, '../../.auth/storageState.json')

export interface AuthOptions {
  /**
   * If true, use storage state for authentication
   * If false, attempt automated login (requires env vars)
   */
  useStorageState?: boolean
}

/**
 * Authenticate using storage state if available
 * Otherwise, attempt automated login
 */
export async function authenticate(page: Page, options: AuthOptions = {}): Promise<void> {
  const { useStorageState = true } = options

  // Try storage state first
  if (useStorageState && fs.existsSync(STORAGE_STATE_PATH)) {
    const storageState = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'))
    await page.context().addCookies(storageState.cookies || [])
    return
  }

  // Fallback: automated login (requires env vars)
  const testEmail = process.env.TEST_USER_EMAIL
  const testPassword = process.env.TEST_USER_PASSWORD

  if (!testEmail || !testPassword) {
    throw new Error(
      'Authentication required. Either:\n' +
      '1. Set TEST_USER_EMAIL and TEST_USER_PASSWORD env vars, or\n' +
      '2. Create storage state: run tests once with authenticated session and save storageState.json to tests/.auth/'
    )
  }

  // Navigate to login
  await page.goto('/login')

  // Fill login form
  await page.getByPlaceholder(/email/i).fill(testEmail)
  await page.getByRole('button', { name: /sign in|log in/i }).click()

  // Wait for redirect (magic link flow)
  // Note: This is a simplified version - actual implementation may need adjustment
  await page.waitForURL(/dashboard|auth\/callback/, { timeout: 10000 })
}

/**
 * Save current session as storage state
 */
export async function saveStorageState(page: Page): Promise<void> {
  const storageDir = path.dirname(STORAGE_STATE_PATH)
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }

  const cookies = await page.context().cookies()
  const storageState = { cookies }
  fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2))
}

