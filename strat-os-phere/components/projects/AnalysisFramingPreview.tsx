'use client'

import { cn } from '@/lib/utils'
import type {
  RiskPosture,
  AmbitionLevel,
  InputConfidence,
} from '@/lib/supabase/types'

interface FormState {
  name: string
  marketCategory: string
  targetCustomer: string
  product?: string
  goal?: string
  geography?: string
  primaryConstraint?: string
  riskPosture?: RiskPosture | ''
  ambitionLevel?: AmbitionLevel | ''
  explicitNonGoals?: string
  inputConfidence?: InputConfidence | ''
}

interface AnalysisFramingPreviewProps {
  formState: FormState
}

type QualityLevel = 'needs_detail' | 'good' | 'strong'

interface QualityAssessment {
  level: QualityLevel
  label: string
}

function assessMarketQuality(market: string): QualityAssessment {
  if (!market || market.trim().length === 0) {
    return { level: 'needs_detail', label: 'Needs detail' }
  }
  const length = market.trim().length
  const hasConcreteNouns =
    /\b(software|platform|service|tool|app|system|solution)\b/i.test(market)
  const hasSpecificity = market.split(/\s+/).length >= 3

  if (length >= 30 && (hasConcreteNouns || hasSpecificity)) {
    return { level: 'strong', label: 'Strong' }
  }
  if (length >= 15) {
    return { level: 'good', label: 'Good' }
  }
  return { level: 'needs_detail', label: 'Needs detail' }
}

function assessCustomerQuality(customer: string): QualityAssessment {
  if (!customer || customer.trim().length === 0) {
    return { level: 'needs_detail', label: 'Needs detail' }
  }
  const length = customer.trim().length
  const hasDemographics = /\b(Gen [XYZ]|millennials|boomers|professionals|enterprise|SMB)\b/i.test(
    customer
  )
  const hasSpecificity = customer.split(/\s+/).length >= 4

  if (length >= 25 && (hasDemographics || hasSpecificity)) {
    return { level: 'strong', label: 'Strong' }
  }
  if (length >= 15) {
    return { level: 'good', label: 'Good' }
  }
  return { level: 'needs_detail', label: 'Needs detail' }
}

function assessGoalQuality(goal: string | undefined): QualityAssessment {
  if (!goal || goal.trim().length === 0) {
    return { level: 'needs_detail', label: 'Needs detail' }
  }
  const length = goal.trim().length
  const hasOutcome = /\b(reduce|increase|improve|achieve|enable|support)\b/i.test(
    goal
  )
  const hasMetrics = /\b(churn|retention|revenue|conversion|engagement)\b/i.test(
    goal
  )

  if (length >= 30 && (hasOutcome || hasMetrics)) {
    return { level: 'strong', label: 'Strong' }
  }
  if (length >= 20) {
    return { level: 'good', label: 'Good' }
  }
  return { level: 'needs_detail', label: 'Needs detail' }
}

function formatValue(value: string | undefined | null): string {
  if (!value || value.trim().length === 0) return '—'
  return value.trim()
}

function formatConstraint(constraint: string | undefined): string {
  if (!constraint) return '—'
  // Map common constraint values to display names
  const constraintMap: Record<string, string> = {
    time: 'Time',
    budget: 'Budget',
    org: 'Organizational',
    regulatory: 'Regulatory',
    'competitive pressure': 'Competitive pressure',
    other: 'Other',
  }
  return constraintMap[constraint.toLowerCase()] || constraint
}

function formatRiskPosture(posture: RiskPosture | '' | undefined): string {
  if (!posture) return '—'
  const postureMap: Record<string, string> = {
    near_term_traction: 'Near-term traction',
    long_term_defensibility: 'Long-term defensibility',
    balanced: 'Balanced',
  }
  return postureMap[posture] || posture
}

function formatAmbitionLevel(level: AmbitionLevel | '' | undefined): string {
  if (!level) return '—'
  const levelMap: Record<string, string> = {
    core_optimization: 'Core optimization',
    adjacent_expansion: 'Adjacent expansion',
    category_redefinition: 'Category redefinition',
  }
  return levelMap[level] || level
}

function formatInputConfidence(
  confidence: InputConfidence | '' | undefined
): string {
  if (!confidence) return '—'
  const confidenceMap: Record<string, string> = {
    very_confident: 'Very confident',
    some_assumptions: 'Some assumptions',
    exploratory: 'Exploring',
  }
  return confidenceMap[confidence] || confidence
}

export function AnalysisFramingPreview({
  formState,
}: AnalysisFramingPreviewProps) {
  const marketQuality = assessMarketQuality(formState.marketCategory)
  const customerQuality = assessCustomerQuality(formState.targetCustomer)
  const goalQuality = assessGoalQuality(formState.goal)

  const qualityColor = (level: QualityLevel) => {
    switch (level) {
      case 'strong':
        return 'text-green-600 dark:text-green-400'
      case 'good':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'needs_detail':
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="panel sticky top-4 h-fit">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Analysis framing
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">
                We'll analyze
              </div>
              <div className="font-medium text-foreground">
                {formatValue(formState.marketCategory)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">For</div>
              <div className="font-medium text-foreground">
                {formatValue(formState.targetCustomer)}
              </div>
            </div>
            {formState.goal && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">
                  To achieve
                </div>
                <div className="font-medium text-foreground">
                  {formatValue(formState.goal)}
                </div>
              </div>
            )}
            {formState.primaryConstraint && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Under</div>
                <div className="font-medium text-foreground">
                  {formatConstraint(formState.primaryConstraint)}
                </div>
              </div>
            )}
            {formState.ambitionLevel && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">
                  Ambition
                </div>
                <div className="font-medium text-foreground">
                  {formatAmbitionLevel(formState.ambitionLevel)}
                </div>
              </div>
            )}
            {formState.inputConfidence && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">
                  Confidence
                </div>
                <div className="font-medium text-foreground">
                  {formatInputConfidence(formState.inputConfidence)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-xs font-semibold text-foreground mb-3">
            Quality meter
          </h4>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Market specificity
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  qualityColor(marketQuality.level)
                )}
              >
                {marketQuality.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Customer clarity
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  qualityColor(customerQuality.level)
                )}
              >
                {customerQuality.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Goal clarity</span>
              <span
                className={cn(
                  'text-xs font-medium',
                  qualityColor(goalQuality.level)
                )}
              >
                {goalQuality.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

