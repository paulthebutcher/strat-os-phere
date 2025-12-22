import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'pending'

interface StatusPillProps {
  variant: StatusVariant
  label: string
  className?: string
  showIcon?: boolean
}

/**
 * Presentational status indicator component
 * Provides consistent styling for status states (completed, paused, error, etc.)
 */
export function StatusPill({
  variant,
  label,
  className,
  showIcon = true,
}: StatusPillProps) {
  const config = {
    success: {
      icon: CheckCircle2,
      badgeVariant: 'default' as const,
    },
    warning: {
      icon: AlertCircle,
      badgeVariant: 'secondary' as const,
    },
    error: {
      icon: XCircle,
      badgeVariant: 'danger' as const,
    },
    info: {
      icon: Clock,
      badgeVariant: 'secondary' as const,
    },
    pending: {
      icon: Clock,
      badgeVariant: 'secondary' as const,
    },
  }

  const configForVariant = config[variant]
  const Icon = configForVariant.icon

  return (
    <Badge
      variant={configForVariant.badgeVariant}
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{label}</span>
    </Badge>
  )
}

