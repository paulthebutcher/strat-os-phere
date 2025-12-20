'use client'

import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { ScoringMatrixArtifactContent } from '@/lib/schemas/scoring'
import { cn } from '@/lib/utils'

interface PostGenerationHighlightProps {
  opportunities: OpportunitiesArtifactContent | null | undefined
  scoring: ScoringMatrixArtifactContent | null | undefined
  /**
   * Called when the highlight should be dismissed (after animation)
   */
  onDismiss?: () => void
}

/**
 * Post-generation highlight component that briefly surfaces:
 * - Top opportunity
 * - Strongest differentiation signal (highest scoring opportunity or competitor strength)
 */
export function PostGenerationHighlight({
  opportunities,
  scoring,
  onDismiss,
}: PostGenerationHighlightProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Only show if we have data
    if (opportunities?.opportunities?.length || scoring?.summary?.length) {
      setShouldRender(true)
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsVisible(true)
      })

      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          setShouldRender(false)
          onDismiss?.()
        }, 300) // Wait for fade-out animation
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [opportunities, scoring, onDismiss])

  if (!shouldRender) return null

  // Get top opportunity
  const topOpportunity = opportunities?.opportunities
    ? [...opportunities.opportunities].sort((a, b) => b.score - a.score)[0]
    : null

  return (
    <div
      className={cn(
        'panel border-2 border-primary/20 bg-primary/5 p-4 transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Analysis complete
            </h3>
            <p className="text-xs text-muted-foreground">
              Here are the highlights from your analysis:
            </p>
          </div>

          {topOpportunity && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-medium text-foreground">
                  Top opportunity
                </span>
                <Badge variant="primary" className="text-xs">
                  {topOpportunity.score}/100
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground">
                {topOpportunity.title}
              </p>
              {topOpportunity.how_to_win?.[0] && (
                <p className="text-xs text-muted-foreground">
                  {topOpportunity.how_to_win[0]}
                </p>
              )}
            </div>
          )}

          {topOpportunity && topOpportunity.how_to_win?.[0] && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-medium text-foreground">
                  Strongest differentiation signal
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {topOpportunity.how_to_win[0]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

