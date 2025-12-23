'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Sparkles } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { HeroPanel } from '@/components/shared/HeroPanel'
import type { WizardState } from '@/lib/onboarding/types'
import { WizardStep1Describe } from './WizardStep1Describe'
import { WizardStep2Confirm } from './WizardStep2Confirm'
import { FirstWinChecklist } from './FirstWinChecklist'

interface AnalysisWizardProps {
  onComplete?: (state: WizardState) => void
  isGuidedMode?: boolean
}

export function AnalysisWizard({ onComplete, isGuidedMode = false }: AnalysisWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [wizardState, setWizardState] = useState<WizardState>({
    primaryCompanyName: '',
    contextText: undefined,
    resolvedSources: [],
    suggestedCompetitors: [],
    selectedCompetitors: [],
    evidenceWindowDays: 90,
  })

  const handleStep1Complete = (state: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...state }))
    setCurrentStep(2)
  }

  const handleStep2Back = () => {
    setCurrentStep(1)
  }

  const handleStep2Complete = (state: Partial<WizardState>) => {
    const finalState = { ...wizardState, ...state }
    if (onComplete) {
      onComplete(finalState)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 animate-fade-in">
      {/* Hero Panel - Only show on step 1 */}
      {currentStep === 1 && (
        <div className="mb-8">
          <HeroPanel
            title="Create a new analysis"
            subtitle="Tell us what to analyze and we'll discover sources, recommend competitors, and generate strategic opportunities."
            icon={<Sparkles className="h-8 w-8 text-white/90" />}
            gradient={true}
          >
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-sm">
              <li className="flex items-start gap-2 text-white/90">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Automated source discovery</span>
              </li>
              <li className="flex items-start gap-2 text-white/90">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Competitor recommendations</span>
              </li>
              <li className="flex items-start gap-2 text-white/90">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Ranked opportunities</span>
              </li>
            </ul>
          </HeroPanel>
        </div>
      )}

      {/* Stepper Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
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
              Step 1: Describe your situation
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
        </div>
      </div>

      {currentStep === 1 ? (
        // Step 1 handles its own layout with side rail
        <WizardStep1Describe
          initialState={wizardState}
          onComplete={handleStep1Complete}
          isGuidedMode={isGuidedMode}
        />
      ) : (
        // Step 2 uses the original layout
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <WizardStep2Confirm
              state={wizardState}
              onBack={handleStep2Back}
              onComplete={handleStep2Complete}
            />
          </div>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20 space-y-4">
              <SurfaceCard className="p-6 shadow-md">
                <h3 className="text-base font-semibold text-foreground mb-4">
                  What you'll get
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Ranked opportunities with scores</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Evidence & confidence metrics</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Citations and source links</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Only public pages are used. Don't paste confidential
                    information.
                  </p>
                </div>
              </SurfaceCard>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

