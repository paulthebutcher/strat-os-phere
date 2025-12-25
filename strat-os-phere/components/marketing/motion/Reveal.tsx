/**
 * Reveal Component
 * 
 * Reveals children on first viewport entry with a subtle fade + translate animation.
 * Respects prefers-reduced-motion by rendering immediately without animation.
 * 
 * Usage:
 *   <Reveal delay={60} y={8}>
 *     <h2>Section Title</h2>
 *   </Reveal>
 */
"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { durations, easing, distances, opacity, prefersReducedMotion, transitions } from "@/lib/motion/tokens"

export interface RevealProps {
  children: ReactNode
  delay?: number // Delay in milliseconds before animation starts
  y?: number // TranslateY distance (defaults to distances.revealY)
  once?: boolean // Only animate once (default: true)
  as?: keyof JSX.IntrinsicElements // Element type (default: "div")
  className?: string
  threshold?: number // IntersectionObserver threshold (0-1, default: 0.1)
}

export function Reveal({
  children,
  delay = 0,
  y = distances.revealY,
  once = true,
  as: Component = "div",
  className,
  threshold = 0.1,
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useRef(false)

  useEffect(() => {
    // Check reduced motion preference
    reduceMotion.current = prefersReducedMotion()
    
    // If reduced motion, render immediately
    if (reduceMotion.current) {
      setIsVisible(true)
      return
    }

    // Set up IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once) {
              setHasAnimated(true)
            }
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      {
        threshold,
        rootMargin: "0px 0px -10% 0px", // Start animation slightly before element enters viewport
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [once, threshold])

  // Apply animation state
  const shouldAnimate = reduceMotion.current ? false : (isVisible || hasAnimated)
  const transitionDelay = reduceMotion.current ? "0ms" : `${delay}ms`

  return (
    <Component
      ref={ref as any}
      className={cn(className)}
      style={{
        opacity: shouldAnimate ? opacity.final : opacity.initial,
        transform: shouldAnimate ? "translateY(0)" : `translateY(${y}px)`,
        transition: reduceMotion.current
          ? "none"
          : `opacity ${durations.base}ms ${easing.enter} ${transitionDelay}, transform ${durations.base}ms ${easing.enter} ${transitionDelay}`,
        willChange: shouldAnimate ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Component>
  )
}

