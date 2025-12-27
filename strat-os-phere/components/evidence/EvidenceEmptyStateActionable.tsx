'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { paths } from '@/lib/routes'
import { SectionCard } from '@/components/results/SectionCard'
import { cn } from '@/lib/utils'

interface EvidenceEmptyStateActionableProps {
  projectId: string
  competitorCount: number
  evidenceSourceCount: number
  className?: string
}

/**
 * EvidenceEmptyStateActionable
 * 
 * Replaces dead-end empty state with actionable next steps panel.
 * Shows checklist of prerequisites and routes user to the most relevant action.
 */
export function EvidenceEmptyStateActionable({
  projectId,
  competitorCount,
  evidenceSourceCount,
  className,
}: EvidenceEmptyStateActionableProps) {
  // Determine what's missing and what the primary CTA should be
  const hasEnoughCompetitors = competitorCount >= 3
  const hasEvidenceSources = evidenceSourceCount > 0

  // Primary CTA logic:
  // 1. If competitors < 3 → "Add competitors"
  // 2. Else if evidence_sources == 0 → "Generate" (route to decision page where Generate button is)
  // 3. Else → "Generate" (fallback, though this case shouldn't show empty state)
  let primaryCTAText = 'Generate'
  let primaryCTAHref = paths.decision(projectId)
  let primaryCTADescription = 'Run analysis to collect evidence'

  if (!hasEnoughCompetitors) {
    primaryCTAText = 'Add competitors'
    primaryCTAHref = paths.competitors(projectId)
    primaryCTADescription = `Add at least ${3 - competitorCount} more ${3 - competitorCount === 1 ? 'competitor' : 'competitors'}`
  } else if (!hasEvidenceSources) {
    primaryCTAText = 'Generate'
    primaryCTAHref = paths.decision(projectId)
    primaryCTADescription = 'Run analysis to collect evidence'
  }

  return (
    <SectionCard className={cn('space-y-5', className)}>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Get started with evidence collection
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Evidence grounds your opportunities in real market signals. Complete these steps to begin collecting evidence.
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        <ChecklistItem
          completed={hasEnoughCompetitors}
          label={`Add at least 3 competitors`}
          status={hasEnoughCompetitors 
            ? `${competitorCount} added` 
            : competitorCount === 0
              ? `Need ${3 - competitorCount} competitors`
              : `${competitorCount} added (need ${3 - competitorCount} more)`}
        />
        <ChecklistItem
          completed={hasEvidenceSources}
          label="Collect evidence"
          status={hasEvidenceSources ? `${evidenceSourceCount} source${evidenceSourceCount !== 1 ? 's' : ''} collected` : 'Evidence will be collected during analysis'}
        />
        <ChecklistItem
          completed={hasEvidenceSources}
          label="Generate ranked opportunities"
          status={hasEvidenceSources ? 'Complete' : 'Run analysis to generate'}
        />
      </div>

      {/* Primary CTA */}
      <div className="pt-4 border-t border-border space-y-3">
        <Button asChild variant="default" className="w-full sm:w-auto">
          <Link href={primaryCTAHref}>
            {primaryCTAText}
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          {primaryCTADescription}
        </p>
      </div>

      {/* Secondary CTAs */}
      <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            Back to projects
          </Link>
        </Button>
      </div>
    </SectionCard>
  )
}

interface ChecklistItemProps {
  completed: boolean
  label: string
  status: string
}

function ChecklistItem({ completed, label, status }: ChecklistItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">
        {completed ? (
          <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            ✓
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">
          {label}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {status}
        </div>
      </div>
    </div>
  )
}

