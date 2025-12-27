'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  MAX_COMPETITORS_PER_PROJECT,
  MAX_EVIDENCE_CHARS,
} from '@/lib/constants'
import {
  createCompetitor,
  deleteCompetitor,
  getCompetitorById,
  listCompetitorsForProject,
  updateCompetitor,
} from '@/lib/data/competitors'
import { loadProject } from '@/lib/projects/loadProject'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { getLatestProjectInput, updateProjectInput, upsertProjectInput } from '@/lib/data/projectInputs'
import { tavilySearch } from '@/lib/tavily/client'

type ActionResult = {
  success: boolean
  message?: string
}

interface BaseCompetitorPayload {
  name: string
  website?: string
  evidence: string
}

function sanitizeString(value: string | undefined | null): string {
  return value?.trim() ?? ''
}

function normalizeOptional(value: string | undefined | null): string | null {
  const trimmed = sanitizeString(value)
  return trimmed.length ? trimmed : null
}

async function requireProjectAccess(projectId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const projectResult = await loadProject(supabase, projectId, user.id)

  if (!projectResult.ok) {
    redirect('/dashboard')
  }

  return { supabase, user, project: projectResult.project }
}

export async function createCompetitorForProject(
  projectId: string,
  payload: BaseCompetitorPayload
): Promise<ActionResult> {
  const { supabase } = await requireProjectAccess(projectId)

  const name = sanitizeString(payload.name)
  const website = normalizeOptional(payload.website)
  const evidence = sanitizeString(payload.evidence)

  if (!name) {
    return { success: false, message: 'Competitor name is required.' }
  }

  if (!evidence) {
    return { success: false, message: 'Evidence is required.' }
  }

  if (evidence.length > MAX_EVIDENCE_CHARS) {
    return {
      success: false,
      message: `Evidence must be at most ${MAX_EVIDENCE_CHARS.toLocaleString()} characters.`,
    }
  }

  const existing = await listCompetitorsForProject(supabase, projectId)

  if (existing.length >= MAX_COMPETITORS_PER_PROJECT) {
    return {
      success: false,
      message: `You can add up to ${MAX_COMPETITORS_PER_PROJECT} competitors per analysis.`,
    }
  }

  try {
    await createCompetitor(supabase, {
      project_id: projectId,
      name,
      url: website,
      evidence_text: evidence,
    })

    revalidatePath(`/projects/${projectId}/competitors`)

    return { success: true }
  } catch (error) {
    logger.error('Failed to create competitor', error)

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to add competitor. Please try again.'

    return { success: false, message }
  }
}

export async function updateCompetitorForProject(
  projectId: string,
  competitorId: string,
  payload: BaseCompetitorPayload
): Promise<ActionResult> {
  const { supabase } = await requireProjectAccess(projectId)

  const existing = await getCompetitorById(supabase, competitorId)

  if (!existing || existing.project_id !== projectId) {
    return { success: false, message: 'Competitor not found.' }
  }

  const name = sanitizeString(payload.name)
  const website = normalizeOptional(payload.website)
  const evidence = sanitizeString(payload.evidence)

  if (!name) {
    return { success: false, message: 'Competitor name is required.' }
  }

  if (!evidence) {
    return { success: false, message: 'Evidence is required.' }
  }

  if (evidence.length > MAX_EVIDENCE_CHARS) {
    return {
      success: false,
      message: `Evidence must be at most ${MAX_EVIDENCE_CHARS.toLocaleString()} characters.`,
    }
  }

  try {
    await updateCompetitor(supabase, competitorId, {
      name,
      url: website,
      evidence_text: evidence,
    })

    revalidatePath(`/projects/${projectId}/competitors`)

    return { success: true }
  } catch (error) {
    logger.error('Failed to update competitor', error)

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to update competitor. Please try again.'

    return { success: false, message }
  }
}

export async function deleteCompetitorForProject(
  projectId: string,
  competitorId: string
): Promise<ActionResult> {
  const { supabase } = await requireProjectAccess(projectId)

  const existing = await getCompetitorById(supabase, competitorId)

  if (!existing || existing.project_id !== projectId) {
    return { success: false, message: 'Competitor not found.' }
  }

  try {
    await deleteCompetitor(supabase, competitorId)

    revalidatePath(`/projects/${projectId}/competitors`)

    return { success: true }
  } catch (error) {
    logger.error('Failed to delete competitor', error)

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to delete competitor. Please try again.'

    return { success: false, message }
  }
}

/**
 * Add competitor from search result (name + url only, no evidence)
 */
