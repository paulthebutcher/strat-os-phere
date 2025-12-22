import { useEffect, useState, useRef } from 'react'

export type RevealSection = 'top' | 'list' | 'sources'

interface UseProgressiveRevealOptions {
  /**
   * Delay in milliseconds between each section (default: 200ms)
   */
  delayMs?: number
  /**
   * Whether to enable progressive reveal (useful for disabling on subsequent renders)
   */
  enabled?: boolean
  /**
   * Session storage key to prevent re-animating (default: 'results-progressive-reveal')
   */
  storageKey?: string
}

interface UseProgressiveRevealReturn {
  /**
   * Map of section IDs to visibility state
   */
  visibleSections: Record<RevealSection, boolean>
  /**
   * Manually start the reveal
   */
  startReveal: () => void
  /**
   * Reset reveal state
   */
  resetReveal: () => void
}

/**
 * Hook for progressive reveal of results sections
 * Respects prefers-reduced-motion: if enabled, shows all sections immediately
 */
export function useProgressiveReveal(
  options: UseProgressiveRevealOptions = {}
): UseProgressiveRevealReturn {
  const {
    delayMs = 200,
    enabled = true,
    storageKey = 'results-progressive-reveal',
  } = options

  const [visibleSections, setVisibleSections] = useState<
    Record<RevealSection, boolean>
  >({
    top: false,
    list: false,
    sources: false,
  })

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Check if we've already shown the animation
  useEffect(() => {
    if (!enabled) {
      setVisibleSections({
        top: true,
        list: true,
        sources: true,
      })
      return
    }

    try {
      const hasShown = sessionStorage.getItem(storageKey)
      if (hasShown) {
        // Already shown in this session, show all immediately
        setVisibleSections({
          top: true,
          list: true,
          sources: true,
        })
        return
      }
    } catch {
      // sessionStorage not available, continue with animation
    }

    // Start reveal automatically
    startReveal()
  }, [enabled, storageKey])

  const startReveal = () => {
    // Clear any existing timers
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current = []

    if (prefersReducedMotion || !enabled) {
      // Show all sections immediately if reduced motion is preferred
      setVisibleSections({
        top: true,
        list: true,
        sources: true,
      })
      // Mark as shown
      try {
        sessionStorage.setItem(storageKey, 'true')
      } catch {
        // Ignore
      }
      return
    }

    // Progressive reveal with delays
    const sections: RevealSection[] = ['top', 'list', 'sources']
    sections.forEach((section, index) => {
      const timer = setTimeout(() => {
        setVisibleSections((prev) => ({
          ...prev,
          [section]: true,
        }))

        // Mark as shown after last section
        if (index === sections.length - 1) {
          try {
            sessionStorage.setItem(storageKey, 'true')
          } catch {
            // Ignore
          }
        }
      }, index * delayMs)

      timersRef.current.push(timer)
    })
  }

  const resetReveal = () => {
    // Clear timers
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current = []

    // Reset visibility
    setVisibleSections({
      top: false,
      list: false,
      sources: false,
    })

    // Clear storage
    try {
      sessionStorage.removeItem(storageKey)
    } catch {
      // Ignore
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  return {
    visibleSections,
    startReveal,
    resetReveal,
  }
}

