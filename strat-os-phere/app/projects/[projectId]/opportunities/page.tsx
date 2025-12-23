import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import { createClient } from '@/lib/supabase/server'
import { OpportunitiesContent } from '@/components/results/OpportunitiesContent'
import { ResultsReadout } from '@/components/results/ResultsReadout'
import { ShareButton } from '@/components/results/ShareButton'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { TourLink } from '@/components/guidance/TourLink'
import { FLAGS } from '@/lib/flags'
import { getProcessedClaims } from '@/lib/evidence/claims/getProcessedClaims'
import { readLatestEvidenceBundle } from '@/lib/evidence/readBundle'
import { EvidenceTrustPanelWrapper } from '@/components/evidence/EvidenceTrustPanelWrapper'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'

interface OpportunitiesPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: OpportunitiesPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Opportunities — Plinth",
    description:
      "Strategic opportunities ranked by score with actionable experiments and proof points.",
    path: `/projects/${params.projectId}/opportunities`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

/**
 * Canonical Opportunities page
 * 
 * This is the primary view for viewing project results and opportunities.
 * It loads artifacts, normalizes them once, and renders the opportunities-first view.
 */
export default async function OpportunitiesPage(props: OpportunitiesPageProps) {
  const params = await props.params
  const projectId = params.projectId

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const project = await getProjectById(supabase, projectId)

  if (!project || project.user_id !== user.id) {
    notFound()
  }

  const [competitors, artifacts, evidenceBundle] = await Promise.all([
    listCompetitorsForProject(supabase, projectId),
    listArtifacts(supabase, { projectId }),
    readLatestEvidenceBundle(supabase, projectId),
  ])

  // Normalize artifacts once using the canonical normalization function
  const normalized = normalizeResultsArtifacts(artifacts, projectId)
  const { opportunities, strategicBets, profiles, jtbd } = normalized
  
  // Load and process claims if trust layer is enabled
  const competitorDomains = competitors
    .map(c => c.url)
    .filter((u): u is string => Boolean(u))
  
  const processedClaims = FLAGS.evidenceTrustLayerEnabled
    ? await getProcessedClaims(supabase, projectId, competitorDomains)
    : null

  return (
    <PageGuidanceWrapper pageId="results">
      <PageShell size="wide">
        <PageHeader
          title="Opportunities"
          subtitle="Strategic opportunities ranked by score with actionable experiments and proof points."
          secondaryActions={
            <>
              <TourLink />
              <ShareButton projectId={projectId} />
            </>
          }
        />

        {/* Evidence Trust Panel (if enabled) */}
        {FLAGS.evidenceTrustLayerEnabled && processedClaims && (
          <Section>
            <EvidenceTrustPanelWrapper
              coverage={processedClaims.coverage}
              claimsByType={processedClaims.claimsByType}
              bundle={evidenceBundle}
              lastUpdated={evidenceBundle?.createdAt || null}
            />
          </Section>
        )}
        
        {/* Executive Readout, Assumptions Map, and Assumptions Ledger */}
        <Section>
          <ResultsReadout
            projectId={projectId}
            opportunitiesV3={opportunities.best?.type === 'opportunities_v3' ? opportunities.best.content : null}
            opportunitiesV2={opportunities.best?.type === 'opportunities_v2' ? opportunities.best.content : null}
            generatedAt={normalized.meta.lastGeneratedAt || undefined}
            projectName={project?.name || undefined}
          />
        </Section>

        {/* Opportunities Content - primary view */}
        <Section>
          <OpportunitiesContent
            projectId={projectId}
            opportunitiesV3={opportunities.v3?.content}
            opportunitiesV2={opportunities.v2?.content}
            profiles={profiles?.snapshots ? { snapshots: profiles.snapshots } : null}
            strategicBets={strategicBets?.content}
            jtbd={jtbd?.content}
          />
        </Section>
      </PageShell>
    </PageGuidanceWrapper>
  )
}

