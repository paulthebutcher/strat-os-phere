'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { OpportunityCardV1 } from '@/components/opportunities/OpportunityCardV1'
import { OpportunityEvidenceDrawer, type EvidenceDrawerCitation } from '@/components/evidence/OpportunityEvidenceDrawer'
import { qaScenarios, type QAScenario } from '@/lib/content/qa/fixtures'
import { EmptyState } from '@/components/layout/EmptyState'
import type { OpportunityV1 } from '@/lib/opportunities/opportunityV1'

/**
 * Normalize OpportunityV1 citations to EvidenceDrawerCitation format
 */
function normalizeCitations(opportunity: OpportunityV1): EvidenceDrawerCitation[] {
  return opportunity.citations.map((cit) => ({
    url: cit.url,
    sourceType: cit.sourceType,
    excerpt: cit.excerpt,
    evidenceId: cit.evidenceId,
    retrievedAt: cit.retrievedAt,
  }))
}

/**
 * QA Dashboard Client Component
 * 
 * Provides a scenario switcher UI to test opportunity rendering
 * across different edge cases using deterministic fixtures.
 */
export function QADashboardClient() {
  const [selectedScenario, setSelectedScenario] = useState<QAScenario | null>(
    qaScenarios[0] || null
  )
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityV1 | null>(
    qaScenarios[0]?.opportunities[0] || null
  )
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false)

  const handleScenarioSelect = (scenario: QAScenario) => {
    setSelectedScenario(scenario)
    setSelectedOpportunity(scenario.opportunities[0] || null)
    setIsEvidenceDrawerOpen(false)
  }

  const handleOpportunitySelect = (opportunity: OpportunityV1) => {
    setSelectedOpportunity(opportunity)
    setIsEvidenceDrawerOpen(false)
  }

  const citations = selectedOpportunity ? normalizeCitations(selectedOpportunity) : []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            QA Dashboard
          </h1>
          <p className="text-muted-foreground">
            Validate opportunity UI rendering across edge cases with deterministic fixtures.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Left column: Scenario list */}
          <aside className="space-y-4">
            <div className="sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Scenarios
              </h2>
              <div className="space-y-2">
                {qaScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioSelect(scenario)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-colors',
                      selectedScenario?.id === scenario.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div className="font-medium text-sm text-foreground mb-1">
                      {scenario.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {scenario.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right column: Preview */}
          <main className="space-y-6">
            {selectedScenario && (
              <>
                {/* Scenario header */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {selectedScenario.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedScenario.description}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {selectedScenario.opportunities.length === 0
                      ? '0 opportunities'
                      : `${selectedScenario.opportunities.length} opportunity${selectedScenario.opportunities.length !== 1 ? 's' : ''}`}
                  </div>
                </div>

                {/* Opportunity selector (if multiple) */}
                {selectedScenario.opportunities.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedScenario.opportunities.map((opp, idx) => (
                      <Button
                        key={opp.id}
                        variant={selectedOpportunity?.id === opp.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleOpportunitySelect(opp)}
                      >
                        Opportunity {idx + 1}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Render empty state or opportunities */}
                {selectedScenario.opportunities.length === 0 ? (
                  <div className="py-12">
                    <EmptyState
                      title="No opportunities"
                      description="This scenario tests empty state rendering. No opportunities are available."
                      action={
                        <Button
                          variant="outline"
                          onClick={() => handleScenarioSelect(qaScenarios[0])}
                        >
                          View Full Opportunity
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedScenario.opportunities.map((opportunity) => {
                      // Only render the selected opportunity if multiple exist
                      if (
                        selectedScenario.opportunities.length > 1 &&
                        opportunity.id !== selectedOpportunity?.id
                      ) {
                        return null
                      }

                      return (
                        <div key={opportunity.id}>
                          <OpportunityCardV1
                            opportunity={opportunity}
                            projectId="qa-test-project"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Evidence drawer trigger (for testing) */}
                {selectedOpportunity && citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setIsEvidenceDrawerOpen(true)}
                    >
                      Open Evidence Drawer (Test)
                    </Button>
                  </div>
                )}

                {/* Evidence Drawer */}
                {selectedOpportunity && (
                  <OpportunityEvidenceDrawer
                    open={isEvidenceDrawerOpen}
                    onOpenChange={setIsEvidenceDrawerOpen}
                    opportunityTitle={selectedOpportunity.title}
                    citations={citations}
                    onAddEvidenceHref="/projects/qa-test-project/competitors"
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

