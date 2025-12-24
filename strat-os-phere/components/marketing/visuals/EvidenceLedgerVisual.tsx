/**
 * Evidence Ledger Visual
 * 
 * Mini table showing evidence types with badges and freshness indicators.
 */
export function EvidenceLedgerVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-full space-y-1.5">
        {/* Table rows */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-subtle bg-surface">
          <div className="flex-1 text-xs font-medium text-text-primary">Pricing</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
              Fresh
            </span>
            <span className="text-[10px] text-text-muted">12</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-subtle bg-surface">
          <div className="flex-1 text-xs font-medium text-text-primary">Docs</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary font-medium">
              Docs
            </span>
            <span className="text-[10px] text-text-muted">8</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-subtle bg-surface">
          <div className="flex-1 text-xs font-medium text-text-primary">Reviews</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary font-medium">
              Reviews
            </span>
            <span className="text-[10px] text-text-muted">15</span>
          </div>
        </div>
      </div>
    </div>
  )
}

