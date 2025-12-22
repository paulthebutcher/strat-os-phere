import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { ResultsPresenter } from '@/components/results/ResultsPresenter'
import {
  getSampleBySlug,
  loadSampleArtifact,
  mapSampleToHeader,
  mapSampleToOpportunities,
  extractCitationsFromSample,
} from '@/lib/samples/adapter'

interface SamplePageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(props: SamplePageProps): Promise<Metadata> {
  const params = await props.params
  const meta = getSampleBySlug(params.slug)

  if (!meta) {
    return createPageMetadata({
      title: 'Sample Not Found — Plinth',
      description: 'Sample analysis not found.',
      path: `/samples/${params.slug}`,
      ogVariant: 'default',
      robots: {
        index: false,
        follow: false,
      },
      canonical: false,
    })
  }

  return createPageMetadata({
    title: `${meta.title} — Sample — Plinth`,
    description: meta.subtitle || 'Sample competitive analysis results.',
    path: `/samples/${params.slug}`,
    ogVariant: 'default',
    robots: {
      index: true,
      follow: true,
    },
    canonical: true,
  })
}

export default async function SamplePage(props: SamplePageProps) {
  const params = await props.params
  const slug = params.slug

  // Load sample data (no Supabase/auth)
  const meta = getSampleBySlug(slug)
  const artifact = loadSampleArtifact(slug)

  if (!meta || !artifact) {
    notFound()
  }

  // Map to presenter inputs
  const header = mapSampleToHeader(meta)
  const opportunities = mapSampleToOpportunities(artifact)
  const citations = extractCitationsFromSample(artifact)

  // CTA for sample mode
  const cta = {
    label: 'Run your own analysis',
    href: '/projects/new',
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <ResultsPresenter
          mode="sample"
          header={header}
          opportunities={opportunities}
          citations={citations}
          cta={cta}
        />
      </main>
    </div>
  )
}

