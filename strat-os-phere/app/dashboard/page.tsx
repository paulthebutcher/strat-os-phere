import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { listProjectsForOwner } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { toProjectCardModel } from '@/components/projects/mappers'
import { ProjectsEmptyState } from '@/components/projects/ProjectsEmptyState'
import { ProjectsListClient } from '@/components/projects/ProjectsListClient'
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

  const projects = await listProjectsForOwner(supabase, user.id)

  // Map projects to ProjectCardModel
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

  return (
    <DashboardPageClient>
      <div className="min-h-[calc(100vh-57px)] bg-background" data-testid="projects-page">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <main className="flex w-full flex-col items-stretch gap-8 animate-fade-in">
            {/* Header Bar */}
            <SectionHeader
              title="Projects"
              description="Create and manage competitive analyses. Start new or resume recent work."
              actions={
                <Link href="/projects/new">
                  <Button size="lg" variant="brand">New analysis</Button>
                </Link>
              }
              className="pb-2"
            />
            
            <div className="flex items-center gap-2">
              <TourLink />
            </div>

          {/* Onboarding Card for New Users */}
          <OnboardingCardWrapper projects={projects} />

          {/* Continue Panel */}
          {mostRecentProject && projectCards.length >= 1 && (
            <ContinuePanel project={mostRecentProject} />
          )}

          {/* Main Content */}
          {projectCards.length === 0 ? (
            <ProjectsEmptyState />
          ) : (
            <ProjectsListClient projects={projectCards} />
          )}
        </main>
      </div>
    </div>
    </DashboardPageClient>
  )
}

