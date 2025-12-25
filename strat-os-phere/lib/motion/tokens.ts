/**
 * Motion Tokens
 * 
 * Single source of truth for animation timing, easing, and distances.
 * All animations should reference these tokens for consistency.
 * 
 * Philosophy: Restrained, premium, "quietly magical" through clarity and polish.
 */

/**
 * Duration tokens (in milliseconds)
 * - Fast: Quick transitions, hover states
 * - Base: Standard animations, most common
 * - Slow: Deliberate, intentional animations
 */
export const durations = {
  fast: 150, // 140-180ms range
  base: 200, // 180-220ms range
  slow: 300, // 250-350ms range
} as const

/**
 * Easing functions (cubic-bezier)
 * - Standard: General purpose, balanced
 * - Enter: Elements appearing (slight ease-out)
 * - Exit: Elements leaving (slight ease-in)
 */
export const easing = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)", // Material Design standard
  enter: "cubic-bezier(0, 0, 0.2, 1)", // Ease-out for appearing
  exit: "cubic-bezier(0.4, 0, 1, 1)", // Ease-in for leaving
} as const

/**
 * Translation distances (in pixels)
 * - Subtle movements that feel natural
 * - Never more than 12px to avoid feeling bouncy
 */
export const distances = {
  liftSm: 6, // Small lift for cards/buttons
  liftMd: 12, // Medium lift for more pronounced effect
  revealY: 8, // Default reveal translateY (slightly down)
} as const

/**
 * Opacity defaults
 */
export const opacity = {
  initial: 0.6, // Slightly transparent when hidden
  final: 1, // Full opacity when revealed
} as const

/**
 * Stagger timing (in milliseconds)
 * - Delay between items in a staggered list
 */
export const stagger = {
  base: 60, // 60-90ms range, base stagger
  fast: 40, // Faster stagger for shorter lists
  slow: 80, // Slower stagger for longer lists
} as const

/**
 * CSS transition strings for direct use
 */
export const transitions = {
  fast: `${durations.fast}ms ${easing.standard}`,
  base: `${durations.base}ms ${easing.enter}`,
  slow: `${durations.slow}ms ${easing.enter}`,
  exit: `${durations.fast}ms ${easing.exit}`,
} as const

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

