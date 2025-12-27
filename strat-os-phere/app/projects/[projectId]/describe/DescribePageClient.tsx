'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AnalysisContextForm } from '@/components/onboarding/AnalysisContextForm'
import { AnalysisFramingCard } from '@/components/onboarding/AnalysisFramingCard'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
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

type DiscoveryStatus = 'idle' | 'saving' | 'saved' | 'error'

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
  const [warnings, setWarnings] = useState<string[]>([])
  
  // Track last saved values to detect unsaved changes
  const [lastSavedValues, setLastSavedValues] = useState({
    companyName: existingInputs.primaryCompanyName || '',
    decision: existingInputs.decisionFraming?.decision || '',
    market: existingInputs.marketCategory || '',
    notes: existingInputs.contextText || '',
  })

  const hasUnsavedChanges =
    companyName !== lastSavedValues.companyName ||
    decision !== lastSavedValues.decision ||
    market !== lastSavedValues.market ||
    notes !== lastSavedValues.notes

  const handleSubmit = async () => {
    // Validate required fields
    if (!companyName.trim()) {
      setStatus('error')
      setError('Company name is required.')
      return
    }
    if (!decision.trim()) {
      setStatus('error')
      setError('Decision framing is required. What are you trying to decide?')
      return
    }

    setStatus('saving')
    setError(null)
    setWarnings([])

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
        setError(result.error || 'Failed to save decision context. Please try again.')
        return
      }

      // Save successful - update last saved values to clear unsaved changes flag
      setLastSavedValues({
        companyName: companyName.trim(),
        decision: decision.trim(),
        market: market.trim(),
        notes: notes.trim(),
      })

      // Show warnings if any (non-blocking)
      if (result.warnings && result.warnings.length > 0) {
        setWarnings(result.warnings)
      }

      // Mark as saved and navigate immediately
      setStatus('saved')

      // Navigate immediately (no setTimeout)
      // router.push doesn't throw, so we just call it directly
      router.push(`/projects/${projectId}/competitors`)
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save decision context. Please try again.'
      )
    }
  }

  const isSaving = status === 'saving'
  const isSaved = status === 'saved'
  const isError = status === 'error'
  const isIdle = status === 'idle'
  const canContinue = companyName.trim().length > 0 && decision.trim().length > 0 && !isSaving

  return (
    <PageShell>
      <PageHeader
        title="Frame your decision"
        subtitle="Step 1: Define what you're deciding and the context that matters. This sets the direction for your competitive analysis."
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
              if (isError) {
                setError(null)
                setStatus('idle')
              }
            }}
            onDecisionChange={(value) => {
              setDecision(value)
              if (isError) {
                setError(null)
                setStatus('idle')
              }
            }}
            onMarketChange={(value) => {
              setMarket(value)
              if (isError) {
                setError(null)
                setStatus('idle')
              }
            }}
            onNotesChange={(value) => {
              setNotes(value)
              if (isError) {
                setError(null)
                setStatus('idle')
              }
            }}
          />

          {/* Warnings (non-blocking) */}
          {warnings.length > 0 && (
            <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50/30 dark:bg-yellow-950/20 px-4 py-3">
              <p className="text-sm font-medium text-foreground mb-1">
                Note: {warnings.join(', ')}
              </p>
              <p className="text-xs text-muted-foreground">
                You can still proceed to competitor selection.
              </p>
            </div>
          )}

          {/* Saving status */}
          {isSaving && (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Saving decision context...
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

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canContinue}
                className="flex-1"
                size="lg"
                variant="brand"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Save & Continue to Competitors
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground text-center">
                Your decision context is saved and will guide the competitive analysis
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Next: Review suggested competitors → Evidence collection → Analysis
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

