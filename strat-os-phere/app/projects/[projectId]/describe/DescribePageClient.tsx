'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AnalysisContextForm } from '@/components/onboarding/AnalysisContextForm'
import { AnalysisFramingCard } from '@/components/onboarding/AnalysisFramingCard'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { CheckCircle2 } from 'lucide-react'
import { submitDescribeStep } from './actions'
import { microcopy } from '@/lib/copy/microcopy'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSection } from '@/components/layout/Section'

interface DescribePageClientProps {
  projectId: string
  projectName: string
  existingInputs: Record<string, any>
}

type DiscoveryStatus = 'idle' | 'searching' | 'success' | 'error'

export function DescribePageClient({
  projectId,
  projectName,
  existingInputs,
}: DescribePageClientProps) {
  const router = useRouter()
  const [companyName, setCompanyName] = useState(
    existingInputs.primaryCompanyName || ''
  )
  const [decision, setDecision] = useState(
    existingInputs.decisionFraming?.decision || ''
  )
  const [market, setMarket] = useState(
    existingInputs.marketCategory || ''
  )
  const [notes, setNotes] = useState(
    existingInputs.contextText || ''
  )
  const [status, setStatus] = useState<DiscoveryStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name')
      return
    }
    if (!decision.trim()) {
      setError('Please enter a decision')
      return
    }

    setStatus('searching')
    setError(null)

    try {
      const result = await submitDescribeStep(projectId, {
        primaryCompanyName: companyName.trim(),
        contextText: notes.trim() || undefined,
        decisionFraming: {
          decision: decision.trim(),
        },
        marketCategory: market.trim() || undefined,
      })

      if (!result.success) {
        setStatus('error')
        setError(result.message || 'Failed to submit. Please try again.')
        return
      }

      setStatus('success')

      // Navigate to Step 2 (competitors) after a brief delay
      setTimeout(() => {
        router.push(`/projects/${projectId}/competitors`)
      }, 500)
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit. Please try again.'
      )
    }
  }

  const isLoading = status === 'searching'
  const canContinue = companyName.trim().length > 0 && decision.trim().length > 0

  return (
    <PageShell>
      <PageHeader
        title="Describe your analysis"
        subtitle="Step 1: Tell us what you're trying to decide and we'll suggest competitors to compare against."
      />

      <PageSection>
        <div className="space-y-6">
          {/* Main form */}
          <AnalysisContextForm
            companyName={companyName}
            decision={decision}
            market={market}
            notes={notes}
            onCompanyNameChange={(value) => {
              setCompanyName(value)
              setError(null)
            }}
            onDecisionChange={(value) => {
              setDecision(value)
              setError(null)
            }}
            onMarketChange={(value) => {
              setMarket(value)
              setError(null)
            }}
            onNotesChange={(value) => {
              setNotes(value)
              setError(null)
            }}
          />

          {/* Status messages */}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Analyzing context and finding competitors...
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          {/* Success message */}
          {status === 'success' && (
            <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                Analysis context saved. Proceeding to competitor selection...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !canContinue}
                className="flex-1"
                size="lg"
                variant="brand"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Continue to Competitors
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground text-center">
                {microcopy.onboarding.helperText.evidenceGuidance}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Step 2: Review suggested competitors → Step 3: Evidence collection
              </p>
            </div>
          </div>
        </div>
      </PageSection>

      {/* Bottom row: Info cards side-by-side */}
      <PageSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalysisFramingCard
            companyName={companyName}
            decision={decision}
            market={market}
          />
          <SurfaceCard className="p-6 shadow-md">
            <h3 className="text-base font-semibold text-foreground mb-4">
              {microcopy.onboarding.helperText.whatYoullGet.title}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {microcopy.onboarding.helperText.whatYoullGet.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {microcopy.onboarding.helperText.publicSourcesOnly}
              </p>
            </div>
          </SurfaceCard>
        </div>
      </PageSection>
    </PageShell>
  )
}

