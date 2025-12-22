import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createShareLink } from '@/lib/shares'
import { getOrigin } from '@/lib/server/origin'

export const runtime = 'nodejs'

/**
 * POST /api/shares/create
 * Creates a share link for a project
 * 
 * Request body: { projectId: string }
 * Response: { url: string } | { error: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to create share links.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const projectId = body.projectId as string | undefined

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    const { shareToken } = await createShareLink(supabase, projectId, user.id)
    const origin = await getOrigin()
    const url = `${origin}/share/${shareToken}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Create share link error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create share link',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

