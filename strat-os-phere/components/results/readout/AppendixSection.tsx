'use client'

import Link from 'next/link'
import { SectionCard } from '@/components/results/SectionCard'
import type { NormalizedResults } from '@/lib/results/normalizeResults'

interface AppendixSectionProps {
  projectId: string
  normalized: NormalizedResults
}

/**
 * Appendix Section - Links to deep dive sections
 */
export function AppendixSection({
  projectId,
  normalized,
}: AppendixSectionProps) {
  const tabs: Array<{ id: string; label: string; enabled: boolean }> = [
    {
      id: 'opportunities',
      label: 'Opportunities (full)',
      enabled: Boolean(normalized.opportunities.best),
    },
    {
      id: 'jobs',
      label: 'Jobs To Be Done',
      enabled: Boolean(normalized.jtbd),
    },
    {
      id: 'strategic_bets',
      label: 'Strategic Bets',
      enabled: Boolean(normalized.strategicBets),
    },
    {
      id: 'profiles',
      label: 'Competitor Profiles',
      enabled: Boolean(normalized.profiles),
    },
    {
      id: 'scorecard',
      label: 'Scorecard',
      enabled: normalized.meta.availableArtifactTypes.includes('scoring_matrix'),
    },
    {
      id: 'evidence',
      label: 'Evidence',
      enabled: Boolean(normalized.evidenceSummary),
    },
  ]

  const enabledTabs = tabs.filter(tab => tab.enabled)

  if (enabledTabs.length === 0) {
    return null
  }

  return (
    <section className="space-y-4 pt-8 border-t border-border">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Appendix</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Deep dives (supporting detail)
        </p>
      </div>
      <SectionCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enabledTabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/projects/${projectId}/results?tab=${tab.id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-primary">
                {tab.label}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-primary">→</span>
            </Link>
          ))}
        </div>
      </SectionCard>
    </section>
  )
}

