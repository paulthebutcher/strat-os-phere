/**
 * Competitive Snapshots Visual
 * 
 * Mini competitor cards showing positioning, pricing, and differentiation.
 */
export function CompetitiveSnapshotsVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-full space-y-2">
        {/* Competitor 1 */}
        <div className="px-2 py-1.5 rounded border border-border-subtle bg-surface">
          <div className="text-[10px] font-semibold text-text-primary mb-1">PagerDuty</div>
          <div className="grid grid-cols-3 gap-1 text-[9px]">
            <div className="text-text-muted">Positioning</div>
            <div className="text-text-muted">Pricing</div>
            <div className="text-text-muted">Diff</div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-600" />
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-600" />
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
            </div>
          </div>
        </div>
        
        {/* Competitor 2 */}
        <div className="px-2 py-1.5 rounded border border-border-subtle bg-surface-muted/50">
          <div className="text-[10px] font-semibold text-text-primary mb-1">Opsgenie</div>
          <div className="grid grid-cols-3 gap-1 text-[9px]">
            <div className="text-text-muted">Positioning</div>
            <div className="text-text-muted">Pricing</div>
            <div className="text-text-muted">Diff</div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-600" />
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-600" />
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

