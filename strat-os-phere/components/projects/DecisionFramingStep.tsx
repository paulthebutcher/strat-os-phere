'use client'

import { useState } from 'react'
import type { DecisionFraming, DecisionAudience, DecisionHorizon } from '@/lib/onboarding/types'
import { DecisionFramingSchema } from '@/lib/onboarding/types'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface DecisionFramingStepProps {
  initialState?: DecisionFraming
  onComplete: (framing: DecisionFraming) => void
  onBack: () => void
}

const DECISION_PRESETS = [
  'Where should we differentiate?',
  'What should we build next?',
  'How do we compete against these competitors?',
  'Is this market attractive to enter?',
]

const AUDIENCE_OPTIONS: { value: DecisionAudience; label: string }[] = [
  { value: 'founder', label: 'Founder' },
  { value: 'product_leader', label: 'Product Leader' },
  { value: 'exec', label: 'Executive' },
  { value: 'investor', label: 'Investor' },
  { value: 'other', label: 'Other...' },
]

const HORIZON_OPTIONS: { value: DecisionHorizon; label: string; description: string }[] = [
  { value: 'now', label: 'Now', description: '0–6 months' },
  { value: 'next', label: 'Next', description: '6–18 months' },
  { value: 'long_term', label: 'Long-term bets', description: '18+ months' },
]

export function DecisionFramingStep({
  initialState,
  onComplete,
  onBack,
}: DecisionFramingStepProps) {
  const [decision, setDecision] = useState(initialState?.decision || '')
  const [audience, setAudience] = useState<DecisionAudience | undefined>(initialState?.audience)
  const [audienceOtherText, setAudienceOtherText] = useState(initialState?.audienceOtherText || '')
  const [yourProduct, setYourProduct] = useState(initialState?.yourProduct || '')
  const [horizon, setHorizon] = useState<DecisionHorizon | undefined>(initialState?.horizon)
  const [error, setError] = useState<string | null>(null)

  const handlePresetClick = (preset: string) => {
    setDecision(preset)
    setError(null)
  }

  const handleSubmit = () => {
    setError(null)

    const framing: DecisionFraming = {
      decision: decision.trim(),
      audience,
      audienceOtherText: audience === 'other' ? audienceOtherText.trim() : undefined,
      yourProduct: yourProduct.trim() || undefined,
      horizon,
    }

    // Validate with zod
    const result = DecisionFramingSchema.safeParse(framing)
    if (!result.success) {
      const firstError = result.error.errors[0]
      setError(firstError.message)
      return
    }

    onComplete(result.data)
  }

  const canSubmit = decision.trim().length > 0

  return (
    <SurfaceCard className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Frame the decision
          </h2>
          <p className="text-sm text-muted-foreground">
            Help us understand what decision you're trying to support with this analysis.
          </p>
        </div>

        {/* Decision input (required) */}
        <div className="space-y-3">
          <label
            htmlFor="decision"
            className="text-sm font-semibold text-foreground"
          >
            What decision are you trying to support?
            <span className="text-destructive ml-1">*</span>
          </label>

          {/* Preset buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {DECISION_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={decision === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="justify-start text-left h-auto py-2 px-3"
              >
                {preset}
              </Button>
            ))}
          </div>

          {/* Custom decision input */}
          <Textarea
            id="decision"
            value={decision}
            onChange={(e) => {
              setDecision(e.target.value)
              setError(null)
            }}
            placeholder="Or describe your decision in your own words..."
            rows={3}
            className="mt-2"
          />
        </div>

        {/* Audience (optional) */}
        <div className="space-y-2">
          <label
            htmlFor="audience"
            className="text-sm font-semibold text-foreground"
          >
            Audience / Who this is for
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <select
            id="audience"
            value={audience || ''}
            onChange={(e) => {
              const value = e.target.value as DecisionAudience | ''
              setAudience(value || undefined)
              if (value !== 'other') {
                setAudienceOtherText('')
              }
              setError(null)
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <option value="">Select an audience...</option>
            {AUDIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Other audience text input */}
          {audience === 'other' && (
            <Input
              type="text"
              value={audienceOtherText}
              onChange={(e) => {
                setAudienceOtherText(e.target.value)
                setError(null)
              }}
              placeholder="Specify the audience..."
              className="mt-2"
            />
          )}
        </div>

        {/* Your product (optional) */}
        <div className="space-y-2">
          <label
            htmlFor="yourProduct"
            className="text-sm font-semibold text-foreground"
          >
            Your product
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <Input
            id="yourProduct"
            type="text"
            value={yourProduct}
            onChange={(e) => {
              setYourProduct(e.target.value)
              setError(null)
            }}
            placeholder="One sentence. Skip if you're exploring."
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            One sentence. Skip if you're exploring.
          </p>
        </div>

        {/* Time horizon (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Time horizon
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {HORIZON_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={horizon === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setHorizon(opt.value)
                  setError(null)
                }}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-xs opacity-75 ml-1">
                  ({opt.description})
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Create analysis
          </Button>
        </div>
      </div>
    </SurfaceCard>
  )
}

