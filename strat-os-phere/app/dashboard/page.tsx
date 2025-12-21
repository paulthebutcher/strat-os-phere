import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { ProjectForm } from '@/components/project-form'
import { listProjectsForOwner } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'

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

  const hasProjects = projects.length > 0

  const formatProjectSummary = (project: (typeof projects)[number]) => {
    const segments: string[] = []

    if (project.market) {
      segments.push(`Market: ${project.market}`)
    }
    if (project.target_customer) {
      segments.push(`Customer: ${project.target_customer}`)
    }
    if (project.your_product) {
      segments.push(`Product: ${project.your_product}`)
    }
    if (project.business_goal) {
      segments.push(`Goal: ${project.business_goal}`)
    }
    if (project.geography) {
      segments.push(`Geography: ${project.geography}`)
    }

    return segments.join(' · ')
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <main className="flex w-full flex-col items-stretch gap-10">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">Analyses</h1>
            <p className="text-sm text-muted-foreground">
              Strategic decisions in progress
            </p>
          </header>

          {!hasProjects ? (
            <section className="w-full">
              <ProjectForm />
            </section>
          ) : (
            <section className="flex w-full flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1" />
                <Link href="/projects/new">
                  <Button type="button" size="sm">
                    New analysis
                  </Button>
                </Link>
              </div>

              <div className="space-y-1">
                {projects.map((project) => {
                  const summary = formatProjectSummary(project)
                  const market = project.market || 'Market not specified'
                  const strategicQuestion = project.business_goal || project.name
                  
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}/competitors`}
                      className="block border-b border-border py-6 transition-colors hover:bg-surface-muted/50 first:pt-0"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div>
                            <p className="text-base font-semibold text-foreground">
                              {market}
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {strategicQuestion}
                            </p>
                          </div>
                          {summary ? (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {summary}
                            </p>
                          ) : null}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap shrink-0">
                          →
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

