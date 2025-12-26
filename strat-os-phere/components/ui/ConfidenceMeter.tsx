'use client'

import { cn } from '@/lib/utils'

interface ConfidenceMeterProps {
  /** Confidence value from 0-100 */
  value: number
  /** Optional label */
  label?: string
  /** Optional className */
  className?: string
  /** Show threshold markers */
  showThresholds?: boolean
}

/**
 * ConfidenceMeter - Branded thin bar with 3 regions + marker
 * 
 * Displays confidence as a horizontal bar with three regions:
 * - Low (0-60): Amber
 * - Medium (60-80): Blue
 * - High (80-100): Green
 * 
 * Includes Plinth tick marker at the value position.
 */
export function ConfidenceMeter({
  value,
  label,
  className,
  showThresholds = false,
}: ConfidenceMeterProps) {
  const clampedValue = Math.max(0, Math.min(100, value))
  
  // Determine region color
  let regionColor = 'bg-warning' // Low (0-60)
  if (clampedValue >= 80) {
    regionColor = 'bg-success' // High (80-100)
  } else if (clampedValue >= 60) {
    regionColor = 'bg-info' // Medium (60-80)
  }
  
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">{clampedValue.toFixed(0)}%</span>
        </div>
      )}
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
        {/* Background regions */}
        <div className="absolute inset-0 flex">
          <div className="w-[60%] bg-warning/20" />
          <div className="w-[20%] bg-info/20" />
          <div className="flex-1 bg-success/20" />
        </div>
        
        {/* Filled bar */}
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', regionColor)}
          style={{ width: `${clampedValue}%` }}
        />
        
        {/* Plinth tick marker at value position */}
        {clampedValue > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground/40 rounded-full"
            style={{ left: `${clampedValue}%`, transform: 'translateX(-50%)' }}
          />
        )}
        
        {/* Threshold markers */}
        {showThresholds && (
          <>
            <div className="absolute top-0 bottom-0 w-px bg-border left-[60%]" />
            <div className="absolute top-0 bottom-0 w-px bg-border left-[80%]" />
          </>
        )}
      </div>
    </div>
  )
}

