'use client'

import { useState } from 'react'
import { Loader2, Search } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { QualityMeter } from './QualityMeter'
import { InlineTip } from './InlineTip'
import { isMarketComplete, isTargetCustomerComplete } from '@/lib/onboarding/heuristics'
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
    initialState.primaryCompanyName
  )
  const [contextText, setContextText] = useState(
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
      setContextText('Incident management and on-call scheduling platform for DevOps teams. Helps teams respond to incidents faster with automated alerting, on-call scheduling, and incident response workflows.')
    } else {
      setCompanyName('monday')
      setContextText('')
    }
  }

  const handleDiscover = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name')
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

      const response = await fetch('/api/onboarding/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contextText: contextText.trim() || undefined,
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
          contextText: contextText.trim() || undefined,
          resolvedSources: sources,
          suggestedCompetitors: competitors,
          selectedCompetitors,
          evidenceWindowDays: 90,
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

  // For guided mode, show example block
  const showExampleBlock = isGuidedMode

  return (
    <div className="space-y-6">
      {isGuidedMode && (
        <SurfaceCard className="p-5 border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Here's what great input looks like
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">Company:</strong> PagerDuty
              </p>
              <p>
                <strong className="text-foreground">Context:</strong> Incident management SaaS for DevOps teams. Helps teams respond to incidents faster with automated alerting and on-call scheduling.
              </p>
            </div>
            <p className="text-xs text-muted-foreground italic">
              If you're not sure, start with your best guess — we'll tighten it up.
            </p>
          </div>
        </SurfaceCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SurfaceCard className="p-6 md:p-8 shadow-md">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
                  Describe what to analyze
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Enter a company or product name. We'll automatically discover official sources, pricing pages, documentation, and recommend competitors.
                </p>
              </div>

        {/* Company name input */}
        <div className="space-y-2">
          <label
            htmlFor="companyName"
            className="text-sm font-semibold text-foreground"
          >
            Company or product name
            <span className="text-destructive ml-1">*</span>
          </label>
          <Input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value)
              setError(null)
            }}
            placeholder="e.g. monday, Asana, PagerDuty"
            disabled={isLoading}
            required
          />
          {isGuidedMode && (
            <InlineTip
              isComplete={companyName.length >= 12}
              message="Use a descriptive company or product name (12+ characters)"
              completedMessage="Great! You have a descriptive name"
            />
          )}
        </div>

        {/* Context text input */}
        <div className="space-y-2">
          <label
            htmlFor="contextText"
            className="text-sm font-semibold text-foreground"
          >
            Add context
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <Textarea
            id="contextText"
            value={contextText}
            onChange={(e) => {
              setContextText(e.target.value)
              setError(null)
            }}
            placeholder="Paste a short description, a link, or what decision you're making. We'll use it to find better sources + competitors."
            rows={4}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Help us understand your context to find better sources and
            competitors.
          </p>
          {isGuidedMode && (
            <InlineTip
              isComplete={contextText.length >= 20 && contextText.trim().split(/\s+/).length >= 2}
              message="Add context about the market, customer, or what decision you're making (2+ sentences)"
              completedMessage="Excellent context provided"
            />
          )}
        </div>

        {/* Status messages */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
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
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
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
          <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              Found {discoveryResult.sources.length} sources and{' '}
              {discoveryResult.competitors.length} competitor suggestions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Proceeding to confirmation step...
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            onClick={handleDiscover}
            disabled={isLoading || !companyName.trim()}
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
    </SurfaceCard>
        </div>

        {/* Right column: Quality meter in guided mode */}
        {isGuidedMode && (
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20">
              <QualityMeter
                inputs={{
                  name: companyName,
                  market: contextText,
                  targetCustomer: contextText,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

