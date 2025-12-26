'use client'

import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/components/ui/Motion'

/**
 * Editorial motion - slow, intentional transitions that reinforce clarity and confidence.
 * 
 * Usage:
 * - Readout cards fade in with slight vertical settle (6-8px)
 * - Evidence sections reveal line-by-line, not all at once
 * - No bouncing, no springy easing
 * 
 * Timing: 200-300ms durations
 * Apply only to marketing homepage readout preview and section reveals on scroll.
 * Never animate nav, buttons, or inputs.
 */

const editorialRevealVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Line-by-line reveal
    },
  },
}

interface EditorialRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/**
 * EditorialReveal - For readout cards and key content sections
 */
export function EditorialReveal({
  children,
  className,
  delay = 0,
}: EditorialRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={editorialRevealVariants}
      transition={{
        delay,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

interface LineByLineRevealProps {
  children: React.ReactNode
  className?: string
}

/**
 * LineByLineReveal - For evidence sections that reveal sequentially
 */
export function LineByLineReveal({
  children,
  className,
}: LineByLineRevealProps) {
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
    >
      {children}
    </motion.div>
  )
}

/**
 * EditorialRevealItem - Individual item for line-by-line reveals
 */
export function EditorialRevealItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={editorialRevealVariants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

