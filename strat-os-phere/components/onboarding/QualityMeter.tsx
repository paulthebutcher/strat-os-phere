'use client'

import { useMemo } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { computeQualityScore, type ProjectInputs } from '@/lib/onboarding/heuristics'

interface QualityMeterProps {
  inputs: ProjectInputs
}

export function QualityMeter({ inputs }: QualityMeterProps) {
  const quality = useMemo(() => computeQualityScore(inputs), [inputs])

  // Color based on score
  const getColorClass = () => {
    if (quality.score < 40) return 'bg-amber-500'
    if (quality.score < 70) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getBgColorClass = () => {
    if (quality.score < 40) return 'bg-amber-50 dark:bg-amber-950/20'
    if (quality.score < 70) return 'bg-blue-50 dark:bg-blue-950/20'
    return 'bg-green-50 dark:bg-green-950/20'
  }

  return (
    <SurfaceCard className={`p-5 ${getBgColorClass()}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Input quality</h3>
          <span className="text-sm font-medium text-foreground">{quality.score}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getColorClass()}`}
            style={{ width: `${quality.score}%` }}
          />
        </div>

        {/* Label */}
        <div className="flex items-center gap-2">
          {quality.score >= 70 ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          )}
          <span className="text-sm text-foreground">{quality.label}</span>
        </div>

        {/* Suggestions */}
        {quality.suggestions.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            {quality.suggestions.map((suggestion, idx) => (
              <p key={idx} className="text-xs text-muted-foreground">
                • {suggestion}
              </p>
            ))}
          </div>
        )}
      </div>
    </SurfaceCard>
  )
}

