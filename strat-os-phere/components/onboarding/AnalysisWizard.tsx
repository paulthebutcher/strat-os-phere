'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import type { WizardState } from '@/lib/onboarding/types'
import { WizardStep1Describe } from './WizardStep1Describe'
import { WizardStep2Confirm } from './WizardStep2Confirm'

interface AnalysisWizardProps {
  onComplete?: (state: WizardState) => void
}

export function AnalysisWizard({ onComplete }: AnalysisWizardProps) {
  const router = useRouter()
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
    <div className="w-full max-w-6xl mx-auto px-6">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            {currentStep >= 1 ? (
              <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
              <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
              Step 2: Confirm
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Main content */}
        <div className="lg:col-span-8">
          {currentStep === 1 && (
            <WizardStep1Describe
              initialState={wizardState}
              onComplete={handleStep1Complete}
            />
          )}
          {currentStep === 2 && (
            <WizardStep2Confirm
              state={wizardState}
              onBack={handleStep2Back}
              onComplete={handleStep2Complete}
            />
          )}
        </div>

        {/* Right column: Preview / Quality meter */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-20">
            <SurfaceCard className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                What you'll get
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                    •
                  </span>
                  <span>Ranked opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                    •
                  </span>
                  <span>Evidence & confidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                    •
                  </span>
                  <span>Citations included</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Only public pages are used. Don't paste confidential
                  information.
                </p>
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </div>
  )
}

