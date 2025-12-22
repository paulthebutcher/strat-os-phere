'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible } from '@/components/ui/collapsible'
import Link from 'next/link'

interface RunRecapPanelProps {
  projectId: string
  /**
   * Whether profiles/jobs were generated
   */
  hasJobs?: boolean
  /**
   * Whether scorecard was generated
   */
  hasScorecard?: boolean
  /**
   * Whether opportunities were generated
   */
  hasOpportunities?: boolean
  /**
   * Whether strategic bets were generated
   */
  hasStrategicBets?: boolean
  /**
   * ISO timestamp of when the run completed
   */
  generatedAt?: string | null
  /**
   * Default collapsed state
   */
  defaultOpen?: boolean
}

/**
 * Post-generation run recap panel
 * Shows what phases completed and provides quick navigation to results sections
 * Appears at the top of Results page after a run completes
 */
export function RunRecapPanel({
  projectId,
  hasJobs = false,
  hasScorecard = false,
  hasOpportunities = false,
  hasStrategicBets = false,
  generatedAt,
  defaultOpen = true,
}: RunRecapPanelProps) {
  const phases = [
    {
      id: 'jobs',
      label: 'Jobs To Be Done',
      completed: hasJobs,
      href: `/projects/${projectId}/jobs`,
    },
    {
      id: 'scorecard',
      label: 'Scorecard',
      completed: hasScorecard,
      href: `/projects/${projectId}/scorecard`,
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      completed: hasOpportunities,
      href: `/projects/${projectId}/opportunities`,
    },
    {
      id: 'strategic_bets',
      label: 'Strategic Bets',
      completed: hasStrategicBets,
      href: `/projects/${projectId}/strategic-bets`,
    },
  ]

  const completedCount = phases.filter((p) => p.completed).length
  const totalPhases = phases.length

  // Don't render if nothing completed
  if (completedCount === 0) {
    return null
  }

  // Determine "next best action" based on what's available
  const nextAction = hasStrategicBets
    ? { label: 'View Strategic Bets', href: `/projects/${projectId}/strategic-bets` }
    : hasOpportunities
    ? { label: 'View Opportunities', href: `/projects/${projectId}/opportunities` }
    : hasScorecard
    ? { label: 'View Scorecard', href: `/projects/${projectId}/scorecard` }
    : hasJobs
    ? { label: 'View Jobs', href: `/projects/${projectId}/jobs` }
    : null

  const titleText = `Analysis complete: ${completedCount} of ${totalPhases} phases`
  const descriptionText = generatedAt
    ? `Completed ${new Date(generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    : undefined

  return (
    <div className="panel border-2 border-primary/20 p-4">
      <Collapsible
        title={titleText}
        description={descriptionText}
        defaultOpen={defaultOpen}
        className="space-y-4"
      >
        {/* Completed phases */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Completed phases
          </h4>
          <ul className="space-y-2">
            {phases
              .filter((phase) => phase.completed)
              .map((phase) => (
                <li
                  key={phase.id}
                  className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground">{phase.label}</span>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                    <Link href={phase.href}>View</Link>
                  </Button>
                </li>
              ))}
          </ul>
        </div>

        {/* Next best action */}
        {nextAction && (
          <div className="border-t border-border pt-4">
            <Button asChild className="w-full sm:w-auto">
              <Link href={nextAction.href}>{nextAction.label}</Link>
            </Button>
          </div>
        )}
      </Collapsible>
    </div>
  )
}

