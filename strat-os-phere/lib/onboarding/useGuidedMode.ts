'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getOnboardingState, setOnboardingState } from './storage'

/**
 * Hook to detect if we're in guided mode.
 * Checks query param first, then localStorage persistence.
 * Note: This hook must be used within a Suspense boundary when using useSearchParams.
 */
export function useGuidedMode(): boolean {
  const searchParams = useSearchParams()
  const [isGuided, setIsGuided] = useState(() => {
    // Initialize from localStorage on client
    if (typeof window !== 'undefined') {
      const state = getOnboardingState()
      return state.isGuidedMode === true
    }
    return false
  })

  useEffect(() => {
    // Check query param first
    const onboardingParam = searchParams.get('onboarding')
    if (onboardingParam === '1') {
      setIsGuided(true)
      setOnboardingState({ isGuidedMode: true })
      return
    }

    // Fall back to localStorage
    const state = getOnboardingState()
    setIsGuided(state.isGuidedMode === true)
  }, [searchParams])

  return isGuided
}

