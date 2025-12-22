/**
 * Centralized selectors for smoke tests
 * Prefer data-testid, getByRole, and getByText over fragile CSS selectors
 */

export const SELECTORS = {
  // Pages
  projectsPage: '[data-testid="projects-page"]',
  projectCard: '[data-testid="project-card"]',
  resultsPage: '[data-testid="results-page"]',
  opportunitiesView: '[data-testid="opportunities-view"]',

  // Navigation
  projectNav: '[data-testid="project-nav"]',
  projectNavItem: (id: string) => `[data-testid="project-nav-item-${id}"]`,
  
  // Buttons and CTAs
  newAnalysisButton: 'button:has-text("New analysis"), a:has-text("New analysis")',
  viewStrategicPlansButton: 'button:has-text("View strategic plans"), a:has-text("View strategic plans")',
  generateAnalysisButton: 'button:has-text("Generate Analysis")',
  
  // Results page
  resultsMemo: '[data-testid="results-memo"]',
  resultsTabs: '[data-testid="results-tabs"]',
  opportunitiesTab: 'button:has-text("Opportunities"), a:has-text("Opportunities")',
  
  // Common
  loadingSpinner: '[data-testid="loading"], [aria-busy="true"]',
} as const

/**
 * Helper to wait for page to be ready (no loading states, content visible)
 */
export async function waitForPageReady(page: any): Promise<void> {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    // Ignore timeout - page may still be loading but that's ok
  })
  
  // Wait for any loading spinners to disappear
  const spinner = page.locator(SELECTORS.loadingSpinner).first()
  if (await spinner.isVisible().catch(() => false)) {
    await spinner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  }
}

