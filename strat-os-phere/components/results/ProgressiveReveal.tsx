'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ProgressiveRevealProps {
  /**
   * Order in which this section should appear (0 = first, 1 = second, etc.)
   */
  order: number
  /**
   * Delay in milliseconds between each section reveal (default: 200ms)
   */
  delayMs?: number
  /**
   * Whether to enable the progressive reveal (useful for disabling on subsequent renders)
   */
  enabled?: boolean
  children: React.ReactNode
  className?: string
}

/**
 * Component that progressively reveals children with a simple fade/slide animation.
 * Sections appear in order with a slight delay between each.
 * Uses sessionStorage to prevent re-animating on tab switches within the same session.
 */
export function ProgressiveReveal({
  order,
  delayMs = 200,
  enabled = true,
  children,
  className,
}: ProgressiveRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const hasAnimatedRef = useRef(false)
  const storageKey = 'progressive-reveal-shown'

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true)
      return
    }

    // Check if we've already shown the animation in this session
    // Only animate on first load of results
    try {
      const hasShown = sessionStorage.getItem(storageKey)
      if (hasShown) {
        setIsVisible(true)
        return
      }
    } catch {
      // sessionStorage not available (SSR), continue with animation
    }

    // Calculate when this section should appear
    const delay = order * delayMs
    const timer = setTimeout(() => {
      setIsVisible(true)
      hasAnimatedRef.current = true
      
      // Mark that we've shown the animation after all sections have appeared
      // Assuming max order is 2 (Jobs=0, Scorecard=1, Opportunities=2)
      // Set the key after the last section's animation completes
      if (order === 2) {
        const animationDuration = 500 // matches CSS transition duration
        setTimeout(() => {
          try {
            sessionStorage.setItem(storageKey, 'true')
          } catch {
            // Ignore sessionStorage errors
          }
        }, animationDuration)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [order, delayMs, enabled, storageKey])

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  )
}

