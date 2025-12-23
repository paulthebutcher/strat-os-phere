'use client'

import Link from 'next/link'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { setOnboardingState, getOnboardingState } from '@/lib/onboarding/storage'
import { useState } from 'react'

interface OnboardingCardProps {
  onDismiss?: () => void
}

/**
 * Onboarding card shown on the Projects page for new users.
 * Provides clear CTAs to start their first analysis.
 */
export function OnboardingCard({ onDismiss }: OnboardingCardProps) {
  const [dismissed, setDismissed] = useState(() => {
    const state = getOnboardingState()
    return state.dismissedProjectCoachCard === true
  })

  const handleDismiss = () => {
    setDismissed(true)
    setOnboardingState({ dismissedProjectCoachCard: true })
    onDismiss?.()
  }

  if (dismissed) {
    return null
  }

  return (
    <SurfaceCard className="p-6 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/30 dark:to-blue-950/30 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="space-y-4 pr-8">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Start your first analysis
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We'll guide you through creating your first competitive analysis. If you're not
              sure about the details, start with your best guess — we'll help tighten it up.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Link href="/projects/new?onboarding=1">
            <Button size="lg" variant="brand" className="flex-1">
              Start guided analysis
            </Button>
          </Link>
          <Link href="/samples">
            <Button size="lg" variant="outline">
              Try an example
            </Button>
          </Link>
        </div>
      </div>
    </SurfaceCard>
  )
}

