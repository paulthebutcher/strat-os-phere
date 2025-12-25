'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/results/SectionCard'
import { cn } from '@/lib/utils'

interface EvidenceNotStartedPanelProps {
  className?: string
  projectId?: string
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
}: EvidenceNotStartedPanelProps) {
  return (
    <SectionCard className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          This decision isn't grounded in evidence yet
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Until evidence is collected, opportunities are treated as directional.
        </p>
      </div>

      {projectId && (
        <div className="pt-2 border-t border-border">
          <Button asChild variant="default" className="mb-3">
            <Link href={`/projects/${projectId}/competitors`}>
              Run evidence collection
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Decisions without evidence remain intentionally conservative.
          </p>
        </div>
      )}
    </SectionCard>
  )
}

