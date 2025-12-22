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
    <div className="min-h-[calc(100vh-57px)] plinth-surface" data-testid="projects-page">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <main className="flex w-full flex-col items-stretch gap-8">
          {/* Header Bar */}
          <header className="flex items-start justify-between gap-4 plinth-gradient-soft rounded-lg p-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
              <p className="text-sm text-muted-foreground">
                Create and manage analyses. Start new or resume recent work.
              </p>
            </div>
            <Link href="/projects/new">
              <Button size="sm" variant="brand">New analysis</Button>
            </Link>
          </header>

          {/* Quick Actions (subtle strip) */}
          {projectCards.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">Quick actions:</span>
              <Link
                href="/projects/new"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                New analysis
              </Link>
            </div>
          )}

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
  )
}

