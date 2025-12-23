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

  // Quality meter logic
  let qualityStatus: 'incomplete' | 'needs_detail' | 'good' = 'incomplete'
  let qualityLabel = 'Incomplete'
  
  if (hasDecision && hasMarket && hasCompany) {
    qualityStatus = 'good'
    qualityLabel = 'Good'
  } else if ((hasDecision && hasMarket) || (hasDecision && hasCompany) || (hasMarket && hasCompany)) {
    qualityStatus = 'needs_detail'
    qualityLabel = 'Needs detail'
  }

  return (
    <SurfaceCard className="p-5 shadow-md">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Analysis framing
      </h3>
      
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-muted-foreground">We'll analyze: </span>
          <span className="font-medium text-foreground">
            {companyName ? companyName : <span className="text-muted-foreground italic">[company name]</span>}
          </span>
        </div>
        
        <div>
          <span className="text-muted-foreground">In: </span>
          <span className="font-medium text-foreground">
            {market ? market : <span className="text-muted-foreground italic">[market]</span>}
          </span>
        </div>
        
        <div>
          <span className="text-muted-foreground">To decide: </span>
          <span className="font-medium text-foreground">
            {decision ? decision : <span className="text-muted-foreground italic">[decision]</span>}
          </span>
        </div>
      </div>

      {/* Quality meter */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Quality:</span>
          <span
            className={`text-xs font-semibold ${
              qualityStatus === 'good'
                ? 'text-green-600 dark:text-green-400'
                : qualityStatus === 'needs_detail'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-muted-foreground'
            }`}
          >
            {qualityLabel}
          </span>
        </div>
      </div>
    </SurfaceCard>
  )
}

