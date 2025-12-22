'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, TrendingUp, FileText, Link2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { PasteExtraction } from '@/components/projects/PasteExtraction'
import { AnalysisFramingPreview } from '@/components/projects/AnalysisFramingPreview'
import { ExpertNote } from '@/components/shared/ExpertNote'
import { WhyTooltip } from '@/components/guidance/WhyTooltip'
import { TourLink } from '@/components/guidance/TourLink'
import { Backdrop, ConfidenceBadgeIcon, RecencyBadgeIcon, CitationsBadgeIcon } from '@/components/graphics'
import { createProjectFromForm } from '@/app/projects/actions'
import { createCompetitorForProject } from '@/app/projects/[projectId]/competitors/actions'
import { CompetitorRecommendations } from '@/components/projects/new/CompetitorRecommendations'
import { CompetitorPicker, type CompetitorItem } from '@/components/projects/CompetitorPicker'
import { FramingConfirmationCard } from '@/components/projects/FramingConfirmationCard'
import { ExtractedFieldsPanel } from '@/components/projects/ExtractedFieldsPanel'
import {
  TavilyPreview,
  TavilyPreviewLoading,
  TavilyPreviewError,
} from '@/components/projects/TavilyPreview'
import { normalizeUrl, toDisplayDomain, isProbablyDomainLike } from '@/lib/url/normalizeUrl'
import {
  type ProposedFraming,
  inferCompetitorNameFromUrl,
  inferFramingFromText,
  mergeFraming,
} from '@/lib/projects/framing'
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
import type {
  CompetitorRecommendation,
  CompetitorRecommendationsResponse,
} from '@/lib/projects/new/types'
import type { EvidenceDraft } from '@/lib/schemas/evidenceDraft'

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
    startingPoint: 'product' as 'product' | 'problem' | 'customer' | 'market',
    hypothesis: '',
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
    // New optional fields
    problemStatement: '',
    customerProfile: '',
    marketContext: '',
    solutionIdea: '',
  })
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<{
    errorId?: string
    status?: number
    code?: string
  } | null>(null)
  const [extractedValues, setExtractedValues] = useState<{
    name?: string
    marketCategory?: string
    targetCustomer?: string
    businessGoal?: string
    product?: string
    geography?: string
  } | null>(null)
  
  // New entry point states
  const [primaryUrl, setPrimaryUrl] = useState('')
  const [contextText, setContextText] = useState('')
  const [recommendations, setRecommendations] = useState<CompetitorRecommendation[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [recommending, setRecommending] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [suggestedFields, setSuggestedFields] = useState<Set<string>>(new Set())
  
  // New UX flow states
  const [proposedFraming, setProposedFraming] = useState<ProposedFraming | null>(null)
  const [showFramingConfirmation, setShowFramingConfirmation] = useState(false)
  const [competitors, setCompetitors] = useState<CompetitorItem[]>([])
  const [generatingFraming, setGeneratingFraming] = useState(false)
  
  // Tavily preview states
  const [tavilyPreview, setTavilyPreview] = useState<{
    normalizedUrl: string
    site: { title?: string; description?: string; faviconUrl?: string; domain: string }
    summary: { oneLiner: string; bullets: string[]; confidence: 'high' | 'medium' | 'low' }
    suggestedSources: Array<{
      label: string
      url: string
      type: 'pricing' | 'docs' | 'changelog' | 'jobs' | 'status' | 'integrations' | 'reviews' | 'blog' | 'other'
    }>
    suggestedCompetitors: Array<{ name: string; url: string; rationale: string }>
    suggestedKeywords: string[]
  } | null>(null)
  const [loadingTavily, setLoadingTavily] = useState(false)
  const [tavilyError, setTavilyError] = useState<{
    error: 'TAVILY_NOT_CONFIGURED' | 'INVALID_URL' | 'TAVILY_ERROR' | 'UNAUTHORIZED' | 'INTERNAL_ERROR'
    message: string
  } | null>(null)
  const [enabledSources, setEnabledSources] = useState<Set<string>>(new Set())
  const [normalizedUrlDisplay, setNormalizedUrlDisplay] = useState<string | null>(null)

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

  /**
   * Format evidence draft into markdown evidence text
   */
  function formatEvidenceDraft(draft: EvidenceDraft): string {
    const sections: string[] = []

    // Positioning
    if (draft.sections.positioning.bullets.length > 0) {
      sections.push('## Positioning')
      sections.push('')
      draft.sections.positioning.bullets.forEach((bullet) => {
        sections.push(`- ${bullet}`)
      })
      if (draft.sections.positioning.sources.length > 0) {
        sections.push('')
        sections.push('Sources:')
        draft.sections.positioning.sources.forEach((url) => {
          sections.push(`- ${url}`)
        })
      }
      sections.push('')
    }

    // Pricing
    if (draft.sections.pricing.bullets.length > 0) {
      sections.push('## Pricing')
      sections.push('')
      draft.sections.pricing.bullets.forEach((bullet) => {
        sections.push(`- ${bullet}`)
      })
      if (draft.sections.pricing.sources.length > 0) {
        sections.push('')
        sections.push('Sources:')
        draft.sections.pricing.sources.forEach((url) => {
          sections.push(`- ${url}`)
        })
      }
      sections.push('')
    }

    // Target customers
    if (draft.sections.target_customers.bullets.length > 0) {
      sections.push('## Target Customers')
      sections.push('')
      draft.sections.target_customers.bullets.forEach((bullet) => {
        sections.push(`- ${bullet}`)
      })
      if (draft.sections.target_customers.sources.length > 0) {
        sections.push('')
        sections.push('Sources:')
        draft.sections.target_customers.sources.forEach((url) => {
          sections.push(`- ${url}`)
        })
      }
      sections.push('')
    }

    // Key features
    if (draft.sections.key_features.bullets.length > 0) {
      sections.push('## Key Features')
      sections.push('')
      draft.sections.key_features.bullets.forEach((bullet) => {
        sections.push(`- ${bullet}`)
      })
      if (draft.sections.key_features.sources.length > 0) {
        sections.push('')
        sections.push('Sources:')
        draft.sections.key_features.sources.forEach((url) => {
          sections.push(`- ${url}`)
        })
      }
      sections.push('')
    }

    // Integrations (optional)
    if (draft.sections.integrations && draft.sections.integrations.bullets.length > 0) {
      sections.push('## Integrations')
      sections.push('')
      draft.sections.integrations.bullets.forEach((bullet) => {
        sections.push(`- ${bullet}`)
      })
      if (draft.sections.integrations.sources.length > 0) {
        sections.push('')
        sections.push('Sources:')
        draft.sections.integrations.sources.forEach((url) => {
          sections.push(`- ${url}`)
        })
      }
      sections.push('')
    }

    // Enterprise signals (optional)
    if (draft.sections.enterprise_signals && draft.sections.enterprise_signals.bullets.length > 0) {
      sections.push('## Enterprise Signals')
      sections.push('')
      draft.sections.enterprise_signals.bullets.forEach((bullet) => {
        sections.push(`- ${bullet}`)
      })
      if (draft.sections.enterprise_signals.sources.length > 0) {
        sections.push('')
        sections.push('Sources:')
        draft.sections.enterprise_signals.sources.forEach((url) => {
          sections.push(`- ${url}`)
        })
      }
      sections.push('')
    }

    return sections.join('\n')
  }

  /**
   * Handle "Generate framing" - infer framing from URL and/or context text
   */
  async function handleGenerateFraming() {
    if (!primaryUrl.trim() && !contextText.trim()) {
      setError('Please enter a competitor URL or paste some context')
      return
    }

    setGeneratingFraming(true)
    setError(null)
    setErrorDetails(null)

    try {
      // Start with client-side inference
      let inferredFraming: ProposedFraming = {
        market_category: null,
        target_customer: null,
        business_goal: null,
        geography: null,
        suggested_competitors: [],
        confidence: {
          market: 'low',
          customer: 'low',
          goal: 'low',
        },
      }

      // Infer from context text if available
      if (contextText.trim()) {
        inferredFraming = inferFramingFromText(contextText.trim())
      }

      // Add primary competitor if URL is provided
      if (primaryUrl.trim()) {
        const competitorName = inferCompetitorNameFromUrl(primaryUrl.trim())
        inferredFraming.suggested_competitors.push({
          name: competitorName,
          url: primaryUrl.trim(),
        })
        // Add to competitors list if not already there
        if (!competitors.some((c) => c.url === primaryUrl.trim())) {
          setCompetitors((prev) => [
            ...prev,
            { name: competitorName, url: primaryUrl.trim() },
          ])
        }
      }

      // Try to get API recommendations if available (non-blocking)
      let apiFraming: ProposedFraming['market_category'] | null = null
      try {
        const response = await fetch('/api/projects/recommend-competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            primaryUrl: primaryUrl.trim() || undefined,
            contextText: contextText.trim() || undefined,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.ok && data.framing) {
            // Merge API framing with inferred
            const merged = mergeFraming(data.framing, inferredFraming)
            inferredFraming = merged

            // Add suggested competitors from API
            if (data.recommendations && data.recommendations.length > 0) {
              inferredFraming.suggested_competitors = [
                ...inferredFraming.suggested_competitors,
                ...data.recommendations.map((r: CompetitorRecommendation) => ({
                  name: r.name,
                  url: r.url,
                })),
              ]
            }
          }
        }
      } catch (apiError) {
        // Non-blocking: log but continue with client-side inference
        console.warn('Failed to fetch API recommendations (non-blocking):', apiError)
      }

      setProposedFraming(inferredFraming)
      setShowFramingConfirmation(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate framing. Please try again.'
      )
    } finally {
      setGeneratingFraming(false)
    }
  }

  /**
   * Handle confirmation of proposed framing
   */
  function handleConfirmFraming(framing: ProposedFraming) {
    // Populate form fields from confirmed framing
    if (framing.market_category && !formState.marketCategory) {
      setFormState((prev) => ({
        ...prev,
        marketCategory: framing.market_category!,
      }))
    }
    if (framing.target_customer && !formState.targetCustomer) {
      setFormState((prev) => ({
        ...prev,
        targetCustomer: framing.target_customer!,
      }))
    }
    if (framing.business_goal && !formState.goal) {
      setFormState((prev) => ({
        ...prev,
        goal: framing.business_goal!,
      }))
    }
    if (framing.geography && !formState.geography) {
      setFormState((prev) => ({
        ...prev,
        geography: framing.geography!,
      }))
    }

    // Ensure primary competitor is in the list if URL was provided
    if (primaryUrl.trim()) {
      const competitorName = inferCompetitorNameFromUrl(primaryUrl.trim())
      const alreadyAdded = competitors.some(
        (c) => c.url === primaryUrl.trim() || c.name.toLowerCase() === competitorName.toLowerCase()
      )
      if (!alreadyAdded) {
        setCompetitors((prev) => [
          ...prev,
          { name: competitorName, url: primaryUrl.trim() },
        ])
      }
    }

    setShowFramingConfirmation(false)
  }

  /**
   * Handle "Find signals" - analyze URL with Tavily and get recommendations
   */
  async function handleAnalyzeUrl() {
    if (!primaryUrl.trim()) {
      setError('Please enter a competitor URL')
      setErrorDetails(null)
      return
    }

    // Normalize URL client-side first
    const normalized = normalizeUrl(primaryUrl.trim())
    if (!normalized.ok) {
      setError(`Invalid URL: ${normalized.reason}`)
      setErrorDetails({
        code: 'VALIDATION_ERROR',
        status: 400,
      })
      setNormalizedUrlDisplay(null)
      return
    }

    const normalizedUrlValue = normalized.url
    setNormalizedUrlDisplay(normalizedUrlValue)
    setError(null)
    setErrorDetails(null)
    setTavilyError(null)
    setLoadingTavily(true)
    setRecommending(true)

    try {
      // First, try Tavily preview
      try {
        const tavilyResponse = await fetch('/api/tavily/primary-site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ primaryUrl: normalizedUrlValue }),
        })

        const tavilyData = await tavilyResponse.json()

        if (tavilyData.ok) {
          setTavilyPreview(tavilyData)
          // Enable all sources by default
          const sourceUrls = new Set<string>(
            tavilyData.suggestedSources.map((s: { url: string }) => s.url)
          )
          setEnabledSources(sourceUrls)
        } else {
          setTavilyError({
            error: tavilyData.error,
            message: tavilyData.message,
          })
          // Continue with recommendations even if Tavily fails
        }
      } catch (tavilyErr) {
        // Non-blocking: log but continue
        console.warn('Tavily preview failed (non-blocking):', tavilyErr)
        setTavilyError({
          error: 'TAVILY_ERROR',
          message: tavilyErr instanceof Error ? tavilyErr.message : 'Failed to analyze site',
        })
      }

      // Then get competitor recommendations
      const response = await fetch('/api/projects/recommend-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryUrl: normalizedUrlValue }),
      })

      let data: unknown
      try {
        data = await response.json()
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        const text = await response.text().catch(() => 'Unable to read response')
        throw new Error(
          `Failed to parse response (status ${response.status}): ${text.substring(0, 200)}`
        )
      }

      // Handle both success and error response shapes
      if (typeof data === 'object' && data !== null && 'ok' in data) {
        if (data.ok === true) {
          const successData = data as { ok: true } & CompetitorRecommendationsResponse

          // Auto-fill framing if available
          const newSuggestedFields = new Set<string>()
          const framing = successData.framing
          if (framing) {
            if (framing.projectName && !formState.name) {
              setFormState((prev) => ({ ...prev, name: framing.projectName! }))
              newSuggestedFields.add('name')
            }
            if (framing.market && !formState.marketCategory) {
              setFormState((prev) => ({
                ...prev,
                marketCategory: framing.market!,
              }))
              newSuggestedFields.add('marketCategory')
            }
            if (framing.targetCustomer && !formState.targetCustomer) {
              setFormState((prev) => ({
                ...prev,
                targetCustomer: framing.targetCustomer!,
              }))
              newSuggestedFields.add('targetCustomer')
            }
            if (framing.geography && !formState.geography) {
              setFormState((prev) => ({ ...prev, geography: framing.geography! }))
              newSuggestedFields.add('geography')
            }
            if (framing.businessGoal && !formState.goal) {
              setFormState((prev) => ({ ...prev, goal: framing.businessGoal! }))
              newSuggestedFields.add('goal')
            }
          }
          setSuggestedFields(newSuggestedFields)

          setRecommendations(successData.recommendations)
          setShowRecommendations(true)
          return
        } else if (data.ok === false) {
          const errorData = data as {
            ok: false
            error: { message: string; code: string; status: number }
            errorId: string
          }
          setError(errorData.error.message)
          setErrorDetails({
            errorId: errorData.errorId,
            status: errorData.error.status,
            code: errorData.error.code,
          })
          return
        }
      }

      // Fallback for unexpected response shape
      throw new Error(
        `Unexpected response format (status ${response.status})`
      )
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to get recommendations. Please try again.'
      setError(errorMessage)
      // Don't set errorDetails for network/parsing errors since we don't have them
    } finally {
      setRecommending(false)
    }
  }

  /**
   * Handle "Extract & recommend competitors" - get recommendations from context text
   */
  async function handleExtractAndRecommend() {
    if (!contextText.trim()) {
      setError('Please paste some context')
      setErrorDetails(null)
      return
    }

    setRecommending(true)
    setError(null)
    setErrorDetails(null)

    try {
      const response = await fetch('/api/projects/recommend-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextText: contextText.trim() }),
      })

      let data: unknown
      try {
        data = await response.json()
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        const text = await response.text().catch(() => 'Unable to read response')
        throw new Error(
          `Failed to parse response (status ${response.status}): ${text.substring(0, 200)}`
        )
      }

      // Handle both success and error response shapes
      if (typeof data === 'object' && data !== null && 'ok' in data) {
        if (data.ok === true) {
          const successData = data as { ok: true } & CompetitorRecommendationsResponse

          // Auto-fill framing if available
          const newSuggestedFields = new Set<string>()
          const framing = successData.framing
          if (framing) {
            if (framing.projectName && !formState.name) {
              setFormState((prev) => ({ ...prev, name: framing.projectName! }))
              newSuggestedFields.add('name')
            }
            if (framing.market && !formState.marketCategory) {
              setFormState((prev) => ({
                ...prev,
                marketCategory: framing.market!,
              }))
              newSuggestedFields.add('marketCategory')
            }
            if (framing.targetCustomer && !formState.targetCustomer) {
              setFormState((prev) => ({
                ...prev,
                targetCustomer: framing.targetCustomer!,
              }))
              newSuggestedFields.add('targetCustomer')
            }
            if (framing.geography && !formState.geography) {
              setFormState((prev) => ({ ...prev, geography: framing.geography! }))
              newSuggestedFields.add('geography')
            }
            if (framing.businessGoal && !formState.goal) {
              setFormState((prev) => ({ ...prev, goal: framing.businessGoal! }))
              newSuggestedFields.add('goal')
            }
          }
          setSuggestedFields(newSuggestedFields)

          setRecommendations(successData.recommendations)
          setShowRecommendations(true)
          return
        } else if (data.ok === false) {
          const errorData = data as {
            ok: false
            error: { message: string; code: string; status: number }
            errorId: string
          }
          setError(errorData.error.message)
          setErrorDetails({
            errorId: errorData.errorId,
            status: errorData.error.status,
            code: errorData.error.code,
          })
          return
        }
      }

      // Fallback for unexpected response shape
      throw new Error(
        `Unexpected response format (status ${response.status})`
      )
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to get recommendations. Please try again.'
      setError(errorMessage)
      // Don't set errorDetails for network/parsing errors since we don't have them
    } finally {
      setRecommending(false)
    }
  }

  /**
   * Handle "Confirm & scrape" - create project and add competitors with evidence
   */
  async function handleConfirmAndScrape(
    selected: Array<{ name: string; url: string }>
  ) {
    if (selected.length === 0) {
      setError('Please select at least one competitor with a URL')
      return
    }

    // Ensure we have minimum required fields for project creation
    const projectName =
      formState.name || `New analysis (draft) - ${new Date().toLocaleDateString()}`
    const marketCategory = formState.marketCategory || 'Competitive analysis'
    const targetCustomer = formState.targetCustomer || 'Target customers'
    const goal = formState.goal || 'Generate competitive insights'

    setScraping(true)
    setError(null)

    try {
      // Create project first
      const projectResult = await createProjectFromForm({
        name: projectName,
        marketCategory,
        targetCustomer,
        product: formState.product || undefined,
        goal,
        geography: formState.geography || undefined,
        primaryConstraint: formState.primaryConstraint || undefined,
        riskPosture: (formState.riskPosture as RiskPosture) || undefined,
        ambitionLevel: (formState.ambitionLevel as AmbitionLevel) || undefined,
        organizationalCapabilities:
          formState.organizationalCapabilities || undefined,
        decisionLevel: (formState.decisionLevel as DecisionLevel) || undefined,
        explicitNonGoals: formState.explicitNonGoals || undefined,
        inputConfidence:
          (formState.inputConfidence as InputConfidence) || undefined,
        // New hypothesis-first fields
        startingPoint: formState.startingPoint,
        hypothesis: formState.hypothesis || undefined,
        problemStatement: formState.problemStatement || undefined,
        customerProfile: formState.customerProfile || undefined,
        marketContext: formState.marketContext || undefined,
        solutionIdea: formState.solutionIdea || undefined,
      })

      if (!projectResult?.success || !projectResult.projectId) {
        throw new Error(
          projectResult?.message || 'Failed to create project'
        )
      }

      const projectId = projectResult.projectId

      // For each selected competitor, generate evidence and create competitor
      for (const competitor of selected) {
        try {
          // Generate evidence
          const evidenceResponse = await fetch('/api/evidence/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId,
              competitorName: competitor.name,
              domainOrUrl: competitor.url,
            }),
          })

          if (!evidenceResponse.ok) {
            const errorData = await evidenceResponse.json().catch(() => ({}))
            throw new Error(
              errorData.error || `Failed to generate evidence for ${competitor.name}`
            )
          }

          const evidenceResult = (await evidenceResponse.json()) as
            | { ok: true; draft: EvidenceDraft }
            | { ok: false; error: string }

          if (!evidenceResult.ok) {
            throw new Error(
              evidenceResult.error || `Failed to generate evidence for ${competitor.name}`
            )
          }

          if (!evidenceResult.draft) {
            throw new Error(`Failed to generate evidence for ${competitor.name}: missing draft`)
          }

          // Format evidence draft into markdown
          const evidenceText = formatEvidenceDraft(evidenceResult.draft)

          // Create competitor
          const competitorResult = await createCompetitorForProject(projectId, {
            name: competitor.name,
            website: competitor.url,
            evidence: evidenceText,
          })

          if (!competitorResult.success) {
            throw new Error(
              competitorResult.message || `Failed to create competitor ${competitor.name}`
            )
          }
        } catch (err) {
          // Log error but continue with other competitors
          console.error(`Failed to process competitor ${competitor.name}:`, err)
          // Still create the competitor with minimal evidence if scraping fails
          try {
            await createCompetitorForProject(projectId, {
              name: competitor.name,
              website: competitor.url,
              evidence: `## ${competitor.name}\n\nEvidence generation in progress.`,
            })
          } catch (createErr) {
            console.error(`Failed to create competitor ${competitor.name}:`, createErr)
          }
        }
      }

      // Navigate to competitors page
      router.push(`/projects/${projectId}/competitors`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create project and scrape competitors. Please try again.'
      )
      setScraping(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      !formState.name ||
      !formState.hypothesis ||
      !formState.marketCategory ||
      !formState.targetCustomer
    ) {
      setError('Please fill in all required fields (name, hypothesis, market, and target customer).')
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
        // New hypothesis-first fields
        startingPoint: formState.startingPoint,
        hypothesis: formState.hypothesis || undefined,
        problemStatement: formState.problemStatement || undefined,
        customerProfile: formState.customerProfile || undefined,
        marketContext: formState.marketContext || undefined,
        solutionIdea: formState.solutionIdea || undefined,
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
    formState.hypothesis.trim().length > 0

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="relative bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border border-border rounded-xl shadow-sm px-6 py-6 mb-6 overflow-hidden">
          <Backdrop variant="section" density="subtle" className="rounded-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Turn public competitor signals into ranked, defensible opportunities.
            </p>
            <TourLink />
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-medium text-foreground">Ranked opportunities</span>
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadgeIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-medium text-foreground">Evidence & recency</span>
              </div>
              <div className="flex items-center gap-2">
                <CitationsBadgeIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-medium text-foreground">Citations included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Start point (new UX flow) */}
          {!showRecommendations && !showFramingConfirmation && (
            <SurfaceCard className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Step 1 — Start point
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enter a primary competitor URL and/or paste context. We'll infer the framing and suggest competitors.
                  </p>
                </div>

                {/* Primary competitor URL */}
                <div className="space-y-2">
                  <label
                    htmlFor="primaryUrl"
                    className="text-sm font-semibold text-foreground"
                  >
                    Primary competitor URL
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryUrl"
                      type="text"
                      value={primaryUrl}
                      onChange={(e) => {
                        setPrimaryUrl(e.target.value)
                        setError(null)
                        setErrorDetails(null)
                        setNormalizedUrlDisplay(null)
                        setTavilyPreview(null)
                        setTavilyError(null)
                      }}
                      placeholder="monday.com or https://monday.com"
                      disabled={recommending || loadingTavily}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAnalyzeUrl}
                      disabled={recommending || loadingTavily || !primaryUrl.trim()}
                    >
                      {recommending || loadingTavily ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        'Find signals'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste a domain or product URL (we'll fix the format).
                  </p>
                  {normalizedUrlDisplay && normalizedUrlDisplay !== primaryUrl.trim() && (
                    <p className="text-xs text-muted-foreground italic">
                      We'll use: {normalizedUrlDisplay}
                    </p>
                  )}
                  {error && errorDetails?.code === 'VALIDATION_ERROR' && (
                    <p className="text-xs text-destructive">
                      {error}. Expected format: example.com or https://example.com
                    </p>
                  )}
                </div>

                {/* Free-form context */}
                <div className="space-y-2">
                  <label
                    htmlFor="contextText"
                    className="text-sm font-semibold text-foreground"
                  >
                    Free-form context
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </label>
                  <Textarea
                    id="contextText"
                    value={contextText}
                    onChange={(e) => {
                      setContextText(e.target.value)
                      setError(null)
                      setErrorDetails(null)
                    }}
                    placeholder="Paste notes, a doc excerpt, or a rough description..."
                    rows={4}
                    disabled={generatingFraming}
                  />
                </div>

                {/* Tavily Preview */}
                {loadingTavily && <TavilyPreviewLoading />}
                {tavilyError && (
                  <TavilyPreviewError
                    error={tavilyError.error}
                    message={tavilyError.message}
                    onRetry={() => handleAnalyzeUrl()}
                  />
                )}
                {tavilyPreview && !loadingTavily && (
                  <TavilyPreview
                    data={tavilyPreview}
                    onAddCompetitor={(competitor) => {
                      if (!competitors.some((c) => c.url === competitor.url)) {
                        setCompetitors((prev) => [
                          ...prev,
                          { name: competitor.name, url: competitor.url },
                        ])
                      }
                    }}
                    onSourceToggle={(source, enabled) => {
                      setEnabledSources((prev) => {
                        const next = new Set(prev)
                        if (enabled) {
                          next.add(source.url)
                        } else {
                          next.delete(source.url)
                        }
                        return next
                      })
                    }}
                    enabledSources={enabledSources}
                  />
                )}

                {/* Generate framing button */}
                <Button
                  type="button"
                  onClick={handleGenerateFraming}
                  disabled={generatingFraming || (!primaryUrl.trim() && !contextText.trim())}
                  className="w-full"
                >
                  {generatingFraming ? 'Generating framing...' : 'Generate framing'}
                </Button>

                {/* Extracted fields panel (shown after generation) */}
                {proposedFraming && !showFramingConfirmation && (
                  <ExtractedFieldsPanel
                    values={{
                      market_category: proposedFraming.market_category,
                      target_customer: proposedFraming.target_customer,
                      business_goal: proposedFraming.business_goal,
                      geography: proposedFraming.geography,
                    }}
                    onUpdate={(updated) => {
                      if (proposedFraming) {
                        setProposedFraming({
                          ...proposedFraming,
                          ...updated,
                        })
                      }
                    }}
                  />
                )}

                {/* Error display */}
                {error && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3" role="alert">
                    <p className="text-sm font-medium text-destructive">{error}</p>
                    {errorDetails && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Couldn't load suggestions. You can still add manually.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </SurfaceCard>
          )}

          {/* Framing confirmation card */}
          {showFramingConfirmation && proposedFraming && (
            <FramingConfirmationCard
              framing={proposedFraming}
              onConfirm={handleConfirmFraming}
              onAdjust={() => setShowFramingConfirmation(false)}
              onUpdate={(updated) => setProposedFraming(updated)}
            />
          )}

          {/* Competitor picker (shown after framing confirmation or if skipping) */}
          {(!showFramingConfirmation || competitors.length > 0) && !showRecommendations && (
            <SurfaceCard className="p-6">
              <CompetitorPicker
                value={competitors}
                onChange={setCompetitors}
                suggested={proposedFraming?.suggested_competitors || []}
                fetchSuggestions={async (query: string) => {
                  try {
                    const response = await fetch('/api/projects/recommend-competitors', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        contextText: query,
                      }),
                    })
                    if (response.ok) {
                      const data = await response.json()
                      if (data.ok && data.recommendations) {
                        return data.recommendations
                      }
                    }
                    return []
                  } catch (err) {
                    console.warn('Failed to fetch suggestions (non-blocking):', err)
                    return []
                  }
                }}
              />
            </SurfaceCard>
          )}

          {/* Legacy entry points (kept for backwards compatibility, hidden by default) */}
          {false && !showRecommendations && (
            <div className="space-y-4">
              {/* Section A: Primary Competitor URL */}
              <SurfaceCard className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Section A — Start with a primary competitor URL (recommended)
                    </p>
                    <label
                      htmlFor="primaryUrl"
                      className="text-sm font-semibold text-foreground"
                    >
                      Primary competitor URL
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll discover market signals and recommend additional competitors.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="primaryUrl"
                      type="url"
                      value={primaryUrl}
                      onChange={(e) => {
                        setPrimaryUrl(e.target.value)
                        setError(null)
                        setErrorDetails(null)
                      }}
                      placeholder="https://example.com"
                      disabled={recommending}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAnalyzeUrl}
                      disabled={recommending || !primaryUrl.trim()}
                    >
                      {recommending ? 'Analyzing...' : 'Analyze this URL'}
                    </Button>
                  </div>
                  {error && (primaryUrl.trim() || errorDetails) && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 space-y-2" role="alert">
                      <p className="text-sm font-medium text-destructive">{error}</p>
                      {errorDetails && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                            {errorDetails?.errorId && (
                              <span className="font-mono">
                                Error ID: <span className="font-semibold">{errorDetails?.errorId}</span>
                              </span>
                            )}
                            {errorDetails?.status && (
                              <span>
                                Status: <span className="font-semibold">{errorDetails?.status}</span>
                              </span>
                            )}
                            {errorDetails?.code && (
                              <span>
                                Code: <span className="font-semibold">{errorDetails?.code}</span>
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAnalyzeUrl}
                            disabled={recommending}
                            className="mt-2"
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SurfaceCard>

              {/* Section B: Freeform Context */}
              <SurfaceCard className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Section B — Or paste context (optional)
                    </p>
                    <label
                      htmlFor="contextText"
                      className="text-sm font-semibold text-foreground"
                    >
                      Paste context
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste notes, a doc excerpt, or a rough description. We'll recommend competitor URLs to scrape.
                    </p>
                  </div>
                  <Textarea
                    id="contextText"
                    value={contextText}
                    onChange={(e) => {
                      setContextText(e.target.value)
                      setError(null)
                      setErrorDetails(null)
                    }}
                    placeholder="Paste notes, a doc excerpt, or a rough description. We'll recommend competitor URLs to scrape."
                    rows={4}
                    disabled={recommending}
                  />
                  <Button
                    type="button"
                    onClick={handleExtractAndRecommend}
                    disabled={recommending || !contextText.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    {recommending ? 'Extracting...' : 'Extract & recommend competitors'}
                  </Button>
                  {error && (contextText.trim() || errorDetails) && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 space-y-2" role="alert">
                      <p className="text-sm font-medium text-destructive">{error}</p>
                      {errorDetails && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                            {errorDetails?.errorId && (
                              <span className="font-mono">
                                Error ID: <span className="font-semibold">{errorDetails?.errorId}</span>
                              </span>
                            )}
                            {errorDetails?.status && (
                              <span>
                                Status: <span className="font-semibold">{errorDetails?.status}</span>
                              </span>
                            )}
                            {errorDetails?.code && (
                              <span>
                                Code: <span className="font-semibold">{errorDetails?.code}</span>
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleExtractAndRecommend}
                            disabled={recommending}
                            className="mt-2"
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SurfaceCard>
            </div>
          )}

          {/* Recommendations Step */}
          {showRecommendations && (
            <CompetitorRecommendations
              recommendations={recommendations}
              onConfirm={handleConfirmAndScrape}
              onAddManual={() => setShowRecommendations(false)}
              loading={scraping}
            />
          )}

          {/* Traditional Form (shown when not in recommendations flow) */}
          {!showRecommendations && (
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
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Project name<span className="text-destructive ml-1">*</span>
                    </label>
                    {suggestedFields.has('name') && (
                      <span className="text-xs text-muted-foreground italic">
                        Suggested from your URL/context — edit anytime
                      </span>
                    )}
                  </div>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    placeholder="e.g. Competitive analysis for streaming platforms"
                    required
                  />
                </div>

                {/* Starting Point Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Starting point
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'product', label: 'I have a product' },
                      { value: 'problem', label: 'I have a problem I want to solve' },
                      { value: 'customer', label: 'I have a customer in mind' },
                      { value: 'market', label: "I'm exploring a market" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('startingPoint', option.value as typeof formState.startingPoint)}
                        className={`
                          p-3 rounded-lg border text-left transition-colors
                          ${
                            formState.startingPoint === option.value
                              ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20'
                              : 'border-border hover:bg-muted/50'
                          }
                        `}
                      >
                        <span className="text-sm font-medium text-foreground">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hypothesis Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="hypothesis"
                    className="text-sm font-semibold text-foreground"
                  >
                    What are you trying to test or learn?
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <Textarea
                    id="hypothesis"
                    name="hypothesis"
                    value={formState.hypothesis}
                    onChange={(event) => handleChange('hypothesis', event.target.value)}
                    placeholder={
                      formState.startingPoint === 'product'
                        ? 'Will we win against X by focusing on Y?'
                        : formState.startingPoint === 'problem'
                        ? 'Is scheduling the #1 pain for boutique gym owners?'
                        : formState.startingPoint === 'customer'
                        ? 'What do HR ops teams struggle with most in onboarding?'
                        : 'Where is incident management overbuilt or underdelivering?'
                    }
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Frame your analysis around a testable hypothesis or learning goal.
                  </p>
                </div>

                {/* Optional: Sharpen the analysis - conditional fields based on starting point */}
                <Collapsible
                  title="Optional: Sharpen the analysis"
                  description="Add context to improve analysis quality"
                  defaultOpen={false}
                >
                  <div className="space-y-4 pt-2">
                    {formState.startingPoint === 'product' && (
                      <>
                        <div className="space-y-2">
                          <label
                            htmlFor="solutionIdea"
                            className="text-sm font-semibold text-foreground"
                          >
                            Your product / solution idea
                          </label>
                          <Textarea
                            id="solutionIdea"
                            name="solutionIdea"
                            value={formState.solutionIdea}
                            onChange={(event) => handleChange('solutionIdea', event.target.value)}
                            placeholder="Describe your product or solution idea"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                    {formState.startingPoint === 'problem' && (
                      <div className="space-y-2">
                        <label
                          htmlFor="problemStatement"
                          className="text-sm font-semibold text-foreground"
                        >
                          Problem statement
                        </label>
                        <Textarea
                          id="problemStatement"
                          name="problemStatement"
                          value={formState.problemStatement}
                          onChange={(event) => handleChange('problemStatement', event.target.value)}
                          placeholder="Describe the problem you want to solve"
                          rows={2}
                        />
                      </div>
                    )}
                    {formState.startingPoint === 'customer' && (
                      <div className="space-y-2">
                        <label
                          htmlFor="customerProfile"
                          className="text-sm font-semibold text-foreground"
                        >
                          Customer profile
                        </label>
                        <Textarea
                          id="customerProfile"
                          name="customerProfile"
                          value={formState.customerProfile}
                          onChange={(event) => handleChange('customerProfile', event.target.value)}
                          placeholder="Describe the customer you have in mind"
                          rows={2}
                        />
                      </div>
                    )}
                    {formState.startingPoint === 'market' && (
                      <div className="space-y-2">
                        <label
                          htmlFor="marketContext"
                          className="text-sm font-semibold text-foreground"
                        >
                          Market context
                        </label>
                        <Textarea
                          id="marketContext"
                          name="marketContext"
                          value={formState.marketContext}
                          onChange={(event) => handleChange('marketContext', event.target.value)}
                          placeholder="Describe the market or category you're exploring"
                          rows={2}
                        />
                      </div>
                    )}
                    {/* Geography field - shown for all starting points */}
                    <div className="space-y-2">
                      <label
                        htmlFor="geographyOptional"
                        className="text-sm font-semibold text-foreground"
                      >
                        Geography
                      </label>
                      <Input
                        id="geographyOptional"
                        name="geographyOptional"
                        value={formState.geography}
                        onChange={(event) => handleChange('geography', event.target.value)}
                        placeholder="e.g. North America and Western Europe"
                      />
                    </div>
                    {/* Confidence field */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-foreground">
                          Confidence
                        </label>
                      </div>
                      <RadioGroup
                        name="inputConfidenceOptional"
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
                            description: 'Some inputs are assumptions or best guesses',
                          },
                          {
                            value: 'exploratory',
                            label: 'Exploring',
                            description: 'Early exploration, many unknowns',
                          },
                        ]}
                      />
                    </div>
                  </div>
                </Collapsible>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="marketCategory"
                      className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Market / category
                      <span className="text-destructive ml-1">*</span>
                    </label>
                    {suggestedFields.has('marketCategory') && (
                      <span className="text-xs text-muted-foreground italic">
                        Suggested from your URL/context — edit anytime
                      </span>
                    )}
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="targetCustomer"
                      className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Target customer
                      <span className="text-destructive ml-1">*</span>
                    </label>
                    {suggestedFields.has('targetCustomer') && (
                      <span className="text-xs text-muted-foreground italic">
                        Suggested from your URL/context — edit anytime
                      </span>
                    )}
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="goal"
                      className="text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Business goal
                      <span className="text-destructive ml-1">*</span>
                    </label>
                    {suggestedFields.has('goal') && (
                      <span className="text-xs text-muted-foreground italic">
                        Suggested from your URL/context — edit anytime
                      </span>
                    )}
                  </div>
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
                      <WhyTooltip content="This helps Plinth prioritize tradeoffs the same way an exec review would. It focuses the analysis on constraints that matter most to your decision." />
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
                      <WhyTooltip content="This shifts recommendations between near-term traction and long-term defensibility. Choose based on whether you need quick wins or sustainable competitive advantage." />
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
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-foreground">
                        Ambition level
                      </label>
                      <WhyTooltip content="This sets the scope of change: core optimization (improve existing), adjacent expansion (new segments), or category redefinition (create new category)." />
                    </div>
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
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-foreground">
                        Input confidence
                      </label>
                      <WhyTooltip content="This calibrates the analysis based on how certain you are about your inputs. Higher confidence leads to more definitive recommendations." />
                    </div>
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
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 space-y-2" role="alert">
                <p className="text-sm font-medium text-destructive">{error}</p>
                {errorDetails && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                      {errorDetails.errorId && (
                        <span className="font-mono">
                          Error ID: <span className="font-semibold">{errorDetails.errorId}</span>
                        </span>
                      )}
                      {errorDetails.status && (
                        <span>
                          Status: <span className="font-semibold">{errorDetails.status}</span>
                        </span>
                      )}
                      {errorDetails.code && (
                        <span>
                          Code: <span className="font-semibold">{errorDetails.code}</span>
                        </span>
                      )}
                    </div>
                    {(errorDetails.errorId || errorDetails.status) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (primaryUrl.trim()) {
                            handleAnalyzeUrl()
                          } else if (contextText.trim()) {
                            handleExtractAndRecommend()
                          }
                        }}
                        className="mt-2"
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                )}
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
          )}
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

