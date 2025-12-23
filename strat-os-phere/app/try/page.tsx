'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Circle } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TryDraft } from '@/lib/tryDraft'
import { loadTryDraft, saveTryDraft, savePostAuthIntent } from '@/lib/tryDraft'
import { TryStep1Describe } from './TryStep1Describe'
import { TryStep2Confirm } from './TryStep2Confirm'
import { AnalysisFramingCard } from '@/components/onboarding/AnalysisFramingCard'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'

export default function TryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [draft, setDraft] = useState<TryDraft>({
    mode: 'company',
    primaryCompanyName: '',
    contextText: undefined,
    marketCategory: undefined,
    targetCustomer: undefined,
    product: undefined,
    selectedCompetitors: [],
    createdAt: Date.now(),
  })

  // Load draft from localStorage or query params on mount
  useEffect(() => {
    const savedDraft = loadTryDraft()
    if (savedDraft) {
      setDraft(savedDraft)
      // If we have a saved draft with company name, go to step 2
      if (savedDraft.primaryCompanyName) {
        setCurrentStep(2)
      }
    } else {
      // Check for query params
      const company = searchParams.get('company')
      const context = searchParams.get('context')
      if (company) {
        const newDraft: TryDraft = {
          mode: 'company',
          primaryCompanyName: company,
          contextText: context || undefined,
          selectedCompetitors: [],
          createdAt: Date.now(),
        }
        setDraft(newDraft)
        saveTryDraft(newDraft)
      }
    }
  }, [searchParams])

  // Auto-save draft when it changes
  useEffect(() => {
    if (draft.primaryCompanyName) {
      saveTryDraft(draft)
    }
  }, [draft])

  const handleStep1Complete = (updates: Partial<TryDraft>) => {
    const updated = { ...draft, ...updates }
    setDraft(updated)
    saveTryDraft(updated)
    setCurrentStep(2)
  }

  const handleStep2Back = () => {
    setCurrentStep(1)
  }

  const handleSeeResults = () => {
    // Save intent and redirect to login
    savePostAuthIntent({
      kind: 'RUN_TRY_FLOW',
      createdAt: Date.now(),
      draftVersion: 1,
    })
    saveTryDraft(draft)
    router.push('/login?next=/try/continue')
  }

  return (
    <PageShell size="wide" className="bg-background">
      {/* Compact contextual header - Only show on step 1 */}
      {currentStep === 1 && (
        <PageHeader
          title="Start an analysis"
          subtitle="Tell us what you're evaluating. We'll turn public signals into ranked opportunities (you can start with lightweight context)."
        />
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
              Step 2: Confirm
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Main content */}
        <div className="lg:col-span-8">
          {currentStep === 1 && (
            <TryStep1Describe
              initialState={draft}
              onComplete={handleStep1Complete}
            />
          )}
          {currentStep === 2 && (
            <TryStep2Confirm
              draft={draft}
              onBack={handleStep2Back}
              onSeeResults={handleSeeResults}
              onUpdateDraft={(updates) => {
                const updated = { ...draft, ...updates }
                setDraft(updated)
                saveTryDraft(updated)
              }}
            />
          )}
        </div>

        {/* Right column: Preview - Combined cards */}
        {currentStep === 1 && (
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20 space-y-6">
              <SurfaceCard className="p-6 shadow-md">
                <h3 className="text-base font-semibold text-foreground mb-4">
                  What you'll get
                </h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground mb-4">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Ranked opportunities</span>
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
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You can add details later.
                  </p>
                </div>
              </SurfaceCard>
              <AnalysisFramingCard
                companyName={draft.primaryCompanyName || ''}
                decision={draft.contextText || ''}
                market={draft.marketCategory || draft.targetCustomer || ''}
              />
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}

