'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { WizardState } from '@/lib/onboarding/types'
import { AnalysisWizard } from '@/components/onboarding/AnalysisWizard'
import { loadWizardDraft, saveWizardDraft } from '@/lib/onboarding/wizardDraft'

interface NewAnalysisPageClientProps {
  isGuidedMode: boolean
  isAuthenticated: boolean
  example?: string
}

export function NewAnalysisPageClient({ 
  isGuidedMode, 
  isAuthenticated,
  example,
}: NewAnalysisPageClientProps) {
  const router = useRouter()
  const [wizardState, setWizardState] = useState<WizardState | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = loadWizardDraft()
    if (savedDraft) {
      setWizardState(savedDraft)
    }
    setIsHydrated(true)
  }, [])

  const handleWizardComplete = (state: WizardState) => {
    // Save final state
    saveWizardDraft(state)
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent('/new')}`)
      return
    }

    // If authenticated, the wizard should have already created the project
    // and navigated to the competitors page
  }

  const handleWizardStateChange = (updates: Partial<WizardState>) => {
    // Auto-save draft when state changes
    setWizardState((prev) => {
      if (!prev) {
        // If no previous state, create initial state with updates
        const newState: WizardState = {
          primaryCompanyName: updates.primaryCompanyName || '',
          contextText: updates.contextText,
          resolvedSources: updates.resolvedSources || [],
          suggestedCompetitors: updates.suggestedCompetitors || [],
          selectedCompetitors: updates.selectedCompetitors || [],
          evidenceWindowDays: updates.evidenceWindowDays || 90,
          ...updates,
        }
        saveWizardDraft(newState)
        return newState
      }
      const updated = { ...prev, ...updates }
      saveWizardDraft(updated)
      return updated
    })
  }

  // Don't render until we've checked localStorage
  if (!isHydrated) {
    return null
  }

  // Pre-fill example data if example parameter is provided and no saved draft exists
  const initialState = wizardState || (example ? getExampleState(example) : undefined)

  return (
    <AnalysisWizard 
      isGuidedMode={isGuidedMode}
      isAuthenticated={isAuthenticated}
      initialState={initialState}
      onComplete={handleWizardComplete}
      onStateChange={handleWizardStateChange}
    />
  )
}

/**
 * Get example wizard state based on example parameter
 */
function getExampleState(example: string): WizardState | undefined {
  // Default example (same as "Try example" button)
  if (example === 'midmarket-itops' || !example) {
    return {
      primaryCompanyName: 'PagerDuty',
      decisionFraming: {
        decision: 'Where should we differentiate to win mid-market IT ops?',
      },
      marketCategory: 'Incident management & on-call',
      contextText: "Assume we're a small team; looking for wedge features.",
      resolvedSources: [],
      suggestedCompetitors: [],
      selectedCompetitors: [],
      evidenceWindowDays: 90,
    }
  }
  
  // Add more examples as needed
  return undefined
}

