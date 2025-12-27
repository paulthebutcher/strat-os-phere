/**
 * Competitors Page ViewModel Builder
 * 
 * Defensive data model that never throws and always returns a valid model
 * even when data is missing or queries fail.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getLatestProjectInput } from '@/lib/data/projectInputs'
import { loadProject } from '@/lib/projects/loadProject'
import { logger } from '@/lib/logger'
import { normalizeUrl } from '@/lib/url/normalizeUrl'

export type SuggestionsStatus =
  | { state: 'ready'; source: 'step1' | 'refresh'; count: number }
  | { state: 'empty'; reason?: 'no_step1_context' | 'no_results' }
  | { state: 'error'; code: string; message: string; recoverable: boolean }

export type CompetitorsPageModel = {
  projectId: string
  decisionSummary?: {
    decisionText?: string
    companyName?: string
    marketCategory?: string
  }
  existingCompetitors: Array<{
    id: string
    name: string
    url?: string
    logoUrl?: string | null
    source: 'manual' | 'suggested'
    selected?: boolean
  }>
  suggestions: Array<{
    name: string
    url?: string
    logoUrl?: string | null
    confidence?: 'high' | 'medium' | 'low'
    reason?: string
  }>
  suggestionsStatus: SuggestionsStatus
  state: {
    canSuggest: boolean
    isEmpty: boolean
    hasDecisionContext: boolean
  }
  errors: {
    decisionLoad?: string
    competitorsLoad?: string
    suggestionsLoad?: string
  }
}

/**
 * Extract domain from URL for logo generation
 */
function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const normalized = normalizeUrl(url)
    if (!normalized.ok) return null
    const urlObj = new URL(normalized.url)
    return urlObj.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}

/**
 * Generate logo URL from domain (favicon fallback)
 */
function getLogoUrl(domain: string | null): string | null {
  if (!domain) return null
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

/**
 * Extract decision context from project inputs
 */
function extractDecisionContext(inputJson: Record<string, any>): {
  decisionText?: string
  companyName?: string
  marketCategory?: string
} {
  const context: {
    decisionText?: string
    companyName?: string
    marketCategory?: string
  } = {}

  // Extract company name (your_product or companyName)
  if (inputJson.your_product) {
    context.companyName = String(inputJson.your_product).trim()
  } else if (inputJson.companyName) {
    context.companyName = String(inputJson.companyName).trim()
  }

  // Extract market category
  if (inputJson.market) {
    context.marketCategory = String(inputJson.market).trim()
  }

  // Extract decision text (hypothesis, decision, or decisionText)
  if (inputJson.hypothesis) {
    context.decisionText = String(inputJson.hypothesis).trim()
  } else if (inputJson.decision) {
    context.decisionText = String(inputJson.decision).trim()
  } else if (inputJson.decisionText) {
    context.decisionText = String(inputJson.decisionText).trim()
  }

  return context
}

/**
 * Build the competitors page view model with defensive error handling
 */
export async function getCompetitorsPageModel(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<CompetitorsPageModel> {
  const model: CompetitorsPageModel = {
    projectId,
    existingCompetitors: [],
    suggestions: [],
    suggestionsStatus: { state: 'empty', reason: 'no_step1_context' },
    state: {
      canSuggest: false,
      isEmpty: true,
      hasDecisionContext: false,
    },
    errors: {},
  }

  // 1. Load project (for auth check, but don't fail if it errors)
  let projectName = ''
  try {
    const projectResult = await loadProject(supabase, projectId)
    if (projectResult.ok) {
      projectName = projectResult.project.name
    } else if (projectResult.kind === 'unauthorized') {
      model.errors.decisionLoad = 'You do not have access to this project'
      return model
    } else if (projectResult.kind === 'not_found') {
      model.errors.decisionLoad = 'Project not found'
      return model
    }
  } catch (error) {
    logger.error('[competitors] Failed to load project', { projectId, error })
    model.errors.decisionLoad = 'Failed to load project'
    // Continue - we can still show manual add
  }

  // 2. Load decision context from project inputs (defensive)
  let decisionContext: {
    decisionText?: string
    companyName?: string
    marketCategory?: string
  } = {}
  let suggestedCompetitorNames: string[] = []

  try {
    const inputResult = await getLatestProjectInput(supabase, projectId)
    if (inputResult.ok && inputResult.data?.input_json) {
      const inputs = inputResult.data.input_json as Record<string, any>
      
      // Extract decision context
      decisionContext = extractDecisionContext(inputs)
      
      // Extract suggested competitor names
      if (Array.isArray(inputs.suggestedCompetitorNames)) {
        suggestedCompetitorNames = inputs.suggestedCompetitorNames.filter(
          (name): name is string => typeof name === 'string' && name.trim().length > 0
        )
      }
    }
  } catch (error) {
    logger.error('[competitors] Failed to load project inputs', { projectId, error })
    model.errors.decisionLoad = 'Failed to load decision context'
    // Continue - manual add still works
  }

  // Update decision context in model
  if (decisionContext.companyName || decisionContext.decisionText || decisionContext.marketCategory) {
    model.decisionSummary = decisionContext
    model.state.hasDecisionContext = true
    model.state.canSuggest = true
  }

  // 3. Load existing competitors (defensive - never throw)
  try {
    const competitors = await listCompetitorsForProject(supabase, projectId)
    model.existingCompetitors = (competitors || []).map((c) => {
      const domain = extractDomain(c.url)
      return {
        id: c.id,
        name: c.name,
        url: c.url || undefined,
        logoUrl: getLogoUrl(domain),
        source: 'manual' as const, // We don't track source in DB, default to manual
      }
    })
    model.state.isEmpty = model.existingCompetitors.length === 0
  } catch (error) {
    logger.error('[competitors] Failed to load competitors', { projectId, error })
    model.errors.competitorsLoad = 'Failed to load competitors list'
    // Continue - we can still show manual add
  }

  // 4. Process suggestions from saved names and determine status (defensive)
  if (suggestedCompetitorNames.length > 0) {
    // Convert saved names to suggestion objects
    // URLs will be resolved when user confirms, but we can show names now
    model.suggestions = suggestedCompetitorNames.map((name) => {
      // Try to infer domain from name for logo
      const inferredDomain = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.-]/g, '')
      return {
        name: name.trim(),
        logoUrl: inferredDomain ? getLogoUrl(inferredDomain) : null,
        confidence: 'medium' as const,
      }
    })
    
    // Determine source: if decision context exists, likely from step1; otherwise refresh
    // We can't know for sure, but default to 'step1' if we have context
    const source: 'step1' | 'refresh' = model.state.hasDecisionContext ? 'step1' : 'refresh'
    model.suggestionsStatus = {
      state: 'ready',
      source,
      count: suggestedCompetitorNames.length,
    }
  } else if (model.state.hasDecisionContext) {
    // No suggestions saved, but we have context - can suggest
    model.suggestionsStatus = {
      state: 'empty',
      reason: 'no_results',
    }
  } else {
    // No context, can't suggest
    model.suggestionsStatus = {
      state: 'empty',
      reason: 'no_step1_context',
    }
  }

  return model
}

