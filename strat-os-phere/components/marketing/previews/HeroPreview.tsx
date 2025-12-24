/**
 * HeroPreview
 * 
 * Polished static preview of the product for the hero section.
 * Shows a "Ranked Opportunities" panel with realistic structure.
 * Animation-ready with data attributes for future motion.
 * 
 * Structure layers (for animation):
 * - Background surface layer
 * - Sidebar layer (data-hero-preview-sidebar)
 * - Rows layer (data-hero-preview-row)
 * - Badges layer (data-hero-preview-badge)
 */
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function HeroPreview() {
  const opportunities = [
    {
      score: 8.7,
      confidence: "High",
      title: "Launch enterprise SSO to match competitor positioning",
      citations: 12,
      evidenceTypes: ["Pricing", "Docs"],
    },
    {
      score: 7.9,
      confidence: "High",
      title: "Improve API rate limits based on competitor signals",
      citations: 8,
      evidenceTypes: ["Docs", "Changelog"],
    },
    {
      score: 7.4,
      confidence: "Medium",
      title: "Add granular permission model for team collaboration",
      citations: 6,
      evidenceTypes: ["Reviews", "Docs"],
    },
    {
      score: 7.1,
      confidence: "Medium",
      title: "Introduce advanced analytics dashboard",
      citations: 9,
      evidenceTypes: ["Pricing", "Reviews"],
    },
    {
      score: 6.8,
      confidence: "Medium",
      title: "Optimize mobile experience with native patterns",
      citations: 5,
      evidenceTypes: ["Reviews"],
    },
  ]

  const evidenceCoverage = [
    { type: "Pricing", count: 15, percentage: 100 },
    { type: "Docs", count: 12, percentage: 80 },
    { type: "Reviews", count: 8, percentage: 60 },
    { type: "Changelog", count: 5, percentage: 40 },
  ]

  return (
    <div 
      data-hero-preview
      className="h-full flex flex-col bg-white border border-border-subtle rounded-lg overflow-hidden"
    >
      {/* Window bar (minimal, Notion/Linear style) */}
      <div className="h-8 flex items-center gap-2 px-3 bg-surface-muted/50 border-b border-border-subtle">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-danger/40" />
          <div className="w-2 h-2 rounded-full bg-warning/40" />
          <div className="w-2 h-2 rounded-full bg-success/40" />
        </div>
        <div className="flex-1" />
        <div className="text-[10px] text-text-muted font-medium">Plinth Analysis</div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar layer */}
        <aside 
          data-hero-preview-sidebar
          className="w-48 border-r border-border-subtle bg-surface-muted/30 p-4 flex flex-col gap-1"
        >
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Navigation
          </div>
          <nav className="space-y-1">
            {["Opportunities", "Evidence", "Competitors", "Settings"].map((item, idx) => (
              <div
                key={item}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  idx === 0
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-surface-muted/50"
                )}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-subtle bg-surface-muted/30">
            <h2 className="text-base font-semibold text-text-primary mb-1">
              Ranked Opportunities
            </h2>
            <p className="text-xs text-text-secondary">
              Strategic bets scored by evidence strength and defensibility
            </p>
          </div>

          {/* Evidence coverage section */}
          <div className="px-6 py-3 bg-surface-muted/20 border-b border-border-subtle">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs font-medium text-text-muted">Evidence coverage:</span>
              {evidenceCoverage.map((item) => (
                <div
                  key={item.type}
                  data-hero-preview-badge
                  className="flex items-center gap-1.5"
                >
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                    {item.type}
                  </Badge>
                  <span className="text-[10px] text-text-muted">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities list */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {opportunities.map((opp, idx) => (
                <div
                  key={idx}
                  data-hero-preview-row
                  className={cn(
                    "p-4 rounded-lg border border-border-subtle bg-surface",
                    "hover:border-accent-primary/30 transition-colors"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Score pill */}
                    <div
                      data-hero-preview-badge
                      className="flex-shrink-0"
                    >
                      <Badge 
                        variant="primary" 
                        className="text-xs font-semibold px-2 py-1 min-w-[2.5rem] text-center"
                      >
                        {opp.score}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-medium text-text-secondary">
                          {opp.confidence} confidence
                        </span>
                        <span className="text-[10px] text-text-muted">•</span>
                        <span className="text-[11px] text-text-muted">
                          {opp.citations} citations
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-semibold text-text-primary mb-2 leading-snug">
                        {opp.title}
                      </h3>

                      {/* Evidence type badges */}
                      <div 
                        data-hero-preview-badge
                        className="flex items-center gap-1.5 flex-wrap"
                      >
                        {opp.evidenceTypes.map((type) => (
                          <Badge
                            key={type}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0.5"
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

