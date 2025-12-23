import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import Link from 'next/link'

interface EmptyStateProps {
  /**
   * Title shown in the empty state
   */
  title: string
  /**
   * One-line explanation of what's missing
   */
  description: string
  /**
   * Primary action button (e.g., "Generate analysis")
   */
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  /**
   * Secondary action button (e.g., "Edit inputs")
   */
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  /**
   * Optional additional context or tips
   */
  footer?: ReactNode
  /**
   * Custom className for container
   */
  className?: string
}

/**
 * Empty state component with consistent styling and action patterns
 * Provides a clear, actionable empty state for sections that need data
 */
export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  footer,
  className,
}: EmptyStateProps) {
  const renderButton = (
    action: { label: string; href?: string; onClick?: () => void },
    variant: 'default' | 'outline' = 'default'
  ) => {
    if (action.href) {
      return (
        <Button asChild type="button" variant={variant}>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )
    }
    return (
      <Button type="button" variant={variant} onClick={action.onClick}>
        {action.label}
      </Button>
    )
  }

  return (
    <section
      className={`flex flex-col items-center justify-center py-20 px-6 animate-fade-in ${className || ''}`}
    >
      <div className="w-full max-w-md space-y-5 text-center">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h2>
        <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {primaryAction && renderButton(primaryAction, 'default')}
            {secondaryAction && renderButton(secondaryAction, 'outline')}
          </div>
        )}
        {footer && <div className="pt-4">{footer}</div>}
      </div>
    </section>
  )
}

