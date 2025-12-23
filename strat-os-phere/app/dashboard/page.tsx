import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { listProjectsForOwner, listProjectsWithCounts } from '@/lib/data/projects'
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

  // Fetch projects with counts for table view
  const projectsWithCounts = await listProjectsWithCounts(supabase, user.id)
  
  // Map to table rows
  const tableRows = projectsWithCounts.map(toProjectsListRow)

  // Also fetch basic projects for ContinuePanel and OnboardingCardWrapper (they use ProjectCardModel)
  const projects = await listProjectsForOwner(supabase, user.id)
  const projectCards = projects.map(toProjectCardModel)

  // Find most recent project for "Continue" panel
  const mostRecentProject = projectCards.length > 0
    ? projectCards.reduce((latest, current) => {
        const latestDate = latest.lastTouchedAt ?? latest.createdAt ?? ''
        const currentDate = current.lastTouchedAt ?? current.createdAt ?? ''
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
          subtitle="Create and manage competitive analyses. Start new or resume recent work."
          primaryAction={
            <Link href="/projects/new">
              <Button size="lg" variant="brand">New analysis</Button>
            </Link>
          }
          secondaryActions={
            hasProjects ? (
              <Link href="/samples">
                <Button variant="ghost" size="lg">
                  Try an example
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

        {/* Continue Panel (only if user has projects) */}
        {hasProjects && mostRecentProject && (
          <Section>
            <ContinuePanel project={mostRecentProject} />
          </Section>
        )}

        {/* Main Content */}
        {!hasProjects ? (
          <EmptyState
            title="Start your first analysis"
            description="Get started by creating a new competitive analysis project. We'll help you discover strategic opportunities."
            action={
              <>
                <Button asChild size="lg" variant="brand" className="w-full sm:w-auto">
                  <Link href="/projects/new?onboarding=1">Start guided analysis</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/samples">Try an example</Link>
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

