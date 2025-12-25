import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteProjectSafe } from '@/lib/data/projectsContract'
import { toAppError, UnauthorizedError, NotFoundError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'

/**
 * Response type matching what the client expects
 */
type DeleteProjectResult =
  | { ok: true }
  | { ok: false; message: string; details?: Record<string, unknown> }

/**
 * DELETE /api/projects/[projectId]
 * Permanently deletes a project and all associated data
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<DeleteProjectResult>> {
  const { projectId } = await params
  
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      const appError = new UnauthorizedError('You must be authenticated to delete a project')
      logAppError('api.projects.delete', appError, { projectId })
      return NextResponse.json(
        {
          ok: false,
          message: appError.userMessage,
        },
        { status: 401 }
      )
    }

    // Verify project exists and belongs to user
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      const appError = new NotFoundError('Project not found')
      logAppError('api.projects.delete', appError, { projectId })
      return NextResponse.json(
        {
          ok: false,
          message: appError.userMessage,
        },
        { status: 404 }
      )
    }

    if (project.user_id !== user.id) {
      const appError = new UnauthorizedError('You do not have permission to delete this project')
      logAppError('api.projects.delete', appError, { projectId, userId: user.id })
      return NextResponse.json(
        {
          ok: false,
          message: appError.userMessage,
        },
        { status: 403 }
      )
    }

    // Delete the project (cascade deletes should handle related data)
    const result = await deleteProjectSafe(supabase, projectId)

    if (!result.ok) {
      const appError = toAppError(
        new Error(result.error.message),
        { projectId, code: result.error.code }
      )
      logAppError('api.projects.delete', appError, { projectId })
      
      return NextResponse.json(
        {
          ok: false,
          message: appError.userMessage,
          details: {
            code: appError.code,
          },
        },
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const appError = toAppError(error, { projectId, route: '/api/projects/[projectId]' })
    logAppError('api.projects.delete', appError, { projectId })
    
    const errorResult: DeleteProjectResult = {
      ok: false,
      message: appError.userMessage,
      details: {
        code: appError.code,
      },
    }
    return NextResponse.json(errorResult, { status: 500 })
  }
}

