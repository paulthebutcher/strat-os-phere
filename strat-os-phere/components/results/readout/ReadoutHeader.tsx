'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RerunAnalysisButton } from '@/components/results/RerunAnalysisButton'
import { PlinthIconDirect } from '@/components/ui/PlinthIcon'

interface ReadoutHeaderProps {
  projectName: string
  lastGeneratedAt: string | null
  projectId: string
  onViewAppendix?: () => void
}

/**
 * Readout Header - Project name, timestamp, and actions
 */
export function ReadoutHeader({
  projectName,
  lastGeneratedAt,
  projectId,
  onViewAppendix,
}: ReadoutHeaderProps) {
  const formattedDate = lastGeneratedAt
    ? new Date(lastGeneratedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PlinthIconDirect name="readout" size={20} className="text-foreground/70" />
            <h1 className="readout-h1">
              Results readout
            </h1>
          </div>
          <p className="readout-label">
            A decision-ready synthesis of your competitive landscape
          </p>
          {formattedDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Last generated {formattedDate}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onViewAppendix && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/projects/${projectId}/results?tab=appendix`}>
                View Appendix
              </Link>
            </Button>
          )}
          <RerunAnalysisButton projectId={projectId} />
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Synthesized from available evidence and competitor inputs
      </div>
    </div>
  )
}

