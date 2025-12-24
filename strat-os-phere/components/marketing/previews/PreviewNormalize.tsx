/**
 * PreviewNormalize
 * 
 * Static HTML screenshot showing the "Normalize" step.
 * Displays a clean evidence ledger with tabs by type and confidence signals.
 * Uses sample data only - no API calls, no app state.
 */
import { FileText, DollarSign, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sampleNormalizedLedger } from './sampleData'

const iconMap = {
  pricing: DollarSign,
  docs: FileText,
  changelog: Calendar,
  reviews: MessageSquare,
}

export default function PreviewNormalize() {
  const { evidenceTypes: typesData, evidenceRows, confidenceSignals } = sampleNormalizedLedger
  
  const evidenceTypes = typesData.map((type) => ({
    ...type,
    icon: iconMap[type.id as keyof typeof iconMap] || FileText,
  }))

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with tabs */}
      <div className="border-b border-border-subtle bg-surface-muted/30">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Evidence Ledger
          </h2>
          <p className="text-sm text-text-secondary">
            Normalized evidence organized by type
          </p>
        </div>
        <div className="flex gap-1 px-6">
          {evidenceTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  type.active
                    ? 'border-accent-primary text-accent-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{type.label}</span>
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    type.active
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'bg-surface-muted text-text-muted'
                  )}
                >
                  {type.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main content: Evidence rows */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {evidenceRows.map((row, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border-subtle bg-surface hover:bg-surface-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text-primary">
                      {row.pageTitle}
                    </span>
                    <span className="text-xs text-text-muted">•</span>
                    <span className="text-xs text-text-muted">{row.domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {row.badges.map((badge, badgeIdx) => (
                      <span
                        key={badgeIdx}
                        className={cn(
                          'text-xs px-2 py-0.5 rounded font-medium',
                          badge === 'Fresh'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-accent-primary/10 text-accent-primary'
                        )}
                      >
                        {badge}
                      </span>
                    ))}
                    <span className="text-xs text-text-muted">
                      {row.extractedAt}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded',
                      row.confidence === 'high'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    )}
                  >
                    {row.confidence === 'high' ? 'High' : 'Medium'} confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar: Confidence signals */}
        <div className="w-80 border-l border-border-subtle bg-surface-muted/20 p-6">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">
            Confidence Signals
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border-subtle bg-surface">
              <div className="text-xs text-text-muted mb-1">
                Cross-source agreement
              </div>
              <div className="text-sm font-semibold text-green-700 mb-2">
                {confidenceSignals.crossSourceAgreement.level}
              </div>
              <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${confidenceSignals.crossSourceAgreement.percentage}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-lg border border-border-subtle bg-surface">
              <div className="text-xs text-text-muted mb-1">Recency</div>
              <div className="text-sm font-semibold text-text-primary mb-2">
                {confidenceSignals.recency.label}
              </div>
              <div className="text-xs text-text-secondary">
                Average age of evidence
              </div>
            </div>
            <div className="p-4 rounded-lg border border-border-subtle bg-surface">
              <div className="text-xs text-text-muted mb-1">Coverage gaps</div>
              <div className="text-sm font-semibold text-text-primary mb-2">
                {confidenceSignals.coverageGaps.type} ({confidenceSignals.coverageGaps.missing})
              </div>
              <div className="text-xs text-text-secondary">
                Some competitors missing review data
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

