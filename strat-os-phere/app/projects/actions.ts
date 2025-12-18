'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { createProject } from '@/lib/data/projects'

interface CreateProjectPayload {
  name: string
  marketCategory: string
  targetCustomer: string
  product?: string
  goal?: string
  geography?: string
}

interface CreateProjectResult {
  success: boolean
  projectId?: string
  message?: string
}

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

  try {
    const project = await createProject(supabase, {
      user_id: user.id,
      name: payload.name,
      market: payload.marketCategory,
      target_customer: payload.targetCustomer,
      your_product: payload.product ?? null,
      business_goal: payload.goal ?? null,
      geography: payload.geography ?? null,
    })

    return { success: true, projectId: project.id }
  } catch (error) {
    // Temporary logging to aid Supabase debugging
    console.error('Failed to create project', error)

    const message =
      error instanceof Error ? error.message : 'Failed to create project.'

    return { success: false, message }
  }
}


