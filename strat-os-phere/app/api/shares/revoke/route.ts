import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeShareLink } from '@/lib/shares'

export const runtime = 'nodejs'

/**
 * POST /api/shares/revoke
 * Revokes a share link for a project
 * 
 * Request body: { projectId: string }
 * Response: { ok: true } | { error: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to revoke share links.' },
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

    await revokeShareLink(supabase, projectId, user.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Revoke share link error:', error)
    return NextResponse.json(
      {
        error: 'Failed to revoke share link',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

