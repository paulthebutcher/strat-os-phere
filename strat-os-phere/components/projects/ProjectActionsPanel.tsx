'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { paths } from '@/lib/routes'
import { GenerateAnalysisButton } from '@/components/projects/GenerateAnalysisButton'
import { RegenerateButton } from '@/components/results/RegenerateButton'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import type { ProjectReadiness } from '@/lib/ui/readiness'

interface ProjectActionsPanelProps {
  projectId: string
  readiness: ProjectReadiness
  competitorCount: number
  effectiveCompetitorCount?: number
  hasArtifacts: boolean
}

/**
 * Sticky actions panel for project overview (desktop only)
 * Shows primary actions based on project state
 */
export function ProjectActionsPanel({
  projectId,
  readiness,
  competitorCount,
  effectiveCompetitorCount,
  hasArtifacts,
}: ProjectActionsPanelProps) {
  const canGenerate = readiness.allComplete && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS

  return (
    <aside className="hidden lg:block lg:w-64 lg:shrink-0">
      <div className="sticky top-24 space-y-4">
        <div className="panel p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Project Actions</h3>

          {/* Primary action */}
          {canGenerate && !hasArtifacts && (
            <GenerateAnalysisButton
              projectId={projectId}
              label="Generate Analysis"
              canGenerate={canGenerate}
              className="w-full"
            />
          )}

          {canGenerate && hasArtifacts && (
            <RegenerateButton
              projectId={projectId}
              competitorCount={effectiveCompetitorCount ?? competitorCount}
              label="Regenerate Analysis"
            />
          )}

          {!canGenerate && (
            <div className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link
                  href={
                    readiness.nextAction.href === '/competitors'
                      ? `/projects/${projectId}/competitors`
                      : readiness.nextAction.href === '/projects'
                      ? `/dashboard`
                      : readiness.nextAction.href === '/overview' || readiness.nextAction.href === '/opportunities'
                      ? `/projects/${projectId}/opportunities`
                      : readiness.nextAction.href.startsWith('/')
                      ? `/projects/${projectId}${readiness.nextAction.href}`
                      : readiness.nextAction.href
                  }
                >
                  {readiness.nextAction.label}
                </Link>
              </Button>
              {readiness.nextAction.disabledReason && (
                <p className="text-xs text-muted-foreground">
                  {readiness.nextAction.disabledReason}
                </p>
              )}
            </div>
          )}

          {/* Secondary actions */}
          <div className="space-y-2 pt-2 border-t border-border">
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link href={paths.competitors(projectId)}>
                Add Competitor
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full" size="sm">
              <Link href={paths.competitors(projectId)}>
                Edit Competitors
              </Link>
            </Button>

            {/* Help link - only show if help page exists */}
            <Button asChild variant="ghost" className="w-full" size="sm">
              <Link href="/help">
                Help
              </Link>
            </Button>
          </div>

          {/* Disabled reason */}
          {!canGenerate && readiness.nextAction.disabledReason && (
            <p className="text-xs text-muted-foreground">
              {readiness.nextAction.disabledReason}
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}

