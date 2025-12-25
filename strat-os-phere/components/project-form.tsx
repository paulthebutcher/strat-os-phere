'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { paths } from '@/lib/routes'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible } from '@/components/ui/collapsible'
import { PasteExtraction } from '@/components/projects/PasteExtraction'
import { ExpertNote } from '@/components/shared/ExpertNote'
import { createProjectFromForm } from '@/app/projects/actions'
import type {
  RiskPosture,
  AmbitionLevel,
  DecisionLevel,
  InputConfidence,
} from '@/lib/supabase/types'

interface ProjectFormProps {
  /**
   * Optional title to render above the form.
   */
  title?: string
  /**
   * Optional description helper text shown under the title.
   */
  description?: string
}

export function ProjectForm({
  title = 'New Analysis',
  description = 'Set up the basics for your competitive analysis project.',
}: ProjectFormProps) {
  const router = useRouter()
  const [formState, setFormState] = useState({
    name: '',
    marketCategory: '',
    targetCustomer: '',
    product: '',
    goal: '',
    geography: '',
    primaryConstraint: '',
    riskPosture: '' as RiskPosture | '',
    ambitionLevel: '' as AmbitionLevel | '',
    organizationalCapabilities: '',
    decisionLevel: '' as DecisionLevel | '',
    explicitNonGoals: '',
    inputConfidence: '' as InputConfidence | '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleExtractedValues(values: {
    market?: string
    targetCustomer?: string
    goal?: string
    constraints?: string
    nonGoals?: string
  }) {
    if (values.market && !formState.marketCategory) {
      setFormState((prev) => ({ ...prev, marketCategory: values.market! }))
    }
    if (values.targetCustomer && !formState.targetCustomer) {
      setFormState((prev) => ({
        ...prev,
        targetCustomer: values.targetCustomer!,
      }))
    }
    if (values.goal && !formState.goal) {
      setFormState((prev) => ({ ...prev, goal: values.goal! }))
    }
    if (values.constraints && !formState.primaryConstraint) {
      setFormState((prev) => ({
        ...prev,
        primaryConstraint: values.constraints!,
      }))
    }
    if (values.nonGoals && !formState.explicitNonGoals) {
      setFormState((prev) => ({
        ...prev,
        explicitNonGoals: values.nonGoals!,
      }))
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      !formState.name ||
      !formState.marketCategory ||
      !formState.targetCustomer
    ) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const result = await createProjectFromForm({
        name: formState.name,
        marketCategory: formState.marketCategory,
        targetCustomer: formState.targetCustomer,
        product: formState.product || undefined,
        goal: formState.goal || undefined,
        geography: formState.geography || undefined,
        primaryConstraint:
          formState.primaryConstraint || undefined,
        riskPosture:
          (formState.riskPosture as RiskPosture) || undefined,
        ambitionLevel:
          (formState.ambitionLevel as AmbitionLevel) || undefined,
        organizationalCapabilities:
          formState.organizationalCapabilities || undefined,
        decisionLevel:
          (formState.decisionLevel as DecisionLevel) || undefined,
        explicitNonGoals: formState.explicitNonGoals || undefined,
        inputConfidence:
          (formState.inputConfidence as InputConfidence) || undefined,
      })

      if (!result?.success) {
        setError(
          result?.message ??
            'Something went wrong while creating the project.'
        )
      } else if (result.projectId) {
        router.push(paths.competitors(result.projectId))
      } else {
        setError('Something went wrong while creating the project.')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unexpected error while creating the project.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange<
    K extends keyof typeof formState,
    V extends (typeof formState)[K]
  >(key: K, value: V) {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function RadioGroup({
    name,
    value,
    onChange,
    options,
  }: {
    name: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string; description?: string }[]
  }) {
    return (
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-start gap-3 cursor-pointer group"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 h-4 w-4 border-border text-primary focus:ring-2 focus:ring-ring"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {option.label}
              </div>
              {option.description && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    )
  }

  return (
    <div className="panel w-full max-w-2xl px-6 py-6">
      <div className="mb-6 space-y-2">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PasteExtraction onExtract={handleExtractedValues} />

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Project name<span className="text-destructive ml-1">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={formState.name}
              onChange={(event) => handleChange('name', event.target.value)}
              placeholder="e.g. Competitive analysis for streaming platforms"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="marketCategory"
              className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Market / category
              <span className="text-destructive ml-1">*</span>
            </label>
            <Input
              id="marketCategory"
              name="marketCategory"
              value={formState.marketCategory}
              onChange={(event) =>
                handleChange('marketCategory', event.target.value)
              }
              placeholder="e.g. B2C video streaming platforms"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="targetCustomer"
              className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Target customer
              <span className="text-destructive ml-1">*</span>
            </label>
            <Input
              id="targetCustomer"
              name="targetCustomer"
              value={formState.targetCustomer}
              onChange={(event) =>
                handleChange('targetCustomer', event.target.value)
              }
              placeholder="e.g. Gen Z cord-cutters in the US"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="product"
                className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Your product{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Input
                id="product"
                name="product"
                value={formState.product}
                onChange={(event) =>
                  handleChange('product', event.target.value)
                }
                placeholder="How you describe what you're building"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="geography"
                className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Geography{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Input
                id="geography"
                name="geography"
                value={formState.geography}
                onChange={(event) =>
                  handleChange('geography', event.target.value)
                }
                placeholder="e.g. North America and Western Europe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="goal"
              className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Business goal{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Textarea
              id="goal"
              name="goal"
              value={formState.goal}
              onChange={(event) => handleChange('goal', event.target.value)}
              placeholder="What decision or outcome this analysis should support"
            />
          </div>
        </div>

        <Collapsible
          title="Sharpen the Analysis"
          description="Optional constraints, context, and calibration to improve output quality"
        >
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="primaryConstraint"
                  className="text-sm font-semibold text-foreground"
                >
                  Strategic constraints
                </label>
                <ExpertNote>
                  This helps Plinth prioritize tradeoffs the same way an exec review would.
                </ExpertNote>
              </div>
              <Input
                id="primaryConstraint"
                name="primaryConstraint"
                value={formState.primaryConstraint}
                onChange={(event) =>
                  handleChange('primaryConstraint', event.target.value)
                }
                placeholder="e.g. time, budget, regulation, competitive pressure"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Risk posture
                </label>
                <ExpertNote>
                  This shifts recommendations between near-term traction and long-term defensibility.
                </ExpertNote>
              </div>
              <RadioGroup
                name="riskPosture"
                value={formState.riskPosture}
                onChange={(value) =>
                  handleChange('riskPosture', value as RiskPosture)
                }
                options={[
                  {
                    value: 'near_term_traction',
                    label: 'Near-term traction',
                    description: 'Optimize for quick wins and momentum',
                  },
                  {
                    value: 'long_term_defensibility',
                    label: 'Long-term defensibility',
                    description: 'Build sustainable competitive advantage',
                  },
                  {
                    value: 'balanced',
                    label: 'Balanced',
                    description: 'Balance short and long-term considerations',
                  },
                ]}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Ambition level
              </label>
              <RadioGroup
                name="ambitionLevel"
                value={formState.ambitionLevel}
                onChange={(value) =>
                  handleChange('ambitionLevel', value as AmbitionLevel)
                }
                options={[
                  {
                    value: 'core_optimization',
                    label: 'Core optimization',
                    description: 'Improve existing product or positioning',
                  },
                  {
                    value: 'adjacent_expansion',
                    label: 'Adjacent expansion',
                    description: 'Move into related markets or segments',
                  },
                  {
                    value: 'category_redefinition',
                    label: 'Category redefinition',
                    description: 'Redefine or create a new category',
                  },
                ]}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Organizational reality
              </label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="organizationalCapabilities"
                    className="text-xs text-muted-foreground"
                  >
                    Existing capabilities (optional)
                  </label>
                  <Input
                    id="organizationalCapabilities"
                    name="organizationalCapabilities"
                    value={formState.organizationalCapabilities}
                    onChange={(event) =>
                      handleChange(
                        'organizationalCapabilities',
                        event.target.value
                      )
                    }
                    placeholder="e.g. Strong engineering team, weak go-to-market"
                  />
                </div>
                <div className="text-xs text-muted-foreground">or</div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Decision level
                  </label>
                  <RadioGroup
                    name="decisionLevel"
                    value={formState.decisionLevel}
                    onChange={(value) =>
                      handleChange('decisionLevel', value as DecisionLevel)
                    }
                    options={[
                      { value: 'IC', label: 'IC' },
                      { value: 'Director', label: 'Director' },
                      { value: 'VP', label: 'VP' },
                      { value: 'C-suite', label: 'C-suite' },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="explicitNonGoals"
                className="text-sm font-semibold text-foreground"
              >
                Explicit non-goals
              </label>
              <Textarea
                id="explicitNonGoals"
                name="explicitNonGoals"
                value={formState.explicitNonGoals}
                onChange={(event) =>
                  handleChange('explicitNonGoals', event.target.value)
                }
                placeholder="What we're explicitly not trying to achieve"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Confidence calibration
              </label>
              <RadioGroup
                name="inputConfidence"
                value={formState.inputConfidence}
                onChange={(value) =>
                  handleChange('inputConfidence', value as InputConfidence)
                }
                options={[
                  {
                    value: 'very_confident',
                    label: 'Very confident',
                    description: 'Inputs are well-researched and validated',
                  },
                  {
                    value: 'some_assumptions',
                    label: 'Some assumptions',
                    description: 'Based on best available information',
                  },
                  {
                    value: 'exploratory',
                    label: 'Exploratory',
                    description: 'Early-stage thinking, hypotheses to test',
                  },
                ]}
              />
            </div>
          </div>
        </Collapsible>

        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
            <p className="text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground">
            <span className="text-destructive">*</span> Required fields
          </p>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create analysis'}
          </Button>
        </div>
      </form>
    </div>
  )
}
