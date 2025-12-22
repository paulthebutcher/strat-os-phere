'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CompetitorCard } from '@/components/competitors/CompetitorCard'
import { CompetitorForm } from '@/components/competitors/CompetitorForm'
import { AddCompetitorDrawer } from '@/components/competitors/AddCompetitorDrawer'
import { EmptyState } from '@/components/shared/EmptyState'
import { EvidenceHelpers } from '@/components/competitors/EvidenceHelpers'
import {
  MAX_COMPETITORS_PER_PROJECT,
  MIN_COMPETITORS_FOR_ANALYSIS,
} from '@/lib/constants'
import type { Competitor } from '@/lib/supabase/types'

interface CompetitorsPageClientProps {
  projectId: string
  competitors: Competitor[]
  competitorCount: number
  readyForAnalysis: boolean
  remainingToReady: number
}

export function CompetitorsPageClient({
  projectId,
  competitors,
  competitorCount,
  readyForAnalysis,
  remainingToReady,
}: CompetitorsPageClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isAtMax = competitorCount >= MAX_COMPETITORS_PER_PROJECT

  if (competitorCount === 0) {
    return (
      <>
        <section className="space-y-6">
          <EmptyState
            title="Add competitors to map the landscape"
            description="Add a handful of real alternatives so the analysis has something concrete to compare against."
            footer={
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground text-left" role="list">
                <li>Add 3–7 competitors</li>
                <li>Paste public website text (homepage/pricing/trust)</li>
                <li>Generate exec-ready insights</li>
              </ul>
            }
          />
          <div className="panel px-6 py-5">
            <div className="mb-5 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Add your first competitor to generate an exec-ready landscape summary.
                </p>
                <p className="text-xs text-muted-foreground">
                  Paste public website text only. We use this text to generate summaries. Keep it public to avoid risk.
                </p>
                <EvidenceHelpers />
              </div>
              <Button onClick={() => setDrawerOpen(true)}>
                Add competitor
              </Button>
            </div>
          </div>
        </section>

        <AddCompetitorDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        >
          <CompetitorForm
            projectId={projectId}
            existingCount={competitorCount}
            onSuccess={() => setDrawerOpen(false)}
            compact
          />
        </AddCompetitorDrawer>
      </>
    )
  }

  if (isAtMax) {
    return (
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
        <div className="panel px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Max {MAX_COMPETITORS_PER_PROJECT} competitors for this analysis.
          </p>
        </div>
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-text-secondary">
              Current competitors
            </h2>
          </div>
          <div className="panel divide-y divide-border-subtle">
            {competitors.map((competitor, index) => (
              <CompetitorCard
                key={competitor.id}
                projectId={projectId}
                competitor={competitor}
                index={index}
                total={competitorCount}
              />
            ))}
          </div>
        </section>
      </section>
    )
  }

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          {competitorCount > 0 && competitorCount < MIN_COMPETITORS_FOR_ANALYSIS && (
            <div className="panel px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Add {remainingToReady} more to generate
              </p>
            </div>
          )}
          <div className="panel px-6 py-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-text-secondary">
                  Add competitor
                </h2>
                <p className="text-xs text-muted-foreground">
                  You can add up to {MAX_COMPETITORS_PER_PROJECT} competitors per analysis. Remaining slots: {MAX_COMPETITORS_PER_PROJECT - competitorCount}.
                </p>
                <p className="text-xs text-muted-foreground">
                  Paste public website text only. We use this text to generate summaries. Keep it public to avoid risk.
                </p>
              </div>
              <Button onClick={() => setDrawerOpen(true)}>
                Add competitor
              </Button>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-text-secondary">
              Current competitors
            </h2>
          </div>
          <div className="panel divide-y divide-border-subtle">
            {competitors.map((competitor, index) => (
              <CompetitorCard
                key={competitor.id}
                projectId={projectId}
                competitor={competitor}
                index={index}
                total={competitorCount}
              />
            ))}
          </div>
        </section>
      </section>

      <AddCompetitorDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      >
        <CompetitorForm
          projectId={projectId}
          existingCount={competitorCount}
          onSuccess={() => setDrawerOpen(false)}
          compact
        />
      </AddCompetitorDrawer>
    </>
  )
}

