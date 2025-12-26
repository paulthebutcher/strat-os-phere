'use client'

import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

export type PlinthIconName =
  | 'evidence'
  | 'confidence'
  | 'coverage'
  | 'assumptions'
  | 'gaps'
  | 'directional'
  | 'solid'
  | 'score'
  | 'bounds'
  | 'marker'
  | 'analytical'
  | 'readout'

interface PlinthIconProps extends Omit<ComponentProps<'svg'>, 'viewBox'> {
  name: PlinthIconName
  size?: number | string
  className?: string
}

/**
 * PlinthIcon - Custom micro-icon system for Plinth primitives
 * 
 * Thin, geometric, editorial icons that create brand-specific visual vocabulary.
 * Used in readout headers, score blocks, evidence labels.
 * 
 * Keep Lucide for generic UI (nav, buttons).
 */
export function PlinthIcon({
  name,
  size = 16,
  className,
  ...props
}: PlinthIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={cn('inline-block shrink-0', className)}
      fill="none"
      {...props}
    >
      <use href={`/icons/plinth/${name}.svg#root`} />
    </svg>
  )
}

/**
 * Direct SVG component for better performance and tree-shaking
 * Note: Using inline SVG approach instead of <use> for better compatibility
 */
export function PlinthIconDirect({
  name,
  size = 16,
  className,
  ...props
}: PlinthIconProps) {
  // Import SVG content directly
  const iconContent = {
    evidence: (
      <>
        <path d="M3 2h10v12H3V2z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 5h6M5 8h4M5 11h6" stroke="currentColor" strokeWidth="1" fill="none"/>
        <path d="M2 2v12M14 2v12" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      </>
    ),
    confidence: (
      <>
        <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 3h12M2 13h12" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      </>
    ),
    coverage: (
      <>
        <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M4 2v12M8 2v12M12 2v12" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </>
    ),
    assumptions: (
      <>
        <path d="M3 4c0-1 1-2 2-2s2 1 2 2c0 1-1 2-1 2v2M8 12h.01" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 2v12M14 2v12" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      </>
    ),
    gaps: (
      <>
        <path d="M2 8h4M10 8h4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </>
    ),
    directional: (
      <>
        <path d="M3 8h10M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="3" cy="8" r="1" fill="currentColor"/>
      </>
    ),
    solid: (
      <rect x="4" y="4" width="8" height="8" fill="currentColor" rx="1"/>
    ),
    score: (
      <>
        <path d="M3 12v-4M6 12V7M9 12V5M12 12V8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M2 13h12" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </>
    ),
    bounds: (
      <>
        <path d="M4 3v10M12 3v10M3 3h2M3 13h2M11 3h2M11 13h2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
    marker: (
      <>
        <path d="M8 3v10M8 3l3 3-3 3M8 3L5 6l3 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
      </>
    ),
    analytical: (
      <>
        <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M4 4l8 8M4 12l8-8" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      </>
    ),
    readout: (
      <>
        <path d="M3 2h10v12H3V2z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1" fill="none"/>
        <path d="M12 5l2 2-2 2" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
  }[name]

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={cn('inline-block shrink-0', className)}
      fill="none"
      {...props}
    >
      {iconContent}
    </svg>
  )
}

