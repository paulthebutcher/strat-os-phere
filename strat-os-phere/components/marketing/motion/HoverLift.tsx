/**
 * HoverLift Utility
 * 
 * CSS utility class for subtle card/button hover effects:
 * - Subtle lift (translateY)
 * - Subtle shadow increase
 * - No scale "pop" beyond 1.01 if used at all
 * 
 * Usage:
 *   className={cn("card", HoverLift.className)}
 * 
 * Or use the hook to get the className string directly.
 */
"use client"

import { cn } from "@/lib/utils"
import { durations, easing, distances } from "@/lib/motion/tokens"

/**
 * HoverLift utility class names
 */
export const HoverLift = {
  /**
   * Base hover lift class for cards/buttons
   */
  className: cn(
    "transition-all",
    "duration-[var(--hover-lift-duration)]",
    "ease-[var(--hover-lift-easing)]",
    "hover:-translate-y-[var(--hover-lift-distance)]",
    "hover:shadow-lg",
    "[--hover-lift-duration:200ms]",
    "[--hover-lift-easing:cubic-bezier(0.4,0,0.2,1)]",
    "[--hover-lift-distance:2px]"
  ),

  /**
   * Stronger hover lift variant
   */
  strong: cn(
    "transition-all",
    "duration-[var(--hover-lift-duration)]",
    "ease-[var(--hover-lift-easing)]",
    "hover:-translate-y-[var(--hover-lift-distance)]",
    "hover:shadow-xl",
    "[--hover-lift-duration:200ms]",
    "[--hover-lift-easing:cubic-bezier(0.4,0,0.2,1)]",
    "[--hover-lift-distance:4px]"
  ),

  /**
   * Subtle hover lift variant (minimal)
   */
  subtle: cn(
    "transition-all",
    "duration-[var(--hover-lift-duration)]",
    "ease-[var(--hover-lift-easing)]",
    "hover:-translate-y-[var(--hover-lift-distance)]",
    "hover:shadow-md",
    "[--hover-lift-duration:150ms]",
    "[--hover-lift-easing:cubic-bezier(0.4,0,0.2,1)]",
    "[--hover-lift-distance:1px]"
  ),
} as const

/**
 * Hook to get hover lift class with custom options
 */
export function useHoverLift(options?: {
  distance?: number
  shadow?: "sm" | "md" | "lg" | "xl"
  duration?: number
}) {
  const distance = options?.distance ?? distances.liftSm
  const shadow = options?.shadow ?? "lg"
  const duration = options?.duration ?? durations.base

  return cn(
    "transition-all",
    `duration-[${duration}ms]`,
    `ease-[${easing.standard}]`,
    `hover:-translate-y-[${distance}px]`,
    `hover:shadow-${shadow}`
  )
}

