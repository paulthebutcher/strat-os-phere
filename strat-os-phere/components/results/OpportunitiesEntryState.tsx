'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

interface OpportunitiesEntryStateProps {
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
}

/**
 * Client component that handles entry state after analysis generation
 * - Auto-scrolls to Decision Brief section
 * - Highlights the top opportunity
 * - Shows subtle success affordance
 */
export function OpportunitiesEntryState({
  opportunitiesV3,
  opportunitiesV2,
}: OpportunitiesEntryStateProps) {
  const router = useRouter()
  const hasScrolledRef = useRef(false)

  useEffect(() => {
    // Only run once
    if (hasScrolledRef.current) return

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      // Scroll to Decision Brief section
      const decisionBriefSection = document.getElementById('decision-brief')
      if (decisionBriefSection) {
        decisionBriefSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        hasScrolledRef.current = true
      }

      // Highlight top opportunity in Decision Brief
      // The Decision Brief component renders the top opportunity, so we'll add a subtle highlight
      // by finding the "Recommended move" panel and adding a highlight class
      setTimeout(() => {
        const recommendedMovePanel = document.querySelector('[data-recommended-move]')
        if (recommendedMovePanel) {
          recommendedMovePanel.classList.add('animate-pulse-once')
          // Remove the class after animation completes
          setTimeout(() => {
            recommendedMovePanel.classList.remove('animate-pulse-once')
          }, 2000)
        }
      }, 500)
    }, 100)

    // Clean up query param after handling
    // Use window.location to avoid useSearchParams() which requires Suspense
    const urlParams = new URLSearchParams(window.location.search)
    const justGenerated = urlParams.get('justGenerated')
    if (justGenerated === 'true') {
      // Remove the query param from URL without reload
      urlParams.delete('justGenerated')
      const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
      router.replace(newUrl, { scroll: false })
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [router])

  // This component doesn't render anything visible
  // It just handles side effects
  return null
}

