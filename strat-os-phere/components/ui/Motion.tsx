"use client"

import * as React from "react"
import { motion, type MotionProps, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Motion wrapper that respects prefers-reduced-motion
 * 
 * Automatically disables animations when user prefers reduced motion.
 * Provides common animation presets for consistent, subtle motion.
 */

// Helper to check for reduced motion preference (must be called at runtime)
function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mediaQuery.matches)
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches)
      }
      
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])
  
  return prefersReducedMotion
}

// Common animation variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

// Stagger container for list items
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export interface MotionDivProps extends MotionProps {
  children: React.ReactNode
  className?: string
  variant?: "fadeInUp" | "fadeIn" | "slideInFromBottom" | "scaleIn"
  delay?: number
  duration?: number
}

/**
 * MotionDiv - Animated div with sensible defaults
 * 
 * Usage:
 *   <MotionDiv variant="fadeInUp" delay={0.1}>
 *     <YourContent />
 *   </MotionDiv>
 */
export function MotionDiv({
  children,
  className,
  variant = "fadeInUp",
  delay = 0,
  duration = 0.3,
  ...props
}: MotionDivProps) {
  const prefersReducedMotion = useReducedMotion()
  const variants = {
    fadeInUp,
    fadeIn,
    slideInFromBottom,
    scaleIn,
  }[variant]

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Custom easing for professional feel
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * MotionSection - For section reveals
 */
export function MotionSection({
  children,
  className,
  ...props
}: Omit<MotionDivProps, "variant">) {
  return (
    <MotionDiv variant="fadeInUp" delay={0.1} className={className} {...props}>
      {children}
    </MotionDiv>
  )
}

/**
 * MotionList - For list item entrances with stagger
 */
export function MotionList({
  children,
  className,
  ...props
}: Omit<MotionDivProps, "variant">) {
  const prefersReducedMotion = useReducedMotion()
  
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * MotionListItem - Individual list item animation
 */
export function MotionListItem({
  children,
  className,
  ...props
}: Omit<MotionDivProps, "variant">) {
  return (
    <MotionDiv variant="fadeInUp" delay={0} duration={0.2} className={className} {...props}>
      {children}
    </MotionDiv>
  )
}

