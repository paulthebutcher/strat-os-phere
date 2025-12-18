import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ProjectForm } from '@/components/project-form'
import { listProjectsForOwner } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'

import { signOut } from '../login/actions'

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <main className="flex w-full max-w-3xl flex-col items-stretch gap-8 py-10">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </header>

        {!hasProjects ? (
          <section className="w-full">
            <ProjectForm />
          </section>
        ) : (
          <section className="flex w-full flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Your analyses</h2>
              <Link href="/projects/new">
                <Button type="button" size="sm" variant="outline">
                  New +
                </Button>
              </Link>
            </div>

            <div className="panel divide-y">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}/competitors`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {project.name}
                    </p>
                    {formatProjectSummary(project) ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {formatProjectSummary(project)}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    View competitors →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

