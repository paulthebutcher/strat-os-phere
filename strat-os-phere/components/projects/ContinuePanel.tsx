'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ProjectCardModel } from './types'
import { formatRelativeDate } from './formatRelativeDate'

interface ContinuePanelProps {
  project: ProjectCardModel
}

export function ContinuePanel({ project }: ContinuePanelProps) {
  const relativeDate = formatRelativeDate(project.lastTouchedAt)

  return (
    <div className="plinth-surface-tint border border-border rounded-lg p-5 bg-muted/30">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Continue where you left off
            </h3>
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              {project.title}
            </p>
            {project.market && (
              <p className="text-sm text-muted-foreground">
                {project.market}
              </p>
            )}
            {relativeDate !== '—' && (
              <p className="text-xs text-muted-foreground">
                Last touched {relativeDate}
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button asChild size="lg" variant="brand">
            <Link href={project.primaryAction.href}>
              {project.primaryAction.label}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

