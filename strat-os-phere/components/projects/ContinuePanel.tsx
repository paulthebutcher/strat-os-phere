'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { brand } from '@/lib/ui/brand'
import type { ProjectsListRow } from '@/lib/projects/projectsListModel'
import { formatRelativeDate } from './formatRelativeDate'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ContinuePanelProps {
  row: ProjectsListRow
}

/**
 * Next Action Card - Decision-oriented prompt for continuing work
 * 
 * Replaces generic "continue where you left off" with clear decision prompts:
 * - What should I work on next?
 * - Which projects are "real" vs drafts?
 * - Where is evidence strong vs weak?
 */
export function ContinuePanel({ row }: ContinuePanelProps) {
  const relativeDate = formatRelativeDate(row.lastTouchedAt)

  // Determine status badge styling
  const getStatusVariant = (status: ProjectsListRow['status']) => {
    switch (status) {
      case 'Results available':
        return 'success'
      case 'Ready':
        return 'default'
      default:
        return 'secondary'
    }
  }

  // Determine evidence strength styling
  const getEvidenceColor = (strength: ProjectsListRow['evidenceStrength']) => {
    switch (strength) {
      case 'Strong':
        return brand.evidence.strong.bg
      case 'Medium':
        return brand.evidence.medium.bg
      case 'Weak':
        return brand.evidence.weak.bg
      default:
        return brand.evidence.none.bg
    }
  }

  // Determine primary CTA label based on state
  const getCtaLabel = () => {
    if (row.primaryCta === 'View Opportunities') {
      return 'View opportunities'
    }
    if (row.evidenceStrength === 'None' || row.evidenceStrength === 'Weak') {
      return 'Improve evidence & rerun'
    }
    return 'Continue setup'
  }

  return (
    <div className={cn(
      "border rounded-lg p-6 shadow-sm",
      "bg-card border-border-subtle",
      "transition-all duration-[175ms] ease-out hover:shadow-md hover:border-border-strong"
    )}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Continue your most relevant work
            </h3>
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-foreground">
                {row.name}
              </h4>
              {row.subtitle && (
                <p className="text-sm text-muted-foreground">
                  {row.subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant={getStatusVariant(row.status)}
              className="text-xs"
            >
              {row.status}
            </Badge>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Evidence:</span>
                <span className={cn(
                  "text-xs font-medium",
                  row.evidenceStrength === 'Strong' ? "text-success" :
                  row.evidenceStrength === 'Medium' ? "text-accent-primary" :
                  row.evidenceStrength === 'Weak' ? "text-warning" :
                  "text-muted-foreground"
                )}>
                  {row.evidenceStrength}
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      Evidence strength reflects coverage across sources and competitors.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex-1 max-w-[100px]">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      getEvidenceColor(row.evidenceStrength)
                    )}
                    style={{ width: `${row.evidenceScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <Button asChild size="lg" variant="brand">
            <Link href={row.primaryHref || `/projects/${row.projectId}/opportunities`} prefetch>
              {getCtaLabel()}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

