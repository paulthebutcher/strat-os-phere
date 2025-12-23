'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { WizardState, PricingModel } from '@/lib/onboarding/types'
import { createProjectFromForm } from '@/app/projects/actions'
import { createCompetitorForProject } from '@/app/projects/[projectId]/competitors/actions'

interface WizardStep3DetailsProps {
  state: WizardState
  onBack: () => void
  onComplete: (state: Partial<WizardState>) => void
  isAuthenticated?: boolean
}

const PRICING_MODEL_OPTIONS: PricingModel[] = [
  'Free',
  'Freemium',
  'Per-seat',
  'Usage-based',
  'Contract/enterprise',
  'Other',
]

function isNonEmptyString(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

export function WizardStep3Details({
  state,
  onBack,
  onComplete,
  isAuthenticated = true,
}: WizardStep3DetailsProps) {
  const router = useRouter()
  const [projectName, setProjectName] = useState(state.projectName || '')
  const [market, setMarket] = useState(state.marketCategory || '')
  const [product, setProduct] = useState(state.product || '')
  const [targetCustomer, setTargetCustomer] = useState(state.targetCustomer || '')
  const [geography, setGeography] = useState(state.geography || '')
  const [pricingModel, setPricingModel] = useState<PricingModel | undefined>(state.pricingModel)
  const [constraints, setConstraints] = useState(state.constraints || '')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canGenerate = isNonEmptyString(projectName)

  const handleGenerateAnalysis = async () => {
    if (!canGenerate) {
      setError('Project name is required')
      return
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent('/new')}`)
      return
    }

    setRunning(true)
    setError(null)

    try {
      // Store pricing model: append to constraints if both exist, otherwise use pricing model as constraint
      // TODO: Add a dedicated pricing_model column or metadata field for proper storage
      let finalConstraints = constraints.trim()
      if (pricingModel) {
        if (finalConstraints) {
          finalConstraints = `${finalConstraints}\n\nPricing model: ${pricingModel}`
        } else {
          finalConstraints = `Pricing model: ${pricingModel}`
        }
      }

      // Create project with all details
      const projectResult = await createProjectFromForm({
        name: projectName.trim(),
        marketCategory: market.trim() || state.marketCategory || 'Competitive analysis',
        targetCustomer: targetCustomer.trim() || 'Target customers',
        product: product.trim() || undefined,
        goal: state.decisionFraming?.decision || 'Generate competitive insights',
        geography: geography.trim() || undefined,
        primaryConstraint: finalConstraints || undefined,
      })

      if (!projectResult?.success || !projectResult.projectId) {
        throw new Error(projectResult?.message || 'Failed to create project')
      }

      const projectId = projectResult.projectId

      // Create competitors
      for (const competitor of state.selectedCompetitors) {
        try {
          const result = await createCompetitorForProject(projectId, {
            name: competitor.name,
            website: competitor.url,
            evidence: `## ${competitor.name}\n\nEvidence generation in progress.`,
          })
          if (!result.success) {
            console.error(`Failed to create competitor ${competitor.name}:`, result.message)
          }
        } catch (err) {
          console.error(`Failed to create competitor ${competitor.name}:`, err)
          // Continue with other competitors
        }
      }

      // Update wizard state with final values
      onComplete({
        projectName: projectName.trim(),
        marketCategory: market.trim() || state.marketCategory,
        product: product.trim() || undefined,
        targetCustomer: targetCustomer.trim() || undefined,
        geography: geography.trim() || undefined,
        pricingModel: pricingModel || undefined,
        constraints: constraints.trim() || undefined,
      })

      // Navigate to competitors page (or results if analysis auto-runs)
      router.push(`/projects/${projectId}/competitors`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create project. Please try again.'
      )
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Context summary */}
      <SurfaceCard className="p-6 shadow-md">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            Your analysis context
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Company: </span>
              <span className="font-medium text-foreground">
                {state.primaryCompanyName}
              </span>
            </div>
            {state.decisionFraming?.decision && (
              <div>
                <span className="text-muted-foreground">Decision: </span>
                <span className="text-foreground">
                  {state.decisionFraming.decision}
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Competitors: </span>
              <span className="text-foreground">
                {state.selectedCompetitors.length}
              </span>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* Required: Project Name */}
      <SurfaceCard className="p-6 shadow-md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground">
              Project name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value)
                setError(null)
              }}
              placeholder="e.g., Q4 Competitive Analysis"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Give your analysis a name so you can find it later.
            </p>
          </div>
        </div>
      </SurfaceCard>

      {/* Recommended fields */}
      <SurfaceCard className="p-6 shadow-md">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              Additional context (optional)
            </h3>
            <p className="text-sm text-muted-foreground">
              Help us find better evidence and improve scoring accuracy.
            </p>
          </div>

          {/* Market / Category */}
          <div>
            <label className="text-sm font-semibold text-foreground">
              Market / category
            </label>
            <Input
              type="text"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              placeholder="e.g., Incident management & on-call"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Helps us find the right peer set + sources.
            </p>
          </div>

          {/* Your product */}
          <div>
            <label className="text-sm font-semibold text-foreground">
              Your product (1–2 sentences)
            </label>
            <Textarea
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Describe your product or service in 1–2 sentences..."
              className="mt-2"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Provides context for more relevant comparisons.
            </p>
          </div>

          {/* Target customer / ICP */}
          <div>
            <label className="text-sm font-semibold text-foreground">
              Target customer / ICP
            </label>
            <Input
              type="text"
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              placeholder="e.g., Mid-market IT ops teams"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Improves which reviews, job posts, and docs we prioritize.
            </p>
          </div>

          {/* Geography */}
          <div>
            <label className="text-sm font-semibold text-foreground">
              Geography
            </label>
            <Input
              type="text"
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              placeholder="e.g., North America, Global, EMEA"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Localizes review sites + competitor set.
            </p>
          </div>

          {/* Pricing model */}
          <div>
            <label className="text-sm font-semibold text-foreground">
              Pricing model
            </label>
            <select
              value={pricingModel || ''}
              onChange={(e) => setPricingModel(e.target.value ? (e.target.value as PricingModel) : undefined)}
              className="mt-2 flex h-11 w-full rounded-lg border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-opacity-50 focus-visible:ring-offset-2 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-border-strong"
            >
              <option value="">Select pricing model...</option>
              {PRICING_MODEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Focuses pricing evidence and comparisons.
            </p>
          </div>

          {/* Constraints / notes */}
          <div>
            <label className="text-sm font-semibold text-foreground">
              Constraints / notes
            </label>
            <Textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Any constraints, assumptions, or additional context..."
              className="mt-2"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Helps us tailor the analysis to your specific situation.
            </p>
          </div>
        </div>
      </SurfaceCard>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-4 pt-2">
        {!isAuthenticated && (
          <div className="rounded-lg border border-border bg-surface-muted/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              You'll be asked to sign in to save and generate results.
            </p>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={running}
          >
            Back to competitors
          </Button>
          <Button
            type="button"
            onClick={handleGenerateAnalysis}
            disabled={!canGenerate || running}
            variant="brand"
            size="lg"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              'Generate analysis'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

