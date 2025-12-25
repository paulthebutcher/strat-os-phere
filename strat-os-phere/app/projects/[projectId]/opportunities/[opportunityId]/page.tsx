import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { loadProject } from '@/lib/projects/loadProject'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import { createClient } from '@/lib/supabase/server'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { TourLink } from '@/components/guidance/TourLink'
import { ShareButton } from '@/components/results/ShareButton'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { toAppError, SchemaMismatchError, NotFoundError, UnauthorizedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { OpportunityDetail } from '@/components/opportunities/OpportunityDetail'
import { decodeOpportunityId } from '@/lib/opportunities/opportunityId'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

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

    // Load artifacts
    let artifacts: Awaited<ReturnType<typeof listArtifacts>> = []

    try {
      artifacts = await listArtifacts(supabase, { projectId }).catch((error) => {
        logProjectError({
          route,
          projectId,
          queryName: 'listArtifacts',
          error,
        })
        return []
      })
    } catch (error) {
      logProjectError({
        route,
        projectId,
        queryName: 'loadArtifacts',
        error,
      })
    }

    // Normalize artifacts
    const normalized = normalizeResultsArtifacts(artifacts, projectId)
    const { opportunities } = normalized
    
    // Find the specific opportunity
    const allOpportunities = [
      ...(opportunities.v3?.content?.opportunities || []),
      ...(opportunities.v2?.content?.opportunities || []),
    ]
    
    const opportunity = allOpportunities.find((opp) => {
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
      <PageGuidanceWrapper pageId="opportunity-detail">
        <PageShell size="wide">
          {/* Breadcrumb Navigation */}
          <Section>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/projects/${projectId}/decision`}>
                      {project?.name || 'Project'}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/projects/${projectId}/opportunities`}>
                      Opportunities
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{opportunity.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Section>

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
          <Section>
            <OpportunityDetail
              opportunity={opportunity}
              projectId={projectId}
              opportunitiesV3={opportunities.v3?.content || null}
              opportunitiesV2={opportunities.v2?.content || null}
            />
          </Section>
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

