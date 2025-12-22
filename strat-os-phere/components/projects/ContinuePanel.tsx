'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProjectCard } from './ProjectCard'
import type { ProjectCardModel } from './types'

interface ContinuePanelProps {
  project: ProjectCardModel
}

export function ContinuePanel({ project }: ContinuePanelProps) {
  return (
    <div className="plinth-surface-tint border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Continue</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {project.title}
          </p>
          {project.market && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {project.market}
            </p>
          )}
        </div>
        <Button asChild size="sm">
          <Link href={project.primaryAction.href}>
            {project.primaryAction.label}
          </Link>
        </Button>
      </div>
    </div>
  )
}

