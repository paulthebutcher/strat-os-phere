'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { paths } from '@/lib/routes'
import { SectionCard } from '@/components/results/SectionCard'
import { microcopy } from '@/lib/copy/microcopy'

interface EmptyEvidenceStateProps {
  className?: string
  projectId?: string
}

export function EmptyEvidenceState({ className, projectId }: EmptyEvidenceStateProps) {
  return (
    <SectionCard className={className}>
      <div className="text-center py-8 space-y-4">
        <h3 className="text-base font-semibold text-foreground mb-2">
          No evidence available yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Run evidence collection to ground opportunities in real market signals.
        </p>
        {projectId && (
          <div className="pt-2">
            <Button asChild variant="default">
              <Link href={paths.competitors(projectId)}>
                Run evidence collection
              </Link>
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

