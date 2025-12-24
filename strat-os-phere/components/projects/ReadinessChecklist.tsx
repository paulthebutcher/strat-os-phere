import Link from 'next/link'
import { Check, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReadinessItem } from '@/lib/ui/readiness'
import type { EvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { MIN_COMPETITORS } from '@/lib/evidence/coverageLite'

interface ReadinessChecklistProps {
  items: ReadinessItem[]
  projectId: string
}

interface EvidenceReadinessChecklistProps {
  competitorCount: number
  coverage: EvidenceCoverageLite
  hasOpportunitiesArtifact: boolean
  projectId: string
}

/**
 * Evidence-focused readiness checklist component
 * Shows 3 specific items based on evidence_sources data only
 */
export function EvidenceReadinessChecklist({
  competitorCount,
  coverage,
  hasOpportunitiesArtifact,
  projectId,
  }: EvidenceReadinessChecklistProps) {
  // Item A: Competitors added
  const hasEnoughCompetitors = competitorCount >= MIN_COMPETITORS
  const competitorsItem = {
    id: 'competitors',
    label: 'Competitors added',
    status: hasEnoughCompetitors ? ('complete' as const) : ('incomplete' as const),
    details: `${competitorCount}/${MIN_COMPETITORS} competitors added`,
    fixHref: hasEnoughCompetitors ? undefined : '/competitors',
  }

  // Item B: Evidence coverage sufficient
  const evidenceItem = {
    id: 'evidence',
    label: 'Evidence coverage sufficient',
    status: coverage.isEvidenceSufficient ? ('complete' as const) : ('incomplete' as const),
    details: coverage.isEvidenceSufficient
      ? `${coverage.evidenceTypesPresent.length} evidence types across ${coverage.competitorIdsWithEvidence.length} competitors`
      : coverage.reasonsMissing.slice(0, 2).join(' '), // Max 2 lines
    fixHref: coverage.isEvidenceSufficient ? undefined : '/evidence',
  }

  // Item C: Opportunities generated
  const opportunitiesItem = {
    id: 'opportunities',
    label: 'Opportunities generated',
    status: hasOpportunitiesArtifact
      ? ('complete' as const)
      : coverage.isEvidenceSufficient
      ? ('incomplete' as const)
      : ('incomplete' as const),
    details: hasOpportunitiesArtifact
      ? 'Ranked opportunities are available'
      : 'Generate ranked opportunities once evidence is sufficient.',
    fixHref: hasOpportunitiesArtifact
      ? undefined
      : coverage.isEvidenceSufficient
      ? '/opportunities'
      : undefined,
  }

  const items = [competitorsItem, evidenceItem, opportunitiesItem]

  return (
    <div id="readiness-checklist" className="bg-card border border-border rounded-md p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Readiness checklist
      </h3>
      <ul className="space-y-3">
        {items.map((item) => {
          const isComplete = item.status === 'complete'
          const fixHref = item.fixHref
            ? item.fixHref.startsWith('/')
              ? `/projects/${projectId}${item.fixHref}`
              : item.fixHref
            : undefined

          // Use AlertCircle (⚠️) for incomplete evidence items that aren't errors
          const showWarningIcon = !isComplete && item.id === 'evidence'
          const showCheckIcon = isComplete
          const showXIcon = !isComplete && !showWarningIcon

          return (
            <li
              key={item.id}
              className={cn(
                'flex items-start gap-3',
                !isComplete && 'text-muted-foreground'
              )}
            >
              {/* Status icon */}
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                {showCheckIcon ? (
                  <Check className="h-5 w-5 text-success" />
                ) : showWarningIcon ? (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p
                      className={cn(
                        'text-sm',
                        isComplete ? 'font-medium text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </p>
                    {item.details && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.details}
                      </p>
                    )}
                  </div>
                  {fixHref && !isComplete && (
                    <Link
                      href={fixHref}
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline shrink-0"
                    >
                      Fix
                    </Link>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Checklist component showing project readiness items
 * Each item shows status, label, and optional fix link
 */
export function ReadinessChecklist({ items, projectId }: ReadinessChecklistProps) {
  return (
    <div id="readiness-checklist" className="panel p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Readiness checklist
      </h3>
      <ul className="space-y-3">
        {items.map((item) => {
          const isComplete = item.status === 'complete'
          const fixHref = item.fixHref
            ? item.fixHref.startsWith('/')
              ? `/projects/${projectId}${item.fixHref}`
              : item.fixHref
            : undefined

          return (
            <li
              key={item.id}
              className={cn(
                'flex items-start gap-3',
                !isComplete && 'text-muted-foreground'
              )}
            >
              {/* Status icon */}
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                {isComplete ? (
                  <Check className="h-5 w-5 text-success" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p
                      className={cn(
                        'text-sm',
                        isComplete ? 'font-medium text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </p>
                    {item.details && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.details}
                      </p>
                    )}
                  </div>
                  {fixHref && !isComplete && (
                    <Link
                      href={fixHref}
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline shrink-0"
                    >
                      Fix
                    </Link>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

