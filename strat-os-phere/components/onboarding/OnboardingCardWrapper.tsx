'use client'

import { OnboardingCard } from './OnboardingCard'
import { isFirstWinUser } from '@/lib/onboarding/isFirstWinUser'
import type { Project } from '@/lib/supabase/types'

interface OnboardingCardWrapperProps {
  projects: Project[]
}

/**
 * Client wrapper that checks if user is a first win user and renders the onboarding card.
 */
export function OnboardingCardWrapper({ projects }: OnboardingCardWrapperProps) {
  const isNewUser = isFirstWinUser(projects)

  if (!isNewUser) {
    return null
  }

  return <OnboardingCard />
}

