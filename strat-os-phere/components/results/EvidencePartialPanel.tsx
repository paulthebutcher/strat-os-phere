'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { paths } from '@/lib/routes'
import { SectionCard } from '@/components/results/SectionCard'
import { cn } from '@/lib/utils'

interface EvidencePartialPanelProps {
  className?: string
  projectId?: string
}

/**
 * Evidence Partial Panel
 * 
 * Shown when evidence exists but coverage is partial.
 * Explains that results are directional and provides CTA to fetch more evidence.
 */
export function EvidencePartialPanel({
  className,
  projectId,
}: EvidencePartialPanelProps) {
  return (
    <SectionCard className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          Evidence is partial; treat as directional
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Some evidence has been collected, but coverage is incomplete. Results should be treated as directional until more evidence is available.
        </p>
      </div>

      {projectId && (
        <div className="pt-2 border-t border-border">
          <Button asChild variant="default" className="mb-3">
            <Link href={paths.competitors(projectId)}>
              Fetch more evidence
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Adding more evidence will strengthen confidence in opportunity rankings.
          </p>
        </div>
      )}
    </SectionCard>
  )
}