export async function addCompetitorFromSearch(
  projectId: string,
  payload: { name: string; url: string }
): Promise<ActionResult> {
  const { supabase } = await requireProjectAccess(projectId)

  const name = sanitizeString(payload.name)
  const website = sanitizeString(payload.url)

  if (!name) {
    return { success: false, message: 'Competitor name is required.' }
  }

  if (!website) {
    return { success: false, message: 'Website URL is required.' }
  }

  const existing = await listCompetitorsForProject(supabase, projectId)

  if (existing.length >= MAX_COMPETITORS_PER_PROJECT) {
    return {
      success: false,
      message: `You can add up to ${MAX_COMPETITORS_PER_PROJECT} competitors per analysis.`,
    }
  }

  // Check for duplicate URL
  const normalizedWebsite = website.toLowerCase().trim()
  const hasDuplicate = existing.some(
    (c) => c.url?.toLowerCase().trim() === normalizedWebsite
  )

  if (hasDuplicate) {
    return { success: false, message: 'This competitor is already added.' }
  }

  try {
    await createCompetitor(supabase, {
      project_id: projectId,
      name,
      url: website,
      evidence_text: null, // Evidence collected later
    })

    revalidatePath(`/projects/${projectId}/competitors`)

    return { success: true }
  } catch (error) {
    logger.error('Failed to create competitor from search', error)

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to add competitor. Please try again.'

    return { success: false, message }
  }
}

/**
 * Confirm suggested competitors: resolve URLs and create competitors
 * This is called after user explicitly confirms the suggested competitor names
 */
export async function confirmSuggestedCompetitors(
  projectId: string,
  selectedNames: string[]
): Promise<ActionResult> {
  const { supabase } = await requireProjectAccess(projectId)

  if (!selectedNames || selectedNames.length === 0) {
    return { success: false, message: 'Please select at least one competitor.' }
  }

  const existing = await listCompetitorsForProject(supabase, projectId)

  if (existing.length + selectedNames.length > MAX_COMPETITORS_PER_PROJECT) {
    return {
      success: false,
      message: `You can add up to ${MAX_COMPETITORS_PER_PROJECT} competitors per analysis.`,
    }
  }

  try {
    // Resolve URLs for each selected name
    const competitorsToAdd: Array<{ name: string; url: string }> = []

    for (const name of selectedNames) {
      if (!name || !name.trim()) continue

      // Call the competitors suggest API to resolve URL
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/competitors/suggest`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: name.trim(),
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.ok && Array.isArray(data.candidates) && data.candidates.length > 0) {
          // Use the first (highest scoring) candidate
          const candidate = data.candidates[0]
          if (candidate.url) {
            competitorsToAdd.push({
              name: candidate.name || name.trim(),
              url: candidate.url,
            })
            continue
          }
        }
      }

      // Fallback: create competitor with placeholder URL if resolution fails
      competitorsToAdd.push({
        name: name.trim(),
        url: `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
      })
    }

    // Create all competitors
    for (const competitor of competitorsToAdd) {
      // Check for duplicates
      const normalizedUrl = competitor.url.toLowerCase().trim()
      const hasDuplicate = existing.some(
        (c) => c.url?.toLowerCase().trim() === normalizedUrl
      )

      if (!hasDuplicate) {
        await createCompetitor(supabase, {
          project_id: projectId,
          name: competitor.name,
          url: competitor.url,
          evidence_text: null, // Evidence collected later
        })
      }
    }

    // Set competitorsConfirmedAt timestamp in project inputs
    // This creates an explicit contract that Step 3 can enforce
    try {
      const inputResult = await getLatestProjectInput(supabase, projectId)
      if (inputResult.ok && inputResult.data) {
        await updateProjectInput(
          supabase,
          inputResult.data.id,
          {
            competitorsConfirmedAt: new Date().toISOString(),
            competitorsConfirmed: true,
          }
        )
      } else {
        // If no input exists yet, create one with confirmation
        const { createDraftProjectInput } = await import('@/lib/data/projectInputs')
        await createDraftProjectInput(supabase, projectId, {
          competitorsConfirmedAt: new Date().toISOString(),
          competitorsConfirmed: true,
        })
      }
    } catch (error) {
      // Log but don't fail - confirmation is best effort
      logger.error('Failed to set competitorsConfirmedAt', { projectId, error })
    }

    // Dev-only logging
    if (process.env.NODE_ENV !== 'production') {
      logger.info('[flow] step2 competitors confirmed', {
        projectId,
        selectedCount: selectedNames.length,
        createdCount: competitorsToAdd.length,
      })
    }

    revalidatePath(`/projects/${projectId}/competitors`)

    return { success: true }
  } catch (error) {
      logger.error('Failed to confirm suggested competitors', error)

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to add competitors. Please try again.'

    return { success: false, message }
  }
}

