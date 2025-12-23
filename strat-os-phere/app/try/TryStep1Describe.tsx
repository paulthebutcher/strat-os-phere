'use client'

import { useState } from 'react'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TryDraft, TryMode } from '@/lib/tryDraft'
import { ModeSelector } from '@/components/try/ModeSelector'
import { ExampleChips } from '@/components/try/ExampleChips'
import { OptionalDetails } from '@/components/try/OptionalDetails'

interface TryStep1DescribeProps {
  initialState: TryDraft
  onComplete: (updates: Partial<TryDraft>) => void
}

function getModeConfig(mode: TryMode) {
  switch (mode) {
    case 'company':
      return {
        label: 'Company or product',
        placeholder: 'e.g. monday.com, Asana, PagerDuty',
        helper: "We'll infer competitors and sources automatically.",
      }
    case 'market':
      return {
        label: 'Market / category',
        placeholder: 'e.g. Incident management platforms',
        helper: "We'll suggest representative competitors.",
      }
    case 'idea':
      return {
        label: 'Idea in one sentence',
        placeholder: 'e.g. AI assistant for customer support QA',
        helper: "We'll infer market + likely alternatives.",
      }
  }
}

export function TryStep1Describe({
  initialState,
  onComplete,
}: TryStep1DescribeProps) {
  const [mode, setMode] = useState<TryMode>(
    initialState.mode || 'company'
  )
  // For backward compatibility: if marketCategory exists but no primaryCompanyName, infer market mode
  const initialPrimaryInput = 
    initialState.primaryCompanyName || 
    initialState.marketCategory || 
    ''
  const [primaryInput, setPrimaryInput] = useState(initialPrimaryInput)
  const [contextText, setContextText] = useState(
    initialState.contextText || ''
  )
  const [targetCustomer, setTargetCustomer] = useState(
    initialState.targetCustomer || ''
  )
  const [error, setError] = useState<string | null>(null)

  const modeConfig = getModeConfig(mode)

  const handleContinue = () => {
    if (!primaryInput.trim()) {
      setError('Add a company, market, or idea.')
      return
    }

    setError(null)
    
    // Map mode to appropriate fields
    // Always set primaryCompanyName for backward compatibility
    const updates: Partial<TryDraft> = {
      mode,
      primaryCompanyName: primaryInput.trim(),
      contextText: contextText.trim() || undefined,
      targetCustomer: targetCustomer.trim() || undefined,
    }

    // Set mode-specific fields
    if (mode === 'market') {
      updates.marketCategory = primaryInput.trim()
    } else if (mode === 'idea') {
      // For idea mode, if no context text was provided, use the idea as context
      if (!contextText.trim()) {
        updates.contextText = primaryInput.trim()
      }
    }

    onComplete(updates)
  }

  const handleExampleSelect = (exampleMode: TryMode, value: string) => {
    setMode(exampleMode)
    setPrimaryInput(value)
    // Clear optional details unless already typed
    if (!contextText && !targetCustomer) {
      setContextText('')
      setTargetCustomer('')
    }
    setError(null)
  }

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6 md:p-8 shadow-md">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
              What should Plinth analyze?
            </h2>
          </div>

          {/* Mode selector */}
          <div className="space-y-3">
            <ModeSelector value={mode} onValueChange={setMode} />
          </div>

          {/* Primary input */}
          <div className="space-y-2">
            <label
              htmlFor="primaryInput"
              className="text-sm font-semibold text-foreground"
            >
              {modeConfig.label}
              <span className="text-destructive ml-1">*</span>
            </label>
            <Input
              id="primaryInput"
              type="text"
              value={primaryInput}
              onChange={(e) => {
                setPrimaryInput(e.target.value)
                setError(null)
              }}
              placeholder={modeConfig.placeholder}
              required
              className="text-base"
            />
            <p className="text-sm text-muted-foreground">
              {modeConfig.helper}
            </p>
          </div>

          {/* Example chips */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Examples:</p>
            <ExampleChips onSelect={handleExampleSelect} />
          </div>

          {/* Optional details */}
          <OptionalDetails
            contextText={contextText}
            targetCustomer={targetCustomer}
            onContextTextChange={setContextText}
            onTargetCustomerChange={setTargetCustomer}
          />

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              onClick={handleContinue}
              disabled={!primaryInput.trim()}
              className="flex-1"
              size="lg"
              variant="brand"
            >
              Continue
            </Button>
          </div>
        </div>
      </SurfaceCard>
    </div>
  )
}
