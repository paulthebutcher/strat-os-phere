import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ProjectForm } from '@/components/project-form'
import { listProjectsForOwner } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'

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
      <div className="mx-auto max-w-6xl px-4 py-10">
        <main className="flex w-full flex-col items-stretch gap-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Your strategy projects and analyses
            </p>
          </header>

          {!hasProjects ? (
            <section className="w-full">
              <ProjectForm />
            </section>
          ) : (
            <section className="flex w-full flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-foreground">Your analyses</h2>
                <Link href="/projects/new">
                  <Button type="button" size="sm">
                    New +
                  </Button>
                </Link>
              </div>

              <div className="panel divide-y">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}/competitors`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-foreground">
                        {project.name}
                      </p>
                      {formatProjectSummary(project) ? (
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                          {formatProjectSummary(project)}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-sm font-medium text-primary whitespace-nowrap">
                      View →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

