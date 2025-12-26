'use client'

import { cn } from '@/lib/utils'

interface MicroSparkProps {
  /** Value from 0-100 */
  value: number
  /** Optional max value (default 100) */
  max?: number
  /** Optional className */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * MicroSpark - Tiny bar/spark indicator used in lists
 * 
 * Minimal horizontal bar indicator for quick scanning of quantitative values.
 * Includes Plinth tick marker.
 */
export function MicroSpark({
  value,
  max = 100,
  className,
  size = 'md',
}: MicroSparkProps) {
  const clampedValue = Math.max(0, Math.min(max, value))
  const percentage = (clampedValue / max) * 100
  
  const heightClasses = {
    sm: 'h-0.5',
    md: 'h-1',
    lg: 'h-1.5',
  }
  
  // Color based on value
  let barColor = 'bg-muted' // Default
  if (percentage >= 80) {
    barColor = 'bg-success'
  } else if (percentage >= 50) {
    barColor = 'bg-info'
  } else if (percentage > 0) {
    barColor = 'bg-warning'
  }
  
  return (
    <div className={cn('relative w-full', heightClasses[size], className)}>
      <div className="absolute inset-0 bg-muted rounded-full" />
      <div
        className={cn('absolute left-0 top-0 rounded-full transition-all duration-200 ease-out', barColor, heightClasses[size])}
        style={{ width: `${percentage}%` }}
      />
      {/* Plinth tick at end of bar */}
      {percentage > 0 && (
        <div
          className="absolute top-0 bottom-0 w-px bg-foreground/30 rounded-full"
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        />
      )}
    </div>
  )
}