/**
 * Refresh competitor suggestions using Tavily search
 * Reads decision context from project_inputs and saves suggestions
 * Never throws - always returns success/error result
 */
export async function refreshCompetitorSuggestions(
  projectId: string
): Promise<ActionResult & { suggestions?: string[] }> {
  const { supabase } = await requireProjectAccess(projectId)

  try {
    // 1. Load decision context from project inputs
    const inputResult = await getLatestProjectInput(supabase, projectId)
    
    if (!inputResult.ok || !inputResult.data) {
      return {
        success: false,
        message: 'No decision context found. Complete Step 1 first.',
      }
    }

    const inputs = inputResult.data.input_json as Record<string, any>
    
    // Extract company name and context
    const companyName = inputs.your_product || inputs.companyName || ''
    const market = inputs.market || ''
    const hypothesis = inputs.hypothesis || inputs.decision || inputs.decisionText || ''
    
    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      return {
        success: false,
        message: 'Company name is required. Complete Step 1 first.',
      }
    }

    // 2. Build Tavily query
    let query = `${companyName.trim()} alternatives competitors`
    if (market && typeof market === 'string') {
      query = `${market.trim()} ${query}`
    }
    if (hypothesis && typeof hypothesis === 'string') {
      // Use first sentence or first 50 chars of hypothesis for context
      const contextSnippet = hypothesis.split('.')[0].substring(0, 50).trim()
      if (contextSnippet) {
        query = `${contextSnippet} ${query}`
      }
    }

    // 3. Call Tavily (defensive - catch all errors)
    let tavilyResults: Array<{ title?: string; url: string; content?: string }> = []
    
    try {
      const searchResult = await tavilySearch({
        query: query.trim(),
        maxResults: 10,
        searchDepth: 'basic',
      })
      tavilyResults = searchResult.results || []
    } catch (error) {
      logger.error('[competitors] Tavily search failed', { projectId, error })
      return {
        success: false,
        message: 'Failed to search for competitors. Please try again later.',
      }
    }

    if (tavilyResults.length === 0) {
      return {
        success: false,
        message: 'No competitors found. Try adding them manually.',
        suggestions: [],
      }
    }

    // 4. Extract and normalize competitor names
    const seenNames = new Set<string>()
    const suggestions: string[] = []
    const userCompanyLower = companyName.toLowerCase().trim()

    for (const result of tavilyResults.slice(0, 8)) {
      if (!result.url) continue

      try {
        const urlObj = new URL(result.url.startsWith('http') ? result.url : `https://${result.url}`)
        const domain = urlObj.hostname.replace(/^www\./, '')
        
        // Extract name from title or domain
        let name = result.title || domain.split('.')[0] || domain
        
        // Clean up name
        name = name
          .replace(/^(top|best|the)\s+/i, '')
          .replace(/\s+(alternatives?|competitors?|vs|comparison).*$/i, '')
          .trim()

        // Skip if empty, too long, duplicate, or matches user's company
        const nameLower = name.toLowerCase()
        if (
          name.length === 0 ||
          name.length >= 50 ||
          seenNames.has(nameLower) ||
          nameLower === userCompanyLower ||
          domain.includes(userCompanyLower.replace(/\s+/g, ''))
        ) {
          continue
        }

        seenNames.add(nameLower)
        suggestions.push(name)
      } catch {
        // Skip invalid URLs
        continue
      }
    }

    if (suggestions.length === 0) {
      return {
        success: false,
        message: 'No valid competitors found. Try adding them manually.',
        suggestions: [],
      }
    }

    // 5. Save suggestions to project_inputs
    try {
      const inputId = inputResult.data.id
      await updateProjectInput(supabase, inputId, {
        suggestedCompetitorNames: suggestions,
      })
    } catch (error) {
      logger.error('[competitors] Failed to save suggestions', { projectId, error })
      // Still return success with suggestions - they can be used even if save fails
    }

    revalidatePath(`/projects/${projectId}/competitors`)

    return {
      success: true,
      suggestions,
    }
  } catch (error) {
    logger.error('[competitors] refreshCompetitorSuggestions failed', { projectId, error })
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to refresh suggestions',
    }
  }
}
