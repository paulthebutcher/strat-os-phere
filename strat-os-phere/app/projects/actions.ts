'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { createProjectSafe } from '@/lib/data/projectsContract'
import {
  createDraftProjectInput,
  finalizeProjectInput,
} from '@/lib/data/projectInputs'
import type {
  RiskPosture,
  AmbitionLevel,
  DecisionLevel,
  InputConfidence,
} from '@/lib/supabase/types'

import type { Json } from '@/lib/supabase/types'

interface CreateProjectPayload {
  name: string
  marketCategory?: string
  targetCustomer?: string
  product?: string
  goal?: string
  geography?: string
  primaryConstraint?: string
  riskPosture?: RiskPosture
  ambitionLevel?: AmbitionLevel
  organizationalCapabilities?: string
  decisionLevel?: DecisionLevel
  explicitNonGoals?: string
  inputConfidence?: InputConfidence
  // Onboarding fields from Step 1
  primaryCompanyName?: string
  contextText?: string
  decisionFraming?: {
    decision: string
    audience?: string
    audienceOtherText?: string
    yourProduct?: string
    horizon?: string
  }
  resolvedSources?: Array<{
    label: string
    url: string
    type: string
    confidence: string
    enabled: boolean
  }>
  suggestedCompetitors?: Array<{
    name: string
    url?: string
    domain?: string
    confidence: string
    rationale?: string
  }>
  selectedCompetitors?: Array<{
    name: string
    url: string
  }>
  evidenceWindowDays?: number
  pricingModel?: string
  // Note: hypothesis, startingPoint, customerProfile, problemStatement, 
  // marketContext, solutionIdea columns do not exist in production.
  // Store these in project_inputs.input_json instead.
}

interface CreateProjectResult {
  success: boolean
  projectId?: string
  message?: string
}

/**
 * Create project with only stable fields (name, user_id).
 * All evolving fields are saved to project_inputs table.
 */
export async function createProjectFromForm(
  payload: CreateProjectPayload
): Promise<CreateProjectResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Step 1: Create project with ONLY stable fields
  const result = await createProjectSafe(supabase, {
    user_id: user.id,
    name: payload.name,
    // Do NOT write evolving fields to projects table:
    // - market, target_customer, your_product, business_goal, geography
    // - primary_constraint, risk_posture, ambition_level, etc.
    // All of these go into project_inputs.input_json instead
  })

  if (!result.ok) {
    return {
      success: false,
      message: result.error.message || 'Failed to create project.',
    }
  }

  const projectId = result.data.id

  // Step 2: Save all evolving fields to project_inputs
  const inputJson: Record<string, any> = {
    // Step 3 fields
    marketCategory: payload.marketCategory,
    targetCustomer: payload.targetCustomer,
    product: payload.product,
    goal: payload.goal,
    geography: payload.geography,
    primaryConstraint: payload.primaryConstraint,
    pricingModel: payload.pricingModel,
    // Step 1 fields
    primaryCompanyName: payload.primaryCompanyName,
    contextText: payload.contextText,
    decisionFraming: payload.decisionFraming,
    resolvedSources: payload.resolvedSources,
    suggestedCompetitors: payload.suggestedCompetitors,
    selectedCompetitors: payload.selectedCompetitors,
    evidenceWindowDays: payload.evidenceWindowDays,
    // Additional fields (if provided)
    riskPosture: payload.riskPosture,
    ambitionLevel: payload.ambitionLevel,
    organizationalCapabilities: payload.organizationalCapabilities,
    decisionLevel: payload.decisionLevel,
    explicitNonGoals: payload.explicitNonGoals,
    inputConfidence: payload.inputConfidence,
  }

  // Remove undefined values
  const cleanedInputJson: Record<string, any> = {}
  for (const [key, value] of Object.entries(inputJson)) {
    if (value !== undefined) {
      cleanedInputJson[key] = value
    }
  }

  // Create draft project input
  const inputResult = await createDraftProjectInput(
    supabase,
    projectId,
    cleanedInputJson
  )

  if (!inputResult.ok) {
    // Log error but don't fail project creation
    console.error('Failed to create project input:', inputResult.error)
    // Continue - project is created, input can be added later
  } else {
    // Finalize the input since this is the completion of onboarding
    await finalizeProjectInput(supabase, inputResult.data.id)
  }

  return { success: true, projectId }
}

/**
 * Create a new analysis - always creates a fresh project.
 * This is the dedicated entry point for "New Analysis" button clicks.
 * No resume logic, no reuse of existing projects.
 */
export async function createNewAnalysis(): Promise<CreateProjectResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Generate a default project name
  const defaultName = `New Analysis - ${new Date().toLocaleDateString()}`

  // Create project with ONLY stable fields (name, user_id)
  const result = await createProjectSafe(supabase, {
    user_id: user.id,
    name: defaultName,
  })

  if (!result.ok) {
    return {
      success: false,
      message: result.error.message || 'Failed to create project.',
    }
  }

  const projectId = result.data.id

  // Return success - project is created, ready for Step 1
  return { success: true, projectId }
}


