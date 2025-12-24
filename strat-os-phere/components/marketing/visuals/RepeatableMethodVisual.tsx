/**
 * Repeatable Method Visual
 * 
 * Simple 3-step loop diagram showing the process flow.
 */
export function RepeatableMethodVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-full flex items-center justify-center gap-1.5">
        {/* Step 1 */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-lg border border-accent-primary/30 bg-accent-primary/5 flex items-center justify-center">
            <span className="text-[10px] font-bold text-accent-primary">1</span>
          </div>
          <span className="text-[9px] text-text-muted text-center">Collect</span>
        </div>
        
        {/* Arrow */}
        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        
        {/* Step 2 */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-lg border border-accent-primary/30 bg-accent-primary/5 flex items-center justify-center">
            <span className="text-[10px] font-bold text-accent-primary">2</span>
          </div>
          <span className="text-[9px] text-text-muted text-center">Normalize</span>
        </div>
        
        {/* Arrow */}
        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        
        {/* Step 3 */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-lg border border-accent-primary/30 bg-accent-primary/5 flex items-center justify-center">
            <span className="text-[10px] font-bold text-accent-primary">3</span>
          </div>
          <span className="text-[9px] text-text-muted text-center">Rank</span>
        </div>
        
        {/* Loop arrow */}
        <svg className="w-4 h-4 text-text-muted rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}

