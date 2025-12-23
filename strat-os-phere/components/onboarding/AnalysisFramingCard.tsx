'use client'

import { SurfaceCard } from '@/components/ui/SurfaceCard'

interface AnalysisFramingCardProps {
  companyName: string
  decision: string
  market: string
}

export function AnalysisFramingCard({
  companyName,
  decision,
  market,
}: AnalysisFramingCardProps) {
  const hasDecision = decision.trim().length > 0
  const hasMarket = market.trim().length > 0
  const hasCompany = companyName.trim().length > 0

  // Count filled fields (0-3)
  const filledCount = [hasCompany, hasDecision, hasMarket].filter(Boolean).length

  // Quality labels based on count
  const qualityLabels = {
    0: 'Getting started',
    1: 'Good start',
    2: 'Strong',
    3: 'Excellent',
  }
  const qualityLabel = qualityLabels[filledCount as keyof typeof qualityLabels] || 'Getting started'

  // Quality status for styling
  const getQualityColor = () => {
    if (filledCount === 0) return 'text-muted-foreground'
    if (filledCount === 1) return 'text-blue-600 dark:text-blue-400'
    if (filledCount === 2) return 'text-indigo-600 dark:text-indigo-400'
    return 'text-green-600 dark:text-green-400'
  }

  // Show neutral prompt when blank
  const isBlank = !hasCompany && !hasDecision && !hasMarket

  return (
    <SurfaceCard className="p-6 shadow-md" data-framing-card>
      <h3 className="text-base font-semibold text-foreground mb-4">
        Analysis framing
      </h3>
      
      {isBlank ? (
        <p className="text-sm text-muted-foreground italic">
          Add a company + decision to see a preview
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground shrink-0">We'll analyze:</span>
            <span className="font-medium text-foreground">
              {hasCompany ? (
                <span className="inline-flex items-center gap-1.5">
                  {companyName}
                </span>
              ) : (
                <span className="text-muted-foreground italic">[company name]</span>
              )}
            </span>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground shrink-0">In:</span>
            <span className="font-medium text-foreground">
              {hasMarket ? (
                market
              ) : (
                <span className="text-muted-foreground italic">your market</span>
              )}
            </span>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground shrink-0">To decide:</span>
            <span className="font-medium text-foreground">
              {hasDecision ? (
                <span className="line-clamp-2">{decision}</span>
              ) : (
                <span className="text-muted-foreground italic">[decision]</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Quality meter */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Quality:</span>
          <span className={`text-xs font-semibold ${getQualityColor()}`}>
            {qualityLabel}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full ${
                index < filledCount
                  ? filledCount === 3
                    ? 'bg-green-500'
                    : filledCount === 2
                      ? 'bg-indigo-500'
                      : 'bg-blue-500'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <div className="mt-1.5 text-xs text-muted-foreground">
          {filledCount}/3 fields
        </div>
      </div>
    </SurfaceCard>
  )
}

