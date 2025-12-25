'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/results/SectionCard'
import { cn } from '@/lib/utils'

interface EvidenceProgressPanelProps {
  className?: string
  projectId?: string
}

/**
 * Evidence Progress Panel
 * 
 * Shown when evidence collection has started but no evidence items are available yet.
 * Reframes "empty" as work underway, not failure.
 */
export function EvidenceProgressPanel({
  className,
  projectId,
}: EvidenceProgressPanelProps) {
  return (
    <SectionCard className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          Evidence collection in progress
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          We're gathering real market signals to ground this decision.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Sources include:</p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Pricing pages</li>
          <li>Product documentation</li>
          <li>Customer reviews</li>
          <li>Public changelogs</li>
        </ul>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-sm text-muted-foreground mb-3">
          Evidence will populate as sources are parsed and normalized.
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          <strong className="text-foreground">Why this matters:</strong> Evidence constrains confidence boundaries and ranking stability.
        </p>
        {projectId && (
          <Button asChild variant="default">
            <Link href={`/projects/${projectId}/competitors`}>
              Continue evidence collection
            </Link>
          </Button>
        )}
      </div>
    </SectionCard>
  )
}

