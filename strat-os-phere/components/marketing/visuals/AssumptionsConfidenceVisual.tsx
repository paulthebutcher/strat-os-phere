/**
 * Assumptions & Confidence Visual
 * 
 * Meter bars showing coverage, recency, and agreement metrics.
 */
export function AssumptionsConfidenceVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-full space-y-3">
        {/* Coverage bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-text-primary">Coverage</span>
            <span className="text-[10px] text-text-muted">92%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>
        
        {/* Recency bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-text-primary">Recency</span>
            <span className="text-[10px] text-text-muted">30d</span>
          </div>
          <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent-primary rounded-full" style={{ width: '85%' }} />
          </div>
        </div>
        
        {/* Agreement bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-text-primary">Agreement</span>
            <span className="text-[10px] text-text-muted">High</span>
          </div>
          <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: '88%' }} />
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-3 pt-1 border-t border-border-subtle">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-primary/20 border border-accent-primary/40" />
            <span className="text-[10px] text-text-muted">Certain</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-dashed border-text-muted/40" />
            <span className="text-[10px] text-text-muted">Inferred</span>
          </div>
        </div>
      </div>
    </div>
  )
}

