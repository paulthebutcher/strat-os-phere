/**
 * PreviewCollectEvidence
 * 
 * Static HTML screenshot showing the "Collect public evidence" step.
 * Displays a realistic evidence collection interface with competitors,
 * evidence queue, and progress indicators.
 */
import { CheckCircle2, Clock, Loader2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PreviewCollectEvidence() {
  const competitors = [
    { name: 'Notion', status: 'done' },
    { name: 'Linear', status: 'done' },
    { name: 'Figma', status: 'fetching' },
    { name: 'Airtable', status: 'queued' },
    { name: 'Coda', status: 'queued' },
  ]

  const evidenceQueue = [
    { type: 'Pricing', domain: 'notion.so', status: 'done' },
    { type: 'Docs', domain: 'notion.so', status: 'done' },
    { type: 'Reviews', domain: 'notion.so', status: 'done' },
    { type: 'Pricing', domain: 'linear.app', status: 'done' },
    { type: 'Docs', domain: 'linear.app', status: 'done' },
    { type: 'Pricing', domain: 'figma.com', status: 'fetching' },
    { type: 'Docs', domain: 'figma.com', status: 'queued' },
    { type: 'Pricing', domain: 'airtable.com', status: 'queued' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'fetching':
        return <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
      case 'queued':
        return <Clock className="w-4 h-4 text-text-muted" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
        return 'Done'
      case 'fetching':
        return 'Fetching...'
      case 'queued':
        return 'Queued'
      default:
        return status
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border-subtle bg-surface-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Collecting Evidence
            </h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Gathering public sources from competitors
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-text-secondary mb-1">
              Coverage
            </div>
            <div className="text-sm font-semibold text-text-primary">
              12 sources • 4 types
            </div>
            <div className="text-xs text-text-muted">Freshness: High</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar: Competitors */}
        <div className="w-64 border-r border-border-subtle bg-surface-muted/20 p-4">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            Competitors
          </div>
          <div className="space-y-2">
            {competitors.map((comp, idx) => (
              <div
                key={idx}
                className={cn(
                  'px-3 py-2 rounded-lg border text-sm',
                  comp.status === 'fetching'
                    ? 'border-accent-primary/30 bg-accent-primary/5'
                    : comp.status === 'done'
                      ? 'border-border-subtle bg-surface'
                      : 'border-border-subtle bg-surface-muted/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'font-medium',
                      comp.status === 'fetching'
                        ? 'text-accent-primary'
                        : 'text-text-primary'
                    )}
                  >
                    {comp.name}
                  </span>
                  {comp.status === 'done' && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
                {comp.status === 'fetching' && (
                  <div className="text-xs text-text-muted mt-1">
                    In progress...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main panel: Evidence queue */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text-primary">
                Evidence Queue
              </h3>
              <div className="text-xs text-text-muted">68% complete</div>
            </div>
            <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-primary rounded-full transition-all duration-500"
                style={{ width: '68%' }}
              />
            </div>
            <div className="text-xs text-text-muted mt-1">
              Collecting pricing pages from figma.com...
            </div>
          </div>

          <div className="space-y-2">
            {evidenceQueue.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-lg border',
                  item.status === 'done'
                    ? 'border-border-subtle bg-surface'
                    : item.status === 'fetching'
                      ? 'border-accent-primary/30 bg-accent-primary/5'
                      : 'border-border-subtle bg-surface-muted/30'
                )}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      {item.type}
                    </span>
                    <span className="text-xs text-text-muted">→</span>
                    <span className="text-sm text-text-secondary truncate">
                      {item.domain}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      item.status === 'done'
                        ? 'text-green-600'
                        : item.status === 'fetching'
                          ? 'text-accent-primary'
                          : 'text-text-muted'
                    )}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </div>
                {item.status === 'done' && (
                  <ExternalLink className="w-4 h-4 text-text-muted flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

