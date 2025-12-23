'use client'

import { useState } from 'react'
import { Loader2, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AnalysisContextForm } from './AnalysisContextForm'
import { AnalysisFramingCard } from './AnalysisFramingCard'
import { QualityMeter } from './QualityMeter'
import { InlineTip } from './InlineTip'
import type {
  WizardState,
  ResolvedSource,
  SuggestedCompetitor,
} from '@/lib/onboarding/types'

interface WizardStep1DescribeProps {
  initialState: WizardState
  onComplete: (state: Partial<WizardState>) => void
  isGuidedMode?: boolean
}

type DiscoveryStatus =
  | 'idle'
  | 'searching'
  | 'finding_sources'
  | 'recommending_competitors'
  | 'success'
  | 'error'

export function WizardStep1Describe({
  initialState,
  onComplete,
  isGuidedMode = false,
}: WizardStep1DescribeProps) {
  const [companyName, setCompanyName] = useState(
    initialState.primaryCompanyName || ''
  )
  const [decision, setDecision] = useState(
    initialState.decisionFraming?.decision || ''
  )
  const [market, setMarket] = useState(
    initialState.marketCategory || ''
  )
  const [notes, setNotes] = useState(
    initialState.contextText || ''
  )
  const [status, setStatus] = useState<DiscoveryStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [discoveryResult, setDiscoveryResult] = useState<{
    sources: ResolvedSource[]
    competitors: SuggestedCompetitor[]
  } | null>(null)

  const handleTryExample = () => {
    if (isGuidedMode) {
      // Example for guided mode: Incident management SaaS
      setCompanyName('PagerDuty')
      setDecision('Which segment should we enter?')
      setMarket('Incident management platforms')
      setNotes('Incident management and on-call scheduling platform for DevOps teams. Helps teams respond to incidents faster with automated alerting, on-call scheduling, and incident response workflows.')
    } else {
      setCompanyName('monday')
      setDecision('What should we build next?')
      setMarket('Project management software')
      setNotes('')
    }
  }

  const handleDiscover = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name')
      return
    }
    if (!decision.trim()) {
      setError('Please enter a decision')
      return
    }
    if (!market.trim()) {
      setError('Please enter a market/category')
      return
    }

    setStatus('searching')
    setError(null)

    try {
      // Update status messages
      setTimeout(() => {
        if (status === 'searching') {
          setStatus('finding_sources')
        }
      }, 500)

      setTimeout(() => {
        if (status === 'finding_sources') {
          setStatus('recommending_competitors')
        }
      }, 1500)

      // Combine decision and notes into contextText for the API
      const contextText = notes.trim() 
        ? `${decision.trim()}\n\n${notes.trim()}`
        : decision.trim()

      const response = await fetch('/api/onboarding/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contextText: contextText || undefined,
          evidenceWindowDays: 90,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Failed to discover sources (${response.status})`
        )
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Ensure at least one source is enabled
      const sources = (data.resolvedSources || []).map((s: ResolvedSource) => ({
        ...s,
        enabled: s.enabled !== false,
      }))

      // Default select top 3-5 competitors
      const competitors = data.suggestedCompetitors || []
      const selectedCompetitors = competitors
        .slice(0, Math.min(5, competitors.length))
        .filter((c: SuggestedCompetitor) => c.url)
        .map((c: SuggestedCompetitor) => ({
          name: c.name,
          url: c.url!,
        }))

      setDiscoveryResult({
        sources,
        competitors,
      })

      setStatus('success')

      // Auto-advance to step 2 after a brief delay
      setTimeout(() => {
        onComplete({
          primaryCompanyName: companyName.trim(),
          marketCategory: market.trim(),
          contextText: notes.trim() || undefined,
          resolvedSources: sources,
          suggestedCompetitors: competitors,
          selectedCompetitors,
          evidenceWindowDays: 90,
          decisionFraming: {
            decision: decision.trim(),
          },
        })
      }, 500)
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to discover sources. Please try again.'
      )
    }
  }

  const isLoading = status !== 'idle' && status !== 'success' && status !== 'error'
  const canContinue = companyName.trim().length > 0 && decision.trim().length > 0 && market.trim().length > 0

  return (
    <div className="space-y-6">
      {isGuidedMode && (
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 p-5">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Here's what great input looks like
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">Company:</strong> PagerDuty
              </p>
              <p>
                <strong className="text-foreground">Decision:</strong> Which segment should we enter?
              </p>
              <p>
                <strong className="text-foreground">Market:</strong> Incident management platforms
              </p>
            </div>
            <p className="text-xs text-muted-foreground italic">
              If you're not sure, start with your best guess — we'll tighten it up.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Main form */}
        <div className="lg:col-span-8">
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
            <div className="mt-6 flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {status === 'searching' && 'Searching the web...'}
                  {status === 'finding_sources' &&
                    'Finding pricing/docs/changelog...'}
                  {status === 'recommending_competitors' &&
                    'Recommending competitors...'}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
              {error.includes('Tavily') && (
                <p className="text-xs text-muted-foreground mt-2">
                  Try adding 'software' or 'platform' to the company name, or
                  check your internet connection.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscover}
                disabled={isLoading}
                className="mt-3"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Success message */}
          {status === 'success' && discoveryResult && (
            <div className="mt-6 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                Found {discoveryResult.sources.length} sources and{' '}
                {discoveryResult.competitors.length} competitor suggestions
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Proceeding to next step...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            <Button
              type="button"
              onClick={handleDiscover}
              disabled={isLoading || !canContinue}
              className="flex-1"
              size="lg"
              variant="brand"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Discovering...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find sources & competitors
                </>
              )}
            </Button>
            {isGuidedMode ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleTryExample}
                disabled={isLoading}
                size="lg"
              >
                Use example: Incident management SaaS
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleTryExample}
                disabled={isLoading}
                size="lg"
              >
                Try an example
              </Button>
            )}
          </div>
        </div>

        {/* Right column: Preview / Quality meter */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-20 space-y-4">
            {isGuidedMode && (
              <QualityMeter
                inputs={{
                  name: companyName,
                  market: market,
                  targetCustomer: decision,
                }}
              />
            )}
            <AnalysisFramingCard
              companyName={companyName}
              decision={decision}
              market={market}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
