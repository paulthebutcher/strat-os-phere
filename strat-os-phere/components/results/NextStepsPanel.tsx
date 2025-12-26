'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { paths } from '@/lib/routes'
import { cn } from '@/lib/utils'
import type { EvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { ShareButton } from '@/components/results/ShareButton'

interface NextStepsPanelProps {
  coverage?: EvidenceCoverageLite
  projectId: string
  className?: string
}

/**
 * NextStepsPanel Component
 * 
 * Shows clear next action based on evidence state:
 * - If evidence still collecting: "Let evidence collection finish" + "Fetch more evidence"
 * - If evidence is sufficient: "Share this readout" + "View all opportunities"
 */
export function NextStepsPanel({
  coverage,
  projectId,
  className,
}: NextStepsPanelProps) {
  const isEvidenceSufficient = coverage?.isEvidenceSufficient ?? false
  const isEvidenceCollecting = !isEvidenceSufficient && (coverage?.totalSources ?? 0) > 0

  return (
    <Card className={cn('border-border-subtle', className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">What to do next</CardTitle>
      </CardHeader>
      <CardContent>
        {isEvidenceCollecting ? (
          // Evidence still collecting
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground mb-2 font-medium">
                Let evidence collection finish
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Results will improve as more sources are processed.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild variant="default" className="flex-1">
                <Link href={paths.competitors(projectId)}>
                  Fetch more evidence
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={paths.competitors(projectId)}>
                  Review competitor coverage
                </Link>
              </Button>
            </div>
          </div>
        ) : isEvidenceSufficient ? (
          // Evidence is sufficient
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground mb-2 font-medium">
                Share this readout
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evidence is complete. Share with your team or stakeholders.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <ShareButton projectId={projectId} />
              <Button asChild variant="outline" className="flex-1">
                <Link href={paths.opportunities(projectId)}>
                  View all opportunities
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // No evidence yet
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground mb-2 font-medium">
                Get started
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add competitors and collect evidence to generate insights.
              </p>
            </div>
            <Button asChild variant="default" className="w-full">
              <Link href={paths.competitors(projectId)}>
                Add competitors
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

