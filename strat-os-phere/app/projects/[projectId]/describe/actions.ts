'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { loadProject } from '@/lib/projects/loadProject'
import { createClient } from '@/lib/supabase/server'
import { createDraftProjectInput, finalizeProjectInput } from '@/lib/data/projectInputs'
import { logger } from '@/lib/logger'

interface SubmitDescribePayload {
  primaryCompanyName: string
  contextText?: string
  decisionFraming?: {
    decision: string
    audience?: string
    audienceOtherText?: string
    yourProduct?: string
    horizon?: string
  }
  marketCategory?: string
}

type ActionResult = {
  success: boolean
  message?: string
  suggestedCompetitorNames?: string[]
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

/**
 * Submit Step 1 (describe) and infer competitor names only (no URL resolution)
 */
export async function submitDescribeStep(
  projectId: string,
  payload: SubmitDescribePayload
): Promise<ActionResult> {
  const { supabase } = await requireProjectAccess(projectId)

  const primaryCompanyName = payload.primaryCompanyName?.trim()
  if (!primaryCompanyName) {
    return { success: false, message: 'Company name is required.' }
  }

  try {
    // Save project inputs
    const inputJson: Record<string, any> = {
      primaryCompanyName,
      contextText: payload.contextText?.trim() || undefined,
      decisionFraming: payload.decisionFraming,
      marketCategory: payload.marketCategory?.trim() || undefined,
    }

    // Remove undefined values
    const cleanedInputJson: Record<string, any> = {}
    for (const [key, value] of Object.entries(inputJson)) {
      if (value !== undefined) {
        cleanedInputJson[key] = value
      }
    }

    // Create or update project input
    const inputResult = await createDraftProjectInput(
      supabase,
      projectId,
      cleanedInputJson
    )

    if (!inputResult.ok) {
      logger.error('Failed to save project input', { error: inputResult.error })
      return {
        success: false,
        message: 'Failed to save project context. Please try again.',
      }
    }

    // Infer competitor names only (no URL resolution)
    const competitorNames = await inferCompetitorNames(
      primaryCompanyName,
      payload.contextText
    )

    // Store suggested competitor names in project input
    if (competitorNames.length > 0) {
      const updatedInputJson = {
        ...cleanedInputJson,
        suggestedCompetitorNames: competitorNames,
      }
      await createDraftProjectInput(supabase, projectId, updatedInputJson)
    }

    revalidatePath(`/projects/${projectId}/describe`)
    revalidatePath(`/projects/${projectId}/competitors`)

    return {
      success: true,
      suggestedCompetitorNames: competitorNames,
    }
  } catch (error) {
    logger.error('Failed to submit describe step', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit. Please try again.',
    }
  }
}

/**
 * Infer competitor company names only (no URL resolution)
 * This is a lightweight operation that returns names as suggestions
 * 
 * Uses Tavily search directly to avoid HTTP calls from server actions
 */
async function inferCompetitorNames(
  companyName: string,
  contextText?: string
): Promise<string[]> {
  try {
    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (!tavilyApiKey) {
      logger.warn('Tavily API key not configured')
      return []
    }

    // Build query for competitors
    let competitorQuery = `${companyName} alternatives competitors`
    if (contextText) {
      competitorQuery = `${companyName} ${contextText} alternatives competitors`
    }

    // Call Tavily directly
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: competitorQuery,
        max_results: 10,
        search_depth: 'basic',
      }),
    })

    if (!response.ok) {
      logger.warn('Failed to infer competitor names from Tavily', { status: response.status })
      return []
    }

    const data = await response.json()
    const results = data.results || []

    // Extract unique company names from results
    const seenNames = new Set<string>()
    const names: string[] = []

    for (const result of results.slice(0, 8)) {
      if (!result.url) continue

      try {
        const urlObj = new URL(result.url.startsWith('http') ? result.url : `https://${result.url}`)
        const domain = urlObj.hostname.replace(/^www\./, '')

        // Extract name from title or domain
        let name = result.title || domain.split('.')[0] || domain
        
        // Clean up name (remove common aggregator keywords)
        name = name
          .replace(/^(top|best|the)\s+/i, '')
          .replace(/\s+(alternatives?|competitors?|vs|comparison).*$/i, '')
          .trim()

        if (name && name.length > 0 && name.length < 50 && !seenNames.has(name.toLowerCase())) {
          seenNames.add(name.toLowerCase())
          names.push(name)
        }
      } catch {
        // Skip invalid URLs
        continue
      }
    }

    return names.slice(0, 8)
  } catch (error) {
    logger.error('Error inferring competitor names', error)
    return []
  }
}

