import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { listProjectsForOwner, listProjectsWithCounts } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { toProjectCardModel } from '@/components/projects/mappers'
import { toProjectsListRow } from '@/lib/projects/projectsListModel'
import { ProjectsEmptyState } from '@/components/projects/ProjectsEmptyState'
import { ProjectsTableWrapper } from '@/components/projects/ProjectsTableWrapper'
import { ContinuePanel } from '@/components/projects/ContinuePanel'
import { Backdrop } from '@/components/graphics'
import { DashboardPageClient } from '@/components/projects/DashboardPageClient'
import { TourLink } from '@/components/guidance/TourLink'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { OnboardingCardWrapper } from '@/components/onboarding/OnboardingCardWrapper'

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
      <div className="min-h-[calc(100vh-57px)] bg-background" data-testid="projects-page">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <main className="flex w-full flex-col items-stretch space-y-8 animate-fade-in">
            {/* Header Bar */}
            <SectionHeader
              title="Projects"
              description="Create and manage competitive analyses. Start new or resume recent work."
              actions={
                <div className="flex items-center gap-3">
                  {hasProjects && (
                    <Link href="/samples">
                      <Button variant="ghost" size="lg">
                        Try an example
                      </Button>
                    </Link>
                  )}
                  <Link href="/projects/new">
                    <Button size="lg" variant="brand">New analysis</Button>
                  </Link>
                </div>
              }
              className="pb-2"
            />
            
            <div className="flex items-center gap-2">
              <TourLink />
            </div>

          {/* Onboarding Card for New Users (only if 0 projects) */}
          {!hasProjects && <OnboardingCardWrapper projects={projects} />}

          {/* Continue Panel (only if user has projects) */}
          {hasProjects && mostRecentProject && (
            <ContinuePanel project={mostRecentProject} />
          )}

          {/* Main Content */}
          {!hasProjects ? (
            <ProjectsEmptyState />
          ) : (
            <ProjectsTableWrapper rows={tableRows} />
          )}
        </main>
      </div>
    </div>
    </DashboardPageClient>
  )
}

