import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { listProjectsForOwnerSafe, type SafeProject } from '@/lib/data/projectsContract'
import { listProjectsWithCounts } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { toProjectCardModel } from '@/components/projects/mappers'
import { toProjectsListRow } from '@/lib/projects/projectsListModel'
import { ProjectsTableWrapper } from '@/components/projects/ProjectsTableWrapper'
import { ContinuePanel } from '@/components/projects/ContinuePanel'
import { DashboardPageClient } from '@/components/projects/DashboardPageClient'
import { TourLink } from '@/components/guidance/TourLink'
import { OnboardingCardWrapper } from '@/components/onboarding/OnboardingCardWrapper'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSection } from '@/components/layout/Section'
import { EmptyState } from '@/components/layout/EmptyState'
import { PageErrorState } from '@/components/system/PageErrorState'
import { toAppError, SchemaMismatchError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { invariant } from '@/lib/guardrails/invariants'
import { microcopy } from '@/lib/copy/microcopy'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Your strategy projects",
    description: "Your active strategy analyses, including competitors, evidence, and ranked opportunities.",
    path: "/dashboard",
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  });
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  console.log('[dashboard] loading projects for user', user.id)

  // Fetch projects with safe error handling using contract
  // Parallelize both fetches - use counts if available, fallback to basic list
  let projectsWithCounts
  let projects: SafeProject[] = []
  let tableRows: ReturnType<typeof toProjectsListRow>[] = []
  let projectCards: ReturnType<typeof toProjectCardModel>[] = []
  let appError: ReturnType<typeof toAppError> | null = null

  // Fetch both in parallel - counts may fail, basic list is fallback
  const [countsResult, projectsResult] = await Promise.allSettled([
    listProjectsWithCounts(supabase, user.id),
    listProjectsForOwnerSafe(supabase, user.id),
  ])

  // Process counts result (optional - used for table view)
  if (countsResult.status === 'fulfilled') {
    try {
      projectsWithCounts = countsResult.value
      tableRows = projectsWithCounts.map(toProjectsListRow)
    } catch (e) {
      const error = toAppError(e, { projectId: null, userId: user.id })
      logAppError('dashboard.loadProjects', error, { step: 'listProjectsWithCounts' })
      
      // INV-5: Check for schema mismatch (missing column error)
      if (error.code === 'SCHEMA_MISMATCH') {
        invariant(
          false,
          {
            invariantId: 'INV-5',
            route: '/dashboard',
            context: 'project_query',
            details: {
              message: 'Project query references non-existent column',
              query: 'listProjectsWithCounts',
              errorMessage: error.message,
            },
          }
        )
      }
      
      appError = error
    }
  } else {
    // Counts fetch failed - log but continue
    const error = toAppError(countsResult.reason, { projectId: null, userId: user.id })
    logAppError('dashboard.loadProjects', error, { step: 'listProjectsWithCounts' })
    
    if (error.code === 'SCHEMA_MISMATCH') {
      invariant(
        false,
        {
          invariantId: 'INV-5',
          route: '/dashboard',
          context: 'project_query',
          details: {
            message: 'Project query references non-existent column',
            query: 'listProjectsWithCounts',
            errorMessage: error.message,
          },
        }
      )
    }
    
    appError = error
  }

  // Process basic projects result (required - fallback)
  if (projectsResult.status === 'fulfilled') {
    if (projectsResult.value.ok) {
      projects = projectsResult.value.data
      projectCards = projects.map(toProjectCardModel)
    } else {
      // INV-5: Check for schema mismatch (missing column error)
      const isMissingColumn = projectsResult.value.error.isMissingColumn ?? false
      if (isMissingColumn) {
        invariant(
          false,
          {
            invariantId: 'INV-5',
            route: '/dashboard',
            context: 'project_query',
            details: {
              message: 'Project query references non-existent column',
              query: 'listProjectsForOwnerSafe',
              errorMessage: projectsResult.value.error.message,
              errorCode: projectsResult.value.error.code,
            },
          }
        )
      }
      
      // Convert to AppError (toAppError will detect schema mismatch from error message if needed)
      const error = toAppError(
        new Error(projectsResult.value.error.message),
        { projectId: null, userId: user.id, isMissingColumn: projectsResult.value.error.isMissingColumn }
      )
      logAppError('dashboard.loadProjects', error, { step: 'listProjectsForOwnerSafe' })
      if (!appError) {
        appError = error
      }
      // Continue with empty arrays - page will show empty state
    }
  } else {
    // Basic projects fetch failed - log error
    const error = toAppError(projectsResult.reason, { projectId: null, userId: user.id })
    logAppError('dashboard.loadProjects', error, { step: 'listProjectsForOwnerSafe' })
    if (!appError) {
      appError = error
    }
  }

  // If we have errors but no projects, show recoverable error state
  if (appError && projects.length === 0 && tableRows.length === 0) {
    return (
      <DashboardPageClient>
        <PageShell data-testid="projects-page">
          <PageHeader
            title="Projects"
            subtitle="Manage your competitive analyses and identify evidence-bound opportunities."
            primaryAction={
              <Link href="/new">
                <Button size="lg" variant="brand">{microcopy.actions.newAnalysis}</Button>
              </Link>
            }
          />
          <PageSection>
            <PageErrorState error={appError} />
          </PageSection>
        </PageShell>
      </DashboardPageClient>
    )
  }

  // Find most recent project row for "Continue" panel (Next Action card)
  const mostRecentRow = tableRows.length > 0
    ? tableRows.reduce((latest, current) => {
        const latestDate = latest.lastTouchedAt ?? ''
        const currentDate = current.lastTouchedAt ?? ''
        if (!currentDate) return latest
        if (!latestDate) return current
        return new Date(currentDate).getTime() > new Date(latestDate).getTime()
          ? current
          : latest
      })
    : null

  const hasProjects = tableRows.length > 0

  return (
      <DashboardPageClient>
        <PageShell data-testid="projects-page">
          <PageHeader
            title="Projects"
            subtitle="Manage your competitive analyses and identify evidence-bound opportunities."
            primaryAction={
              <Link href="/new">
                <Button size="lg" variant="brand">{microcopy.actions.newAnalysis}</Button>
              </Link>
            }
            secondaryActions={
              hasProjects ? (
                <Link href="/samples" prefetch>
                  <Button variant="ghost" size="lg">
                    {microcopy.actions.tryExample}
                  </Button>
                </Link>
              ) : undefined
            }
          />
        
        <PageSection>
          <TourLink />
        </PageSection>

        {/* Onboarding Card for New Users (only if 0 projects) */}
        {!hasProjects && (
          <PageSection>
            <OnboardingCardWrapper projects={projects} />
          </PageSection>
        )}

        {/* Next Action Card (only if user has projects) */}
        {hasProjects && mostRecentRow && (
          <PageSection>
            <ContinuePanel row={mostRecentRow} />
          </PageSection>
        )}

        {/* Main Content */}
        {!hasProjects ? (
          <EmptyState
            title={microcopy.emptyStates.noProjects.title}
            description={microcopy.emptyStates.noProjects.description}
            action={
              <>
                <Button asChild size="lg" variant="brand" className="w-full sm:w-auto">
                  <Link href="/new?onboarding=1" prefetch>{microcopy.emptyStates.noProjects.cta}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/samples" prefetch>{microcopy.emptyStates.noProjects.ctaSecondary}</Link>
                </Button>
              </>
            }
          />
        ) : (
          <PageSection>
            <ProjectsTableWrapper rows={tableRows} />
          </PageSection>
        )}
      </PageShell>
    </DashboardPageClient>
  )
}

