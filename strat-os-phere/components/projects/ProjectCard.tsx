'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ProjectCardModel } from './types'
import { formatRelativeDate } from './formatRelativeDate'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: ProjectCardModel
}

export function ProjectCard({ project }: ProjectCardProps) {
  const relativeDate = formatRelativeDate(project.lastTouchedAt)

  return (
    <div className="plinth-card p-5" data-testid="project-card">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground mb-1.5">
            {project.title}
          </h3>
          {project.market && (
            <p className="text-sm text-muted-foreground">{project.market}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {project.metaChips.map((chip, idx) => (
          <Badge
            key={idx}
            variant={
              chip.tone === 'good'
                ? 'success'
                : chip.tone === 'warn'
                ? 'warning'
                : 'default'
            }
            className="text-xs"
          >
            {chip.label}
          </Badge>
        ))}
        {relativeDate !== '—' && (
          <span className="text-xs text-muted-foreground">
            Last touched {relativeDate}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button asChild size="sm" variant="default" className="flex-1">
          <Link href={project.primaryAction.href}>
            {project.primaryAction.label}
          </Link>
        </Button>
        {project.secondaryAction && (
          <Button asChild size="sm" variant="outline">
            <Link href={project.secondaryAction.href}>
              {project.secondaryAction.label}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

