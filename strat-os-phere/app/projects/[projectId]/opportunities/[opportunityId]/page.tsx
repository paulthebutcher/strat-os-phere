import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { loadProject } from '@/lib/projects/loadProject'
import { getDecisionModel } from '@/lib/results/getDecisionModel'
import { createClient } from '@/lib/supabase/server'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { PAGE_IDS } from '@/lib/guidance/content'
import { TourLink } from '@/components/guidance/TourLink'
import { ShareButton } from '@/components/results/ShareButton'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSection } from '@/components/layout/Section'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { toAppError, SchemaMismatchError, NotFoundError, UnauthorizedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { OpportunityDetail } from '@/components/opportunities/OpportunityDetail'
import { decodeOpportunityId } from '@/lib/opportunities/opportunityId'
import { ProjectBreadcrumbs } from '@/components/layout/ProjectBreadcrumbs'

interface OpportunityDetailPageProps {
  params: Promise<{
    projectId: string
    opportunityId: string
  }>
}

export async function generateMetadata(props: OpportunityDetailPageProps): Promise<Metadata> {
  const params = await props.params
  const projectId = params.projectId
  const opportunityId = params.opportunityId
  
  // Load project name for title
  let projectName = "this project"
  try {
    const supabase = await createClient()
    const projectResult = await loadProject(supabase, projectId)
    if (projectResult.ok) {
      projectName = projectResult.project.name
    }
  } catch (error) {
    // Fallback to generic title if project load fails
  }
  
  return createPageMetadata({
    title: `Opportunity details for ${projectName}`,
    description:
      "Deep dive into strategic opportunity: signals, evidence, and relationship to the overall decision.",
    path: `/projects/${projectId}/opportunities/${opportunityId}`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

/**
 * Opportunity Detail Page
 * 
 * Focused deep dive on a single opportunity. Answers:
 * - If I want to pressure-test this opportunity, what do I need to know?
 * 
 * This page is not the final decision—it is a deep dive on one candidate.
 */
export default async function OpportunityDetailPage(props: OpportunityDetailPageProps) {
  const params = await props.params
  const projectId = params.projectId
  const encodedOpportunityId = params.opportunityId
  const route = `/projects/${projectId}/opportunities/${encodedOpportunityId}`

  try {
    const supabase = await createClient()
    
    // Decode opportunity ID
    const opportunityId = decodeOpportunityId(encodedOpportunityId)
    
    // Use unified project loader with structured error handling
    const projectResult = await loadProject(supabase, projectId, undefined, route)

    if (!projectResult.ok) {
      let appError: ReturnType<typeof toAppError>
      
      if (projectResult.kind === 'not_found') {
        appError = new NotFoundError(
          projectResult.message || 'Project not found',
          {
            action: { label: 'Back to Projects', href: '/dashboard' },
            details: { projectId, route },
          }
        )
      } else if (projectResult.kind === 'unauthorized') {
        appError = new UnauthorizedError(
          projectResult.message || 'You do not have access to this project',
          {
            action: { label: 'Sign in', href: '/login' },
            details: { projectId, route },
          }
        )
      } else {
        if (projectResult.isMissingColumn) {
          appError = new SchemaMismatchError(
            projectResult.message || 'Schema mismatch detected',
            {
              details: { projectId, route, isMissingColumn: true },
            }
          )
        } else {
          appError = toAppError(
            new Error(projectResult.message || 'Failed to load project'),
            { projectId, route, kind: projectResult.kind }
          )
        }
      }
      
      logAppError('project.opportunity.detail', appError, { projectId, route, kind: projectResult.kind })
      
      if (projectResult.kind === 'not_found' || projectResult.kind === 'unauthorized') {
        notFound()
      }
      
      return <ProjectErrorState error={appError} projectId={projectId} />
    }

    const { project } = projectResult

    // Load decision model
    let decisionModel: Awaited<ReturnType<typeof getDecisionModel>> | null = null

    try {
      decisionModel = await getDecisionModel(supabase, { projectId }).catch((error) => {
        logProjectError({
          route,
          projectId,
          queryName: 'getDecisionModel',
          error,
        })
        return null
      })
    } catch (error) {
      logProjectError({
        route,
        projectId,
        queryName: 'loadDecisionModel',
        error,
      })
    }

    // Find the specific opportunity from raw artifact content (for backward compatibility with OpportunityDetail component)
    // TODO: Update OpportunityDetail to accept canonical Opportunity type
    const rawV3 = decisionModel?._rawOpportunitiesV3
    const rawV2 = decisionModel?._rawOpportunitiesV2
    const allRawOpportunities = [
      ...(rawV3?.opportunities || []),
      ...(rawV2?.opportunities || []),
    ]
    const opportunity = allRawOpportunities.find((opp: any) => {
      const oppId = 'id' in opp ? opp.id : opp.title
      return oppId === opportunityId
    })

    if (!opportunity) {
      logAppError('project.opportunity.detail', new NotFoundError('Opportunity not found', {
        details: { projectId, opportunityId, route },
      }), { projectId, opportunityId, route })
      notFound()
    }

    return (
      <PageGuidanceWrapper pageId={PAGE_IDS.opportunityDetail}>
        <PageShell size="wide">
          {/* Breadcrumb Navigation */}
          <PageSection>
            <ProjectBreadcrumbs
              projectId={projectId}
              projectName={project.name}
              opportunityTitle={opportunity.title}
            />
          </PageSection>

          <PageHeader
            title={opportunity.title}
            subtitle="Deep dive into this strategic opportunity"
            secondaryActions={
              <>
                <TourLink />
                <ShareButton projectId={projectId} />
              </>
            }
          />

          {/* Opportunity Detail Component */}
          <PageSection>
            <OpportunityDetail
              opportunity={opportunity}
              projectId={projectId}
              opportunitiesV3={decisionModel?._rawOpportunitiesV3 || null}
              opportunitiesV2={decisionModel?._rawOpportunitiesV2 || null}
            />
          </PageSection>
        </PageShell>
      </PageGuidanceWrapper>
    )
  } catch (error) {
    logProjectError({
      route,
      projectId,
      queryName: 'OpportunityDetailPage',
      error,
    })
    
    const appError = toAppError(error, { projectId, route })
    logAppError('project.opportunity.detail', appError, { projectId, route })
    return <ProjectErrorState error={appError} projectId={projectId} />
  }
}

