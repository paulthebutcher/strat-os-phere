'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, CheckCircle2, Circle } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { HeroPanel } from '@/components/shared/HeroPanel'
import type { TryDraft } from '@/lib/tryDraft'
import { loadTryDraft, saveTryDraft, savePostAuthIntent } from '@/lib/tryDraft'
import { TryStep1Describe } from './TryStep1Describe'
import { TryStep2Confirm } from './TryStep2Confirm'

export default function TryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [draft, setDraft] = useState<TryDraft>({
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
    <div className="min-h-[calc(100vh-57px)] bg-background">
      <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 animate-fade-in">
        {/* Hero Panel - Only show on step 1 */}
        {currentStep === 1 && (
          <div className="mb-8">
            <HeroPanel
              title="Try Plinth"
              subtitle="Start a competitive analysis in seconds. No sign-up required—we'll ask for your email when you're ready to see results."
              icon={<Sparkles className="h-8 w-8 text-white/90" />}
              gradient={true}
            >
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-sm">
                <li className="flex items-start gap-2 text-white/90">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>No sign-up required</span>
                </li>
                <li className="flex items-start gap-2 text-white/90">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>Quick setup</span>
                </li>
                <li className="flex items-start gap-2 text-white/90">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>See results in minutes</span>
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

          {/* Right column: Preview */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20">
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
      </main>
    </div>
  )
}

