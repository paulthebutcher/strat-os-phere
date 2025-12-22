import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface InlineBadgeProps {
  /**
   * Badge text content
   */
  children: React.ReactNode
  /**
   * Badge variant (uses existing Badge component variants)
   */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  /**
   * Custom className
   */
  className?: string
}

/**
 * Small inline badge component for micro-indicators
 * Used for evidence coverage, status indicators, etc.
 */
export function InlineBadge({
  children,
  variant = 'secondary',
  className,
}: InlineBadgeProps) {
  return (
    <Badge variant={variant} className={cn('text-xs', className)}>
      {children}
    </Badge>
  )
}

