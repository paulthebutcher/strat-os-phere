/**
 * Signal Motifs - Branded micro-illustration textures
 * 
 * Lightweight SVG background motifs used sparingly for premium feel:
 * - Receipt perforation line
 * - Dot grid pattern
 * - Contour/signal lines
 * 
 * Keep opacity low and use as section headers, empty states, subtle backgrounds.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

interface SignalMotifProps {
  className?: string
  opacity?: number
}

/**
 * Receipt Perforation - Horizontal dashed line pattern
 * Use for section separators or subtle dividers
 */
export function ReceiptPerforation({ 
  className, 
  opacity = 0.08 
}: SignalMotifProps) {
  return (
    <svg
      className={cn("w-full h-6", className)}
      viewBox="0 0 200 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 3h200"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity={opacity}
      />
    </svg>
  )
}

/**
 * Dot Grid - Subtle dot pattern
 * Use for empty state backgrounds or section headers
 */
export function DotGrid({ 
  className, 
  opacity = 0.06 
}: SignalMotifProps) {
  return (
    <svg
      className={cn("w-full h-full", className)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="30" cy="10" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="50" cy="10" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="70" cy="10" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="90" cy="10" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="10" cy="30" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="30" cy="30" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="50" cy="30" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="70" cy="30" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="90" cy="30" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="10" cy="50" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="30" cy="50" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="50" cy="50" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="70" cy="50" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="90" cy="50" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="10" cy="70" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="30" cy="70" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="50" cy="70" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="70" cy="70" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="90" cy="70" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="10" cy="90" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="30" cy="90" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="50" cy="90" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="70" cy="90" r="1" fill="currentColor" opacity={opacity} />
      <circle cx="90" cy="90" r="1" fill="currentColor" opacity={opacity} />
    </svg>
  )
}

/**
 * Contour Lines - Abstract signal/contour pattern
 * Use for page headers or section backgrounds
 */
export function ContourLines({ 
  className, 
  opacity = 0.05 
}: SignalMotifProps) {
  return (
    <svg
      className={cn("w-full h-full", className)}
      viewBox="0 0 200 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 50 Q50 30, 100 50 T200 50"
        stroke="currentColor"
        strokeWidth="1"
        opacity={opacity}
      />
      <path
        d="M0 60 Q50 40, 100 60 T200 60"
        stroke="currentColor"
        strokeWidth="1"
        opacity={opacity}
      />
      <path
        d="M0 40 Q50 20, 100 40 T200 40"
        stroke="currentColor"
        strokeWidth="1"
        opacity={opacity}
      />
    </svg>
  )
}

