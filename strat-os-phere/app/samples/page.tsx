import type { Metadata } from 'next'
import Link from 'next/link'

import { createPageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { getAllSampleSlugs, getSampleBySlug } from '@/lib/samples/adapter'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Sample Analyses — Plinth',
    description: 'Explore sample competitive analysis results to see what Plinth can generate.',
    path: '/samples',
    ogVariant: 'default',
    robots: {
      index: true,
      follow: true,
    },
    canonical: true,
  })
}

export default async function SamplesPage() {
  const slugs = getAllSampleSlugs()
  const samples = slugs.map((slug) => {
    const meta = getSampleBySlug(slug)
    return { slug, meta }
  }).filter((s) => s.meta !== null)

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-semibold text-foreground tracking-tight">
              Sample Analyses
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Explore sample competitive analysis results to see what Plinth can generate.
            </p>
          </div>

          {samples.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No samples available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {samples.map(({ slug, meta }) => (
                <Link
                  key={slug}
                  href={`/samples/${slug}`}
                  className="group rounded-lg border border-border bg-surface p-6 transition-colors hover:border-primary/50 hover:bg-muted/30"
                >
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                    {meta!.title}
                  </h2>
                  {meta!.subtitle && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {meta!.subtitle}
                    </p>
                  )}
                  {meta!.competitorCount && (
                    <p className="mt-4 text-xs text-muted-foreground">
                      {meta!.competitorCount} competitor{meta!.competitorCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-border">
            <Button asChild variant="brand">
              <Link href="/new">
                Create your own analysis
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

