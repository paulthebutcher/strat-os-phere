/**
 * Opportunity Ranking Visual
 * 
 * Vertical ranked list with scores and confidence badges.
 */
export function OpportunityRankingVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-full space-y-2">
        {/* Ranked items */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-subtle bg-surface">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary/10 border border-accent-primary/20">
            <span className="text-[10px] font-bold text-accent-primary">1</span>
          </div>
          <div className="flex-1 text-xs font-medium text-text-primary truncate">
            Free tier expansion
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
              8.7
            </span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-medium">
              High
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-subtle bg-surface-muted/50">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-muted border border-border-subtle">
            <span className="text-[10px] font-bold text-text-muted">2</span>
          </div>
          <div className="flex-1 text-xs font-medium text-text-secondary truncate">
            API-first positioning
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">
              7.9
            </span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">
              Med
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-subtle bg-surface-muted/50">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-muted border border-border-subtle">
            <span className="text-[10px] font-bold text-text-muted">3</span>
          </div>
          <div className="flex-1 text-xs font-medium text-text-secondary truncate">
            Team collaboration
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">
              7.2
            </span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">
              Med
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

