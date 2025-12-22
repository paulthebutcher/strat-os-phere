import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DecisionConfidenceLevel } from '@/lib/ui/decisionConfidence'

interface DecisionConfidenceBadgeProps {
  level: DecisionConfidenceLevel
  className?: string
  showIcon?: boolean
}

/**
 * Badge component showing decision confidence level
 * Color-coded and icon-enhanced for quick scanning
 */
export function DecisionConfidenceBadge({
  level,
  className,
  showIcon = true,
}: DecisionConfidenceBadgeProps) {
  const config = {
    high: {
      label: 'High confidence',
      variant: 'success' as const,
      icon: CheckCircle2,
      description: 'Strong external evidence with recent, diverse sources',
    },
    moderate: {
      label: 'Moderate confidence',
      variant: 'warning' as const,
      icon: AlertCircle,
      description: 'Good evidence base with some signals',
    },
    exploratory: {
      label: 'Exploratory',
      variant: 'secondary' as const,
      icon: Search,
      description: 'Early signal, worth validating',
    },
  }

  const configForLevel = config[level]
  const Icon = configForLevel.icon

  return (
    <Badge
      variant={configForLevel.variant}
      className={cn(
        'inline-flex items-center gap-1.5',
        className
      )}
      title={configForLevel.description}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{configForLevel.label}</span>
    </Badge>
  )
}

