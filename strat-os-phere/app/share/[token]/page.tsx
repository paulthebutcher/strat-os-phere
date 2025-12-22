import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSharedProjectByToken } from '@/lib/shares'
import { ResultsPresenter } from '@/components/results/ResultsPresenter'
import { extractCitationsFromAllArtifacts } from '@/lib/results/evidence'
import { createPageMetadata } from '@/lib/seo/metadata'
import { getOrigin } from '@/lib/server/origin'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { StrategicBetsArtifactContent } from '@/lib/schemas/strategicBet'
import type { JtbdArtifactContent } from '@/lib/schemas/jtbd'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'

interface SharePageProps {
  params: Promise<{
    token: string
  }>
}

export async function generateMetadata(props: SharePageProps): Promise<Metadata> {
  const params = await props.params
  const token = params.token

  // Get shared project data for metadata
  const supabase = await createClient()
  const sharedData = await getSharedProjectByToken(supabase, token)

  if (!sharedData) {
    return createPageMetadata({
      title: 'Share not found — Plinth',
      description: 'This share link is invalid or has been revoked.',
      path: `/share/${token}`,
      ogVariant: 'default',
      robots: {
        index: false,
        follow: false,
      },
      canonical: false,
    })
  }

  const origin = await getOrigin()
  const projectName = sharedData.project.name
  const market = sharedData.project.market || 'this market'
  const description = `Top opportunities and evidence-backed signals for ${market}.`

  return {
    title: `Plinth Readout — ${projectName}`,
    description,
    openGraph: {
      title: `Plinth Readout — ${projectName}`,
      description,
      url: `${origin}/share/${token}`,
      type: 'article',
      images: [
        {
          url: `${origin}/share/${token}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: projectName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Plinth Readout — ${projectName}`,
      description,
      images: [`${origin}/share/${token}/opengraph-image`],
    },
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function SharePage(props: SharePageProps) {
  const params = await props.params
  const token = params.token

  // Use anon client for public access (no auth required)
  const supabase = await createClient()
  const sharedData = await getSharedProjectByToken(supabase, token)

  if (!sharedData) {
    notFound()
  }

  // Calculate evidence window days (if we have generatedAt)
  let evidenceWindowDays: number | undefined
  if (sharedData.generatedAt) {
    const generatedDate = new Date(sharedData.generatedAt)
    const now = new Date()
    const diffMs = now.getTime() - generatedDate.getTime()
    evidenceWindowDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  }

  // Extract citations from artifacts
  const citations = extractCitationsFromAllArtifacts(
    (sharedData.opportunitiesV3 || sharedData.opportunitiesV2) as
      | OpportunityV3ArtifactContent
      | OpportunitiesArtifactContent
      | null
      | undefined,
    sharedData.profiles as { snapshots: CompetitorSnapshot[] } | null | undefined,
    sharedData.strategicBets as StrategicBetsArtifactContent | null | undefined,
    sharedData.jtbd as JtbdArtifactContent | null | undefined
  )

  // Build header
  const header = {
    title: sharedData.project.name,
    subtitle: sharedData.project.market
      ? `Opportunities for ${sharedData.project.market}`
      : 'Strategic opportunities',
    generatedAtISO: sharedData.generatedAt || undefined,
    competitorCount: sharedData.competitorCount,
    evidenceWindowDays,
  }

  // Build opportunities array (empty, presenter will use raw artifacts)
  const presenterOpportunities: Array<{
    id: string
    title: string
    score: number
  }> = []

  return (
    <div className="flex min-h-screen items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        {/* Disclosure banner */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Shared read-only.</span>{' '}
            {evidenceWindowDays !== undefined
              ? `Generated from public sources in the last ${evidenceWindowDays} day${evidenceWindowDays !== 1 ? 's' : ''}.`
              : 'Generated from public sources.'}{' '}
            May be incomplete.
          </p>
        </div>

        {/* Results presenter in share mode */}
        <ResultsPresenter
          mode="sample"
          header={header}
          opportunities={presenterOpportunities}
          citations={citations}
          opportunitiesV3={
            (sharedData.opportunitiesV3 as OpportunityV3ArtifactContent | null) ||
            undefined
          }
          opportunitiesV2={
            (sharedData.opportunitiesV2 as OpportunitiesArtifactContent | null) ||
            undefined
          }
          profiles={sharedData.profiles as { snapshots: CompetitorSnapshot[] } | null}
          strategicBets={
            (sharedData.strategicBets as StrategicBetsArtifactContent | null) || undefined
          }
          jtbd={(sharedData.jtbd as JtbdArtifactContent | null) || undefined}
          cta={{
            label: 'Create your own',
            href: '/login',
          }}
        />
      </main>
    </div>
  )
}

