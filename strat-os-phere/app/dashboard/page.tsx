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
import { Section } from '@/components/layout/Section'
import { EmptyState } from '@/components/layout/EmptyState'
import { PageErrorState } from '@/components/system/PageErrorState'
import { toAppError, SchemaMismatchError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { invariant } from '@/lib/guardrails/invariants'
import { microcopy } from '@/lib/copy/microcopy'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Dashboard — Plinth",
    description: "Your Plinth workspace. Manage your competitive analysis projects.",
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
  let projectsWithCounts
  let projects: SafeProject[] = []
  let tableRows: ReturnType<typeof toProjectsListRow>[] = []
  let projectCards: ReturnType<typeof toProjectCardModel>[] = []
  let appError: ReturnType<typeof toAppError> | null = null

  // Fetch projects with counts for table view (may fail, but we'll degrade gracefully)
  try {
    projectsWithCounts = await listProjectsWithCounts(supabase, user.id)
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
    // Continue - we'll try to load basic projects
  }

  // Fetch basic projects using safe contract
  const projectsResult = await listProjectsForOwnerSafe(supabase, user.id)
  if (projectsResult.ok) {
    projects = projectsResult.data
    projectCards = projects.map(toProjectCardModel)
  } else {
    // INV-5: Check for schema mismatch (missing column error)
    const isMissingColumn = projectsResult.error.isMissingColumn ?? false
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
            errorMessage: projectsResult.error.message,
            errorCode: projectsResult.error.code,
          },
        }
      )
    }
    
    // Convert to AppError (toAppError will detect schema mismatch from error message if needed)
    const error = toAppError(
      new Error(projectsResult.error.message),
      { projectId: null, userId: user.id, isMissingColumn: projectsResult.error.isMissingColumn }
    )
    logAppError('dashboard.loadProjects', error, { step: 'listProjectsForOwnerSafe' })
    if (!appError) {
      appError = error
    }
    // Continue with empty arrays - page will show empty state
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
          <Section>
            <PageErrorState error={appError} />
          </Section>
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
                <Link href="/samples">
                  <Button variant="ghost" size="lg">
                    {microcopy.actions.tryExample}
                  </Button>
                </Link>
              ) : undefined
            }
          />
        
        <Section>
          <TourLink />
        </Section>

        {/* Onboarding Card for New Users (only if 0 projects) */}
        {!hasProjects && (
          <Section>
            <OnboardingCardWrapper projects={projects} />
          </Section>
        )}

        {/* Next Action Card (only if user has projects) */}
        {hasProjects && mostRecentRow && (
          <Section>
            <ContinuePanel row={mostRecentRow} />
          </Section>
        )}

        {/* Main Content */}
        {!hasProjects ? (
          <EmptyState
            title={microcopy.emptyStates.noProjects.title}
            description={microcopy.emptyStates.noProjects.description}
            action={
              <>
                <Button asChild size="lg" variant="brand" className="w-full sm:w-auto">
                  <Link href="/new?onboarding=1">{microcopy.emptyStates.noProjects.cta}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/samples">{microcopy.emptyStates.noProjects.ctaSecondary}</Link>
                </Button>
              </>
            }
          />
        ) : (
          <Section>
            <ProjectsTableWrapper rows={tableRows} />
          </Section>
        )}
      </PageShell>
    </DashboardPageClient>
  )
}

