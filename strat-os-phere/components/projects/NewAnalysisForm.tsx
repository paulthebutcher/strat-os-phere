'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, TrendingUp, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { PasteExtraction } from '@/components/projects/PasteExtraction'
import { AnalysisFramingPreview } from '@/components/projects/AnalysisFramingPreview'
import { ExpertNote } from '@/components/shared/ExpertNote'
import { createProjectFromForm } from '@/app/projects/actions'
import {
  ANALYSIS_TEMPLATES,
  FIELD_EXAMPLES,
  GYM_QUICK_FILL,
  type AnalysisTemplate,
} from '@/components/projects/newAnalysisTemplates'
import type {
  RiskPosture,
  AmbitionLevel,
  DecisionLevel,
  InputConfidence,
} from '@/lib/supabase/types'

interface NewAnalysisFormProps {
  /**
   * Optional title to render above the form.
   */
  title?: string
  /**
   * Optional description helper text shown under the title.
   */
  description?: string
}

export function NewAnalysisForm({
  title = 'New Analysis',
  description = 'Set up the basics for your competitive analysis project.',
}: NewAnalysisFormProps) {
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedValues, setExtractedValues] = useState<{
    name?: string
    marketCategory?: string
    targetCustomer?: string
    businessGoal?: string
    product?: string
    geography?: string
  } | null>(null)

  function handleExtractedValues(values: {
    name?: string
    marketCategory?: string
    targetCustomer?: string
    businessGoal?: string
    product?: string
    geography?: string
    constraints?: string
    nonGoals?: string
  }) {
    const extracted: typeof extractedValues = {}
    if (values.name) {
      extracted.name = values.name
      if (!formState.name) {
        setFormState((prev) => ({ ...prev, name: values.name! }))
      }
    }
    if (values.marketCategory) {
      extracted.marketCategory = values.marketCategory
      if (!formState.marketCategory) {
        setFormState((prev) => ({ ...prev, marketCategory: values.marketCategory! }))
      }
    }
    if (values.targetCustomer) {
      extracted.targetCustomer = values.targetCustomer
      if (!formState.targetCustomer) {
        setFormState((prev) => ({
          ...prev,
          targetCustomer: values.targetCustomer!,
        }))
      }
    }
    if (values.businessGoal) {
      extracted.businessGoal = values.businessGoal
      if (!formState.goal) {
        setFormState((prev) => ({ ...prev, goal: values.businessGoal! }))
      }
    }
    if (values.product) {
      extracted.product = values.product
      if (!formState.product) {
        setFormState((prev) => ({ ...prev, product: values.product! }))
      }
    }
    if (values.geography) {
      extracted.geography = values.geography
      if (!formState.geography) {
        setFormState((prev) => ({ ...prev, geography: values.geography! }))
      }
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
    setExtractedValues(extracted)
  }

  function handleClearExtracted() {
    if (extractedValues) {
      // Revert only the extracted fields
      setFormState((prev) => ({
        ...prev,
        ...(extractedValues.name && prev.name === extractedValues.name
          ? { name: '' }
          : {}),
        ...(extractedValues.marketCategory &&
        prev.marketCategory === extractedValues.marketCategory
          ? { marketCategory: '' }
          : {}),
        ...(extractedValues.targetCustomer &&
        prev.targetCustomer === extractedValues.targetCustomer
          ? { targetCustomer: '' }
          : {}),
        ...(extractedValues.businessGoal && prev.goal === extractedValues.businessGoal
          ? { goal: '' }
          : {}),
        ...(extractedValues.product && prev.product === extractedValues.product
          ? { product: '' }
          : {}),
        ...(extractedValues.geography && prev.geography === extractedValues.geography
          ? { geography: '' }
          : {}),
      }))
      setExtractedValues(null)
    }
  }

  function handleTemplateSelect(template: AnalysisTemplate) {
    setSelectedTemplateId(template.id)
    setFormState((prev) => ({
      ...prev,
      name: template.values.name,
      marketCategory: template.values.marketCategory,
      targetCustomer: template.values.targetCustomer,
      goal: template.values.businessGoal,
      product: template.values.product || prev.product,
      geography: template.values.geography || prev.geography,
    }))
  }

  function handleQuickFill() {
    setSelectedTemplateId(null)
    setFormState((prev) => ({
      ...prev,
      name: GYM_QUICK_FILL.name,
      marketCategory: GYM_QUICK_FILL.marketCategory,
      targetCustomer: GYM_QUICK_FILL.targetCustomer,
      goal: GYM_QUICK_FILL.businessGoal,
      product: GYM_QUICK_FILL.product,
      geography: GYM_QUICK_FILL.geography,
    }))
  }

  function handleExampleSelect(field: 'marketCategory' | 'targetCustomer' | 'businessGoal', example: string) {
    if (field === 'businessGoal') {
      setFormState((prev) => ({ ...prev, goal: example }))
    } else {
      setFormState((prev) => ({ ...prev, [field]: example }))
    }
  }

  function handleRandomExample(field: 'marketCategory' | 'targetCustomer' | 'businessGoal') {
    const examples = FIELD_EXAMPLES[field]
    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    handleExampleSelect(field, randomExample)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      !formState.name ||
      !formState.marketCategory ||
      !formState.targetCustomer ||
      !formState.goal
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
        router.push(`/projects/${result.projectId}/competitors`)
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

  const goalCharCount = formState.goal.length
  const goalMaxLength = 500

  // Progressive disclosure: show product/geography only when core fields are filled
  const coreComplete =
    formState.marketCategory.trim().length > 0 &&
    formState.targetCustomer.trim().length > 0 &&
    formState.goal.trim().length > 0

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border border-border rounded-xl shadow-sm px-6 py-6 mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Turn public competitor signals into ranked, defensible opportunities.
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-medium text-foreground">Ranked opportunities</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-medium text-foreground">Evidence & recency</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-medium text-foreground">Actionable next steps</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Form */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Template Selection */}
            <SurfaceCard className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Step 1 — Choose a starting point
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      Start with a template
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="rounded-full text-xs px-3 py-1.5 border border-border bg-background hover:bg-muted/50 transition-colors font-medium text-foreground"
                  >
                    Quick fill: Gym management
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ANALYSIS_TEMPLATES.map((template) => {
                    const isSelected = selectedTemplateId === template.id
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template)}
                        className={`text-left rounded-lg border p-4 transition-all ${
                          isSelected
                            ? 'border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm bg-background'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="text-sm font-semibold text-foreground">
                            {template.name}
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </SurfaceCard>

            {/* Paste Context Section */}
            <SurfaceCard className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300 mb-1">
                    Paste context
                  </p>
                  <label className="text-sm font-medium text-foreground">
                    Have context already? Paste it here (optional)
                  </label>
                </div>
                <PasteExtraction
                  onExtract={handleExtractedValues}
                  currentValues={{
                    name: formState.name,
                    marketCategory: formState.marketCategory,
                    targetCustomer: formState.targetCustomer,
                    goal: formState.goal,
                    primaryConstraint: formState.primaryConstraint,
                    explicitNonGoals: formState.explicitNonGoals,
                    product: formState.product,
                    geography: formState.geography,
                  }}
                />
                {extractedValues && (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      We filled what we could — review and edit.
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearExtracted}
                    >
                      Clear extracted values
                    </Button>
                  </div>
                )}
              </div>
            </SurfaceCard>

            {/* Core Fields Section */}
            <SurfaceCard className="p-6">
              <div className="space-y-4">
                <p className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300 mb-1">
                  Core fields
                </p>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    {FIELD_EXAMPLES.marketCategory.slice(0, 2).map((example) => (
                      <Badge
                        key={example}
                        variant="secondary"
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleExampleSelect('marketCategory', example)}
                      >
                        {example}
                      </Badge>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleRandomExample('marketCategory')}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Use example
                    </button>
                  </div>
                  {formState.marketCategory.length > 0 &&
                    formState.marketCategory.length < 8 && (
                      <p className="text-xs text-muted-foreground">
                        Add a bit more detail for better results.
                      </p>
                    )}
                  {formState.marketCategory.length >= 8 && (
                    <p className="text-xs text-muted-foreground">
                      Be specific: "Boutique gym management software" beats
                      "Fitness".
                    </p>
                  )}
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
                  <div className="flex items-center gap-2 flex-wrap">
                    {FIELD_EXAMPLES.targetCustomer.slice(0, 2).map((example) => (
                      <Badge
                        key={example}
                        variant="secondary"
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleExampleSelect('targetCustomer', example)}
                      >
                        {example}
                      </Badge>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleRandomExample('targetCustomer')}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Use example
                    </button>
                  </div>
                  {formState.targetCustomer.length > 0 &&
                    formState.targetCustomer.length < 8 && (
                      <p className="text-xs text-muted-foreground">
                        Add a bit more detail for better results.
                      </p>
                    )}
                  {formState.targetCustomer.length >= 8 && (
                    <p className="text-xs text-muted-foreground">
                      Include demographics, behaviors, or firmographics.
                    </p>
                  )}
                </div>

                {/* Progressive disclosure: Product and Geography */}
                {coreComplete && (
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
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="goal"
                    className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Business goal
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <Textarea
                    id="goal"
                    name="goal"
                    value={formState.goal}
                    onChange={(event) => handleChange('goal', event.target.value)}
                    placeholder="What decision or outcome this analysis should support"
                    rows={3}
                    maxLength={goalMaxLength}
                    required
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    {FIELD_EXAMPLES.businessGoal.slice(0, 2).map((example) => (
                      <Badge
                        key={example}
                        variant="secondary"
                        className="cursor-pointer hover:bg-muted transition-colors text-xs max-w-full truncate"
                        onClick={() => handleExampleSelect('businessGoal', example)}
                        title={example}
                      >
                        {example.length > 50 ? `${example.substring(0, 47)}...` : example}
                      </Badge>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleRandomExample('businessGoal')}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Use example
                    </button>
                  </div>
                  {formState.goal.length > 0 && formState.goal.length < 8 && (
                    <p className="text-xs text-muted-foreground">
                      Add a bit more detail for better results.
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {formState.goal.length >= 8 && (
                      <p className="text-xs text-muted-foreground">
                        Outcome &gt; feature: "Reduce churn in first 30 days"
                        beats "Improve onboarding".
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {goalCharCount}/{goalMaxLength}
                    </p>
                  </div>
                </div>
                </div>
              </div>
            </SurfaceCard>

            {/* Sharpen Analysis Section */}
            <SurfaceCard className="p-6">
              <Collapsible
                title="Sharpen analysis"
                description="Optional constraints, context, and calibration to improve output quality"
                defaultOpen={false}
              >
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="primaryConstraint"
                        className="text-sm font-semibold text-foreground"
                      >
                        Primary constraint
                      </label>
                      <ExpertNote>
                        This helps Plinth prioritize tradeoffs the same way an
                        exec review would.
                      </ExpertNote>
                    </div>
                    <select
                      id="primaryConstraint"
                      name="primaryConstraint"
                      value={formState.primaryConstraint}
                      onChange={(event) =>
                        handleChange('primaryConstraint', event.target.value)
                      }
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a constraint...</option>
                      <option value="time">Time</option>
                      <option value="budget">Budget</option>
                      <option value="org">Organizational</option>
                      <option value="regulatory">Regulatory</option>
                      <option value="competitive pressure">
                        Competitive pressure
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-foreground">
                        Risk posture
                      </label>
                      <ExpertNote>
                        This shifts recommendations between near-term traction
                        and long-term defensibility.
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
                          description:
                            'Balance short and long-term considerations',
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
                          description:
                            'Move into related markets or segments',
                        },
                        {
                          value: 'category_redefinition',
                          label: 'Category redefinition',
                          description: 'Redefine or create a new category',
                        },
                      ]}
                    />
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
                      Input confidence
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
                          description:
                            'Inputs are well-researched and validated',
                        },
                        {
                          value: 'some_assumptions',
                          label: 'Some assumptions',
                          description: 'Based on best available information',
                        },
                        {
                          value: 'exploratory',
                          label: 'Exploring',
                          description:
                            'Early-stage thinking, hypotheses to test',
                        },
                      ]}
                    />
                  </div>
                </div>
              </Collapsible>
            </SurfaceCard>

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

        {/* Right column: Sticky Preview */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-20">
            <AnalysisFramingPreview formState={formState} />
          </div>
        </div>
      </div>
    </div>
  )
}

