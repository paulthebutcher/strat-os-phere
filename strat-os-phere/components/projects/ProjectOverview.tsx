import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FreshnessBadge } from '@/components/shared/FreshnessBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import type { Project } from '@/lib/supabase/types'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

interface ProjectOverviewProps {
  project: Project
  projectId: string
  hasArtifacts: boolean
  generatedAt?: string | null
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
}

/**
 * Project summary card showing key project information
 */
function ProjectSummaryCard({ project, generatedAt }: { project: Project; generatedAt?: string | null }) {
  // Use generatedAt (artifact generation time) if available, otherwise fall back to project creation time
  const lastUpdated = generatedAt ?? project.created_at
  const contextParts: string[] = []
  
  if (project.market) contextParts.push(project.market)
  if (project.primary_constraint) contextParts.push(`Constraint: ${project.primary_constraint}`)
  if (project.risk_posture) contextParts.push(`Risk: ${project.risk_posture}`)
  if (project.ambition_level) contextParts.push(`Ambition: ${project.ambition_level}`)

  // Note: starting_point column doesn't exist in production, default to 'product'
  const startingPoint = 'product'
  const startingPointLabels: Record<string, string> = {
    product: 'I have a product',
    problem: 'I have a problem',
    customer: 'I have a customer',
    market: 'Exploring a market',
  }

  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold text-foreground">{project.name}</h2>
            <Badge variant="secondary" className="text-xs">
              {startingPointLabels[startingPoint] || startingPoint}
            </Badge>
            {project.input_confidence && (
              <Badge variant="secondary" className="text-xs">
                {project.input_confidence === 'very_confident' ? 'Very confident' :
                 project.input_confidence === 'some_assumptions' ? 'Some assumptions' :
                 project.input_confidence === 'exploratory' || project.input_confidence === 'exploring' ? 'Exploring' :
                 project.input_confidence}
              </Badge>
            )}
          </div>
          {/* Note: hypothesis column does not exist in production, removed from display */}
          {contextParts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {contextParts.join(' · ')}
            </p>
          )}
        </div>
        {generatedAt && (
          <FreshnessBadge timestamp={generatedAt} prefix="Last generated" />
        )}
      </div>
      
      {lastUpdated && (
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(lastUpdated).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Recent outputs preview showing top opportunities if artifacts exist
 */
function RecentOutputsPreview({
  projectId,
  hasArtifacts,
  generatedAt,
  opportunitiesV3,
  opportunitiesV2,
}: {
  projectId: string
  hasArtifacts: boolean
  generatedAt?: string | null
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
}) {
  // Extract top 2 opportunities
  const topOpportunities: Array<{
    title: string
    score: number | null
    href: string
  }> = []

  if (opportunitiesV3?.opportunities) {
    const sorted = [...opportunitiesV3.opportunities]
      .sort((a, b) => {
        const scoreA = getOpportunityScore(a) ?? 0
        const scoreB = getOpportunityScore(b) ?? 0
        return scoreB - scoreA
      })
      .slice(0, 2)

    topOpportunities.push(
      ...sorted.map((opp) => ({
        title: opp.title,
        score: getOpportunityScore(opp),
        href: `/projects/${projectId}/opportunities#${opp.id || opp.title.toLowerCase().replace(/\s+/g, '-')}`,
      }))
    )
  } else if (opportunitiesV2?.opportunities) {
    const sorted = [...opportunitiesV2.opportunities]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 2)

    topOpportunities.push(
      ...sorted.map((opp) => ({
        title: opp.title,
        score: opp.score ?? null,
        href: `/projects/${projectId}/opportunities#${opp.title.toLowerCase().replace(/\s+/g, '-')}`,
      }))
    )
  }

  if (!hasArtifacts) {
    return (
      <div className="panel p-6">
        <h3 className="text-base font-semibold text-foreground mb-2">
          Recent outputs
        </h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>After generating your analysis, you'll see:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Top strategic opportunities with scores</li>
            <li>Jobs to be done analysis</li>
            <li>Competitive scorecard</li>
            <li>Strategic bets</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Recent outputs
          </h3>
          {generatedAt && (
            <p className="text-xs text-muted-foreground">
              Generated {new Date(generatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/projects/${projectId}/opportunities`}>
            View full results
          </Link>
        </Button>
      </div>

      {topOpportunities.length > 0 ? (
        <div className="space-y-3">
          {topOpportunities.map((opp, index) => (
            <Link
              key={index}
              href={opp.href}
              className="block p-3 rounded-md border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-medium text-foreground flex-1">
                  {opp.title}
                </h4>
                {opp.score !== null && (
                  <Badge variant="primary" className="shrink-0">
                    {opp.score}/100
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No opportunities available yet.
        </p>
      )}
    </div>
  )
}

/**
 * Main project overview component
 */
export function ProjectOverview({
  project,
  projectId,
  hasArtifacts,
  generatedAt,
  opportunitiesV3,
  opportunitiesV2,
}: ProjectOverviewProps) {
  return (
    <div className="space-y-6">
      <ProjectSummaryCard project={project} generatedAt={generatedAt} />
      <RecentOutputsPreview
        projectId={projectId}
        hasArtifacts={hasArtifacts}
        generatedAt={generatedAt}
        opportunitiesV3={opportunitiesV3}
        opportunitiesV2={opportunitiesV2}
      />
    </div>
  )
}

