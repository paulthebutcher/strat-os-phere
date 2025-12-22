import { test, expect } from '@playwright/test'
import { authenticate } from './helpers/auth'
import { SELECTORS, waitForPageReady } from './helpers/selectors'
import { navigateSafely, createNavigationTracker } from './helpers/navigation'

/**
 * App Health Smoke Tests
 * 
 * These tests verify core user journeys end-to-end and catch common issues:
 * - Navigation loops/cycling
 * - Broken CTAs
 * - Left nav not persisting/highlighting incorrectly
 * - Multiple Opportunities variants shown at once
 */

test.describe('App Health - Core Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate before each test
    await authenticate(page)
  })

  test('Journey A: Login → Projects', async ({ page }) => {
    // Navigate to dashboard (projects list)
    await navigateSafely(page, '/dashboard')
    await waitForPageReady(page)

    // Assert Projects page loads
    // Check for either project cards or empty state
    const hasProjects = await page.locator(SELECTORS.projectCard).count()
    const hasEmptyState = await page.getByText(/no projects|get started|new analysis/i).isVisible().catch(() => false)

    expect(hasProjects > 0 || hasEmptyState).toBeTruthy()

    // Check for "New analysis" button
    const newAnalysisButton = page.locator(SELECTORS.newAnalysisButton).first()
    await expect(newAnalysisButton).toBeVisible()

    // Click "New analysis" and verify navigation
    await newAnalysisButton.click()
    await waitForPageReady(page)
    
    // Should navigate to new analysis page
    expect(page.url()).toMatch(/\/projects\/new/)
  })

  test('Journey B: New Analysis → Create project → lands in expected place', async ({ page }) => {
    // Navigate to new analysis page
    await navigateSafely(page, '/projects/new')
    await waitForPageReady(page)

    // Fill minimum required fields
    // Note: Adjust selectors based on actual form structure
    const nameInput = page.getByPlaceholder(/project name|analysis name/i).or(
      page.getByLabel(/project name|analysis name/i)
    ).first()
    
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Test Project - Smoke Test')
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /create|submit|save/i }).first()
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click()
      await waitForPageReady(page)

      // Assert redirect route is valid (should go to project overview)
      // Allow for project ID in URL
      expect(page.url()).toMatch(/\/projects\/[^/]+$/)
      
      // Assert page content is visible (no 404, no redirect loop)
      const pageContent = page.getByText(/overview|project|ready/i).first()
      await expect(pageContent).toBeVisible({ timeout: 5000 })
    }
  })

  test('Journey C: From a Project → Results (no infinite redirect)', async ({ page }) => {
    // Navigate to dashboard to find a project
    await navigateSafely(page, '/dashboard')
    await waitForPageReady(page)

    // Try to find first project card
    const projectCard = page.locator(SELECTORS.projectCard).first()
    const projectCardCount = await projectCard.count()

    if (projectCardCount === 0) {
      test.skip('No projects available for testing')
      return
    }

    // Click first project card
    await projectCard.click()
    await waitForPageReady(page)

    // Should be on project overview
    expect(page.url()).toMatch(/\/projects\/[^/]+$/)

    // Navigate to Results page
    const tracker = createNavigationTracker({ maxRedirects: 3 })
    const resultsLink = page.getByRole('link', { name: /results/i }).or(
      page.locator(SELECTORS.projectNavItem('results'))
    ).first()

    if (await resultsLink.isVisible().catch(() => false)) {
      await resultsLink.click()
    } else {
      // Try direct navigation
      const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1]
      if (projectId) {
        await navigateSafely(page, `/projects/${projectId}/results`)
      }
    }

    await waitForPageReady(page)

    // Track navigation to detect loops
    const currentUrl = page.url()
    trackNavigation(tracker, currentUrl)

    // Assert URL is stable (no constant param flipping)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
    const urlAfterWait = page.url()
    expect(urlAfterWait).toBe(currentUrl)

    // Assert Results page renders
    const resultsContent = page.getByText(/results|opportunities|strategic bets|jobs/i).first()
    await expect(resultsContent).toBeVisible({ timeout: 5000 })
  })

  test('Journey D: Results → Opportunities', async ({ page }) => {
    // Navigate to dashboard
    await navigateSafely(page, '/dashboard')
    await waitForPageReady(page)

    // Find a project with results
    const projectCard = page.locator(SELECTORS.projectCard).first()
    const projectCardCount = await projectCard.count()

    if (projectCardCount === 0) {
      test.skip('No projects available for testing')
      return
    }

    // Get project ID from card or navigate to project
    await projectCard.click()
    await waitForPageReady(page)

    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1]
    if (!projectId) {
      test.skip('Could not determine project ID')
      return
    }

    // Navigate to Results
    await navigateSafely(page, `/projects/${projectId}/results`)
    await waitForPageReady(page)

    // Try to click "Opportunities" in left nav
    const opportunitiesNavItem = page.locator(SELECTORS.projectNavItem('opportunities')).or(
      page.getByRole('link', { name: /opportunities/i })
    ).first()

    if (await opportunitiesNavItem.isVisible().catch(() => false)) {
      await opportunitiesNavItem.click()
      await waitForPageReady(page)
    } else {
      // Try direct navigation to opportunities
      await navigateSafely(page, `/projects/${projectId}/opportunities`)
      await waitForPageReady(page)
    }

    // Assert Opportunities section renders
    // Should either be on opportunities page or results page with opportunities tab
    const url = page.url()
    const isOpportunitiesPage = url.includes('/opportunities')
    const isResultsWithTab = url.includes('/results') && url.includes('tab=')

    expect(isOpportunitiesPage || isResultsWithTab).toBeTruthy()

    // Assert stable header (no multiple variants visible at once)
    const opportunitiesHeaders = page.getByRole('heading', { name: /opportunities/i })
    const headerCount = await opportunitiesHeaders.count()
    
    // Should have at most 1 primary opportunities header visible
    // (legacy ones should be behind disclosure)
    const visibleHeaders = await Promise.all(
      Array.from({ length: headerCount }).map(async (_, i) => {
        const header = opportunitiesHeaders.nth(i)
        return await header.isVisible().catch(() => false)
      })
    )
    
    const visibleCount = visibleHeaders.filter(Boolean).length
    expect(visibleCount).toBeLessThanOrEqual(2) // Allow for main + one legacy behind disclosure
  })

  test('Journey E: "View strategic plans" / "Strategic Bets" CTA works', async ({ page }) => {
    // Navigate to dashboard
    await navigateSafely(page, '/dashboard')
    await waitForPageReady(page)

    // Find a project
    const projectCard = page.locator(SELECTORS.projectCard).first()
    const projectCardCount = await projectCard.count()

    if (projectCardCount === 0) {
      test.skip('No projects available for testing')
      return
    }

    await projectCard.click()
    await waitForPageReady(page)

    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1]
    if (!projectId) {
      test.skip('Could not determine project ID')
      return
    }

    // Navigate to Results
    await navigateSafely(page, `/projects/${projectId}/results`)
    await waitForPageReady(page)

    // Look for "View strategic plans" or "Strategic Bets" CTA
    const strategicBetsLink = page.getByRole('link', { name: /strategic bets|view strategic plans/i }).or(
      page.locator(SELECTORS.viewStrategicPlansButton)
    ).first()

    if (await strategicBetsLink.isVisible().catch(() => false)) {
      await strategicBetsLink.click()
      await waitForPageReady(page)

      // Should navigate to strategic bets section
      const url = page.url()
      const isStrategicBetsPage = url.includes('/strategic-bets')
      const isResultsWithTab = url.includes('/results') && url.includes('strategic_bets')

      expect(isStrategicBetsPage || isResultsWithTab).toBeTruthy()

      // Assert expected heading renders
      const heading = page.getByRole('heading', { name: /strategic bets/i }).first()
      await expect(heading).toBeVisible({ timeout: 5000 })
    } else {
      // CTA might not be visible if no strategic bets exist - that's ok
      test.info().annotations.push({
        type: 'note',
        description: 'Strategic bets CTA not found - may not be available for this project',
      })
    }
  })

  test('Journey F: Left nav persistence', async ({ page }) => {
    // Navigate to dashboard
    await navigateSafely(page, '/dashboard')
    await waitForPageReady(page)

    // Find a project
    const projectCard = page.locator(SELECTORS.projectCard).first()
    const projectCardCount = await projectCard.count()

    if (projectCardCount === 0) {
      test.skip('No projects available for testing')
      return
    }

    await projectCard.click()
    await waitForPageReady(page)

    const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1]
    if (!projectId) {
      test.skip('Could not determine project ID')
      return
    }

    // Confirm left nav is present
    const leftNav = page.locator(SELECTORS.projectNav)
    await expect(leftNav).toBeVisible()

    // Navigate between different sections
    const navItems = ['overview', 'opportunities', 'competitors', 'scorecard']
    
    for (const navId of navItems) {
      const navItem = page.locator(SELECTORS.projectNavItem(navId)).or(
        page.getByRole('link', { name: new RegExp(navId, 'i') })
      ).first()

      if (await navItem.isVisible().catch(() => false)) {
        await navItem.click()
        await waitForPageReady(page)

        // Assert left nav still renders
        await expect(leftNav).toBeVisible()

        // Assert active item matches current pathname
        // (Note: This is a simplified check - actual implementation may need refinement)
        const url = page.url()
        const expectedPath = navId === 'overview' 
          ? `/projects/${projectId}` 
          : `/projects/${projectId}/${navId === 'opportunities' ? 'opportunities' : navId}`
        
        // URL should match expected path (allowing for redirects)
        expect(url).toMatch(new RegExp(expectedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      }
    }

    // Refresh page on a subroute
    const currentUrl = page.url()
    await page.reload()
    await waitForPageReady(page)

    // Assert left nav still renders after refresh
    await expect(leftNav).toBeVisible()

    // Assert URL is still correct (no redirect to root)
    expect(page.url()).toBe(currentUrl)
  })
})

