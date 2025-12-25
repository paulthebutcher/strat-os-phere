'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { paths } from '@/lib/routes'
import { SectionCard } from '@/components/results/SectionCard'
import { cn } from '@/lib/utils'

interface EvidenceNotStartedPanelProps {
  className?: string
  projectId?: string
  /**
   * If true, indicates a run exists but no evidence has been collected for it yet
   * Shows different messaging in this case
   */
  hasRun?: boolean
}

/**
 * Evidence Not Started Panel
 * 
 * Shown when evidence collection has not been run yet.
 * Explains that decisions are currently ungrounded and provides clear CTA.
 */
export function EvidenceNotStartedPanel({
  className,
  projectId,
  hasRun = false,
}: EvidenceNotStartedPanelProps) {
  return (
    <SectionCard className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          {hasRun
            ? "No evidence collected for this run yet"
            : "This decision isn't grounded in evidence yet"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {hasRun
            ? "Evidence collection hasn't run for this analysis run yet."
            : "Until evidence is collected, opportunities are treated as directional."}
        </p>
      </div>

      {projectId && (
        <div className="pt-2 border-t border-border">
          <Button asChild variant="default" className="mb-3">
            <Link href={paths.competitors(projectId)}>
              Run evidence collection
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            {hasRun
              ? "Click to start collecting evidence for this analysis run."
              : "Decisions without evidence remain intentionally conservative."}
          </p>
        </div>
      )}
    </SectionCard>
  )
}

