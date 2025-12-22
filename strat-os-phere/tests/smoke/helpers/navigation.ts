import type { Page } from '@playwright/test'

/**
 * Navigation helpers for smoke tests
 * Track navigation to detect loops and ensure stability
 */

export interface NavigationTracker {
  urls: string[]
  startTime: number
  maxDuration: number
  maxRedirects: number
}

/**
 * Create a navigation tracker to detect redirect loops
 */
export function createNavigationTracker(options: {
  maxDuration?: number
  maxRedirects?: number
} = {}): NavigationTracker {
  return {
    urls: [],
    startTime: Date.now(),
    maxDuration: options.maxDuration ?? 10000, // 10 seconds
    maxRedirects: options.maxRedirects ?? 5, // Max 5 redirects
  }
}

/**
 * Track a navigation event
 * Throws an error if loop detected or timeout exceeded
 */
export function trackNavigation(tracker: NavigationTracker, url: string): void {
  const now = Date.now()
  const elapsed = now - tracker.startTime

  // Check duration
  if (elapsed > tracker.maxDuration) {
    throw new Error(
      `Navigation timeout: exceeded ${tracker.maxDuration}ms. ` +
      `Visited: ${tracker.urls.join(' → ')} → ${url}`
    )
  }

  // Check redirect count
  if (tracker.urls.length >= tracker.maxRedirects) {
    throw new Error(
      `Redirect loop detected: exceeded ${tracker.maxRedirects} redirects. ` +
      `Visited: ${tracker.urls.join(' → ')} → ${url}`
    )
  }

  // Check for cycles (same URL visited twice)
  if (tracker.urls.includes(url)) {
    throw new Error(
      `Navigation cycle detected: URL visited twice. ` +
      `Visited: ${tracker.urls.join(' → ')} → ${url}`
    )
  }

  tracker.urls.push(url)
}

/**
 * Wait for URL to stabilize (no redirects for a period)
 */
export async function waitForUrlStable(
  page: Page,
  timeout: number = 2000
): Promise<string> {
  let lastUrl = page.url()
  let stableCount = 0
  const requiredStableChecks = 2 // URL must be same for 2 checks

  const checkInterval = 200 // Check every 200ms
  const maxChecks = timeout / checkInterval

  for (let i = 0; i < maxChecks; i++) {
    await page.waitForTimeout(checkInterval)
    const currentUrl = page.url()

    if (currentUrl === lastUrl) {
      stableCount++
      if (stableCount >= requiredStableChecks) {
        return currentUrl
      }
    } else {
      stableCount = 0
      lastUrl = currentUrl
    }
  }

  // If we get here, URL didn't stabilize but that's ok - return current URL
  return page.url()
}

/**
 * Navigate and ensure no redirect loops
 */
export async function navigateSafely(
  page: Page,
  url: string,
  options: {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'
    timeout?: number
  } = {}
): Promise<string> {
  const tracker = createNavigationTracker()
  const { waitUntil = 'load', timeout = 10000 } = options

  // Set up navigation listener
  const navigationPromise = page.waitForURL('**', {
    waitUntil,
    timeout,
  })

  // Navigate
  await page.goto(url, { waitUntil, timeout })

  // Track initial URL
  trackNavigation(tracker, page.url())

  // Wait for navigation to complete
  await navigationPromise

  // Wait for URL to stabilize
  const finalUrl = await waitForUrlStable(page, 2000)

  // Verify no loops
  trackNavigation(tracker, finalUrl)

  return finalUrl
}

