'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import type { WizardState } from '@/lib/onboarding/types'
import { WizardStep1Describe } from './WizardStep1Describe'
import { WizardStep2Confirm } from './WizardStep2Confirm'
import { WizardStep3Details } from './WizardStep3Details'
import { FirstWinChecklist } from './FirstWinChecklist'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'
import { microcopy } from '@/lib/copy/microcopy'

interface AnalysisWizardProps {
  onComplete?: (state: WizardState) => void
  onStateChange?: (state: Partial<WizardState>) => void
  isGuidedMode?: boolean
  isAuthenticated?: boolean
  initialState?: WizardState
}

const getInitialState = (initialState?: WizardState): WizardState => {
  if (initialState) {
    return initialState
  }
  return {
    primaryCompanyName: '',
    contextText: undefined,
    resolvedSources: [],
    suggestedCompetitors: [],
    selectedCompetitors: [],
    evidenceWindowDays: 90,
  }
}

const getInitialStep = (state: WizardState): 1 | 2 | 3 => {
  // If we have company name and competitors, go to step 3
  if (state.primaryCompanyName && state.selectedCompetitors.length > 0) {
    return 3
  }
  // If we have company name, go to step 2
  if (state.primaryCompanyName) {
    return 2
  }
  return 1
}

export function AnalysisWizard({ 
  onComplete, 
  onStateChange,
  isGuidedMode = false,
  isAuthenticated = true,
  initialState,
}: AnalysisWizardProps) {
  const initialWizardState = getInitialState(initialState)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(getInitialStep(initialWizardState))
  const [wizardState, setWizardState] = useState<WizardState>(initialWizardState)

  // Update state when initialState changes (e.g., after login)
  useEffect(() => {
    if (initialState) {
      setWizardState(initialState)
      setCurrentStep(getInitialStep(initialState))
    }
  }, [initialState])

  const updateState = (updates: Partial<WizardState>) => {
    setWizardState((prev) => {
      const updated = { ...prev, ...updates }
      if (onStateChange) {
        onStateChange(updates)
      }
      return updated
    })
  }

  const handleStep1Complete = (state: Partial<WizardState>) => {
    updateState(state)
    setCurrentStep(2)
  }

  const handleStep2Back = () => {
    setCurrentStep(1)
  }

  const handleStep2Complete = (state: Partial<WizardState>) => {
    updateState(state)
    setCurrentStep(3)
  }

  const handleStep3Back = () => {
    setCurrentStep(2)
  }

  const handleStep3Complete = (state: Partial<WizardState>) => {
    const finalState = { ...wizardState, ...state }
    updateState(state)
    if (onComplete) {
      onComplete(finalState)
    }
  }

  // Get step title and subtitle
  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: microcopy.onboarding.stepTitles.step1,
          subtitle: microcopy.onboarding.stepDescriptions.step1,
        }
      case 2:
        return {
          title: microcopy.onboarding.stepTitles.step2,
          subtitle: microcopy.onboarding.stepDescriptions.step2,
        }
      case 3:
        return {
          title: microcopy.onboarding.stepTitles.step3,
          subtitle: microcopy.onboarding.stepDescriptions.step3,
        }
      default:
        return {
          title: microcopy.onboarding.stepTitles.step1,
          subtitle: '',
        }
    }
  }

  const stepInfo = getStepInfo()

  return (
    <PageShell>
      <PageHeader
        title={stepInfo.title}
        subtitle={stepInfo.subtitle}
      />

      {/* Logged out notice */}
      {!isAuthenticated && (
        <Section>
          <div className="rounded-lg border border-border bg-surface-muted/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              You'll be asked to sign in to save and generate results.
            </p>
          </div>
        </Section>
      )}

      {/* Stepper indicator */}
      <Section>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {currentStep >= 1 ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span
              className={`text-sm font-semibold ${
                currentStep >= 1
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Step 1: Describe
            </span>
          </div>
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center gap-2">
            {currentStep >= 2 ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span
              className={`text-sm font-semibold ${
                currentStep >= 2
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Step 2: Add competitors
            </span>
          </div>
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center gap-2">
            {currentStep >= 3 ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span
              className={`text-sm font-semibold ${
                currentStep >= 3
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Step 3: Details
            </span>
          </div>
        </div>
      </Section>

      {currentStep === 1 ? (
        // Step 1 handles its own layout with side rail
        <Section>
          <WizardStep1Describe
            initialState={wizardState}
            onComplete={handleStep1Complete}
            isGuidedMode={isGuidedMode}
          />
        </Section>
      ) : currentStep === 2 ? (
        // Step 2 uses the original layout
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Section>
              <WizardStep2Confirm
                state={wizardState}
                onBack={handleStep2Back}
                onComplete={handleStep2Complete}
              />
            </Section>
          </div>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20 space-y-4">
              <SurfaceCard className="p-6 border border-border">
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
          </div>
        </div>
      ) : (
        // Step 3: Details
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Section>
              <WizardStep3Details
                state={wizardState}
                onBack={handleStep3Back}
                onComplete={handleStep3Complete}
                isAuthenticated={isAuthenticated}
              />
            </Section>
          </div>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20 space-y-4">
              <SurfaceCard className="p-6 border border-border">
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
          </div>
        </div>
      )}
    </PageShell>
  )
}

