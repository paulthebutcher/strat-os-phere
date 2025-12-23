'use client'

import { useState } from 'react'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TryDraft, TryMode } from '@/lib/tryDraft'
import { ModeSelector } from '@/components/try/ModeSelector'
import { ExampleChips } from '@/components/try/ExampleChips'
import { OptionalDetails } from '@/components/try/OptionalDetails'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface TryStep1DescribeProps {
  initialState: TryDraft
  onComplete: (updates: Partial<TryDraft>) => void
}

function getModeConfig(mode: TryMode) {
  switch (mode) {
    case 'company':
      return {
        label: 'Company or product name',
        placeholder: 'e.g. monday.com, Asana, PagerDuty',
        helper: "Use the brand name or product line. Example: 'PagerDuty', 'monday.com', 'Rippling'.",
      }
    case 'market':
      return {
        label: 'Market / category',
        placeholder: 'e.g. Incident management platforms',
        helper: "Be specific. Example: 'Incident management for engineering orgs' beats 'DevOps'.",
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
            <h2 className="text-xl font-semibold text-foreground mb-1 tracking-tight">
              What are we analyzing?
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

          {/* Good input examples accordion */}
          <div className="pt-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="examples" className="border-none">
                <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium text-foreground">
                  What good input looks like
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="p-3 rounded-lg border border-border bg-muted/30">
                      <p className="font-medium text-foreground mb-1">Example 1: Company analysis</p>
                      <p className="text-xs">Company: <span className="font-medium text-foreground">PagerDuty</span></p>
                      <p className="text-xs">Decision: <span className="font-medium text-foreground">Should we enter mid-market?</span></p>
                      <p className="text-xs">Market: <span className="font-medium text-foreground">Incident management for engineering orgs</span></p>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-muted/30">
                      <p className="font-medium text-foreground mb-1">Example 2: Market research</p>
                      <p className="text-xs">Market: <span className="font-medium text-foreground">Project management for remote teams</span></p>
                      <p className="text-xs">Decision: <span className="font-medium text-foreground">Why are we losing deals?</span></p>
                      <p className="text-xs">Constraints: <span className="font-medium text-foreground">Price sensitive buyers, must integrate with Jira</span></p>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-muted/30">
                      <p className="font-medium text-foreground mb-1">Example 3: Product idea</p>
                      <p className="text-xs">Idea: <span className="font-medium text-foreground">AI assistant for customer support QA</span></p>
                      <p className="text-xs">Decision: <span className="font-medium text-foreground">What should we build next?</span></p>
                      <p className="text-xs">Market: <span className="font-medium text-foreground">Customer support tools</span></p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

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
