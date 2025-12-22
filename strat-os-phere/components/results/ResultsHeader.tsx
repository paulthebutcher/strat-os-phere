import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface ResultsHeaderProps {
  title: string
  subtitle?: string
  metadata?: Array<{
    label: string
    value: string | ReactNode
  }>
  statusBadge?: {
    label: string
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'
  }
  description?: string
  helpLink?: string
  actions?: ReactNode
  navigation?: ReactNode
  className?: string
}

/**
 * Presentational header component for results page
 * Provides consistent hierarchy, spacing, and layout for title, metadata, and actions
 */
export function ResultsHeader({
  title,
  subtitle,
  metadata = [],
  statusBadge,
  description,
  helpLink,
  actions,
  navigation,
  className,
}: ResultsHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-6 pb-8 border-b border-border',
        'md:flex-row md:items-start md:justify-between',
        className
      )}
    >
      <div className="flex-1 space-y-4">
        {/* Title and subtitle */}
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Metadata row */}
        {metadata.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="font-medium text-foreground">{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
            {statusBadge && (
              <Badge variant={statusBadge.variant || 'default'} className="text-xs">
                {statusBadge.label}
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {description}
          </p>
        )}

        {/* Help link */}
        {helpLink && (
          <p className="text-sm text-muted-foreground">
            <Link
              href={helpLink}
              className="text-primary underline-offset-4 hover:underline"
            >
              Need help?
            </Link>
          </p>
        )}
      </div>

      {/* Actions and navigation */}
      {(actions || navigation) && (
        <div className="flex flex-col items-start gap-4 text-left md:items-end md:text-right">
          {navigation}
          {actions}
        </div>
      )}
    </header>
  )
}

