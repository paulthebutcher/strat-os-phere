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
import { getProjectById } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

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

  const project = await getProjectById(supabase, projectId)

  if (!project || project.user_id !== user.id) {
    redirect('/dashboard')
  }

  return { supabase, user, project }
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


