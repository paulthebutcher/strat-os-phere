/**
 * Shareable Readout Visual
 * 
 * Mini executive memo layout with header, bullets, and citations.
 */
export function ShareableReadoutVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-full space-y-1.5 border border-border-subtle rounded bg-surface p-2">
        {/* Header */}
        <div className="border-b border-border-subtle pb-1">
          <div className="text-[10px] font-semibold text-text-primary">Strategic Opportunities</div>
          <div className="text-[9px] text-text-muted mt-0.5">Q1 2024 Analysis</div>
        </div>
        
        {/* Bullets */}
        <div className="space-y-0.5 pt-1">
          <div className="flex items-start gap-1.5">
            <span className="text-[9px] text-accent-primary mt-0.5">•</span>
            <span className="text-[9px] text-text-secondary flex-1">Free tier expansion (8.7)</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-[9px] text-accent-primary mt-0.5">•</span>
            <span className="text-[9px] text-text-secondary flex-1">API-first positioning (7.9)</span>
          </div>
        </div>
        
        {/* Citations footer */}
        <div className="pt-1 border-t border-border-subtle">
          <div className="text-[8px] text-text-muted">Sources: pagerduty.com, atlassian.com...</div>
        </div>
      </div>
    </div>
  )
}

