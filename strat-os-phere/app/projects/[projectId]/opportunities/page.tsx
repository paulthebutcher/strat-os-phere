import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { loadProject } from '@/lib/projects/loadProject'
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
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'

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
  const route = `/projects/${projectId}/opportunities`

  try {
    const supabase = await createClient()
    
    // Use unified project loader with structured error handling
    // (loadProject handles user authentication internally)
    const projectResult = await loadProject(supabase, projectId, undefined, route)

    if (!projectResult.ok) {
      // Handle different error kinds
      if (projectResult.kind === 'not_found' || projectResult.kind === 'unauthorized') {
        notFound()
      }
      
      // For query failures (including schema drift), show error state
      return <ProjectErrorState projectId={projectId} isMissingColumn={projectResult.isMissingColumn} />
    }

    const { project } = projectResult

    // Load related data with error handling - default to empty arrays on failure
    let competitors: Awaited<ReturnType<typeof listCompetitorsForProject>> = []
    let artifacts: Awaited<ReturnType<typeof listArtifacts>> = []
    let evidenceBundle: Awaited<ReturnType<typeof readLatestEvidenceBundle>> = null

    try {
      const [competitorsResult, artifactsResult, evidenceBundleResult] = await Promise.all([
        listCompetitorsForProject(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'listCompetitorsForProject',
            error,
          })
          return []
        }),
        listArtifacts(supabase, { projectId }).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'listArtifacts',
            error,
          })
          return []
        }),
        readLatestEvidenceBundle(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'readLatestEvidenceBundle',
            error,
          })
          return null
        }),
      ])
      
      competitors = competitorsResult ?? []
      artifacts = artifactsResult ?? []
      evidenceBundle = evidenceBundleResult ?? null
    } catch (error) {
      // Log but continue - we'll show empty states
      logProjectError({
        route,
        projectId,
        queryName: 'loadRelatedData',
        error,
      })
    }

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
  } catch (error) {
    // Log any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'OpportunitiesPage',
      error,
    })
    
    // Show error state instead of crashing
    return <ProjectErrorState projectId={projectId} />
  }
}

