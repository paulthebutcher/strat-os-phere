/**
 * API route for storing follow-up question answers
 * POST /api/projects/[projectId]/followup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FLAGS } from '@/lib/flags'
import type { FollowUpAnswer } from '@/lib/followup/types'
import { createArtifact } from '@/lib/data/artifacts'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  // Check feature flag
  if (!FLAGS.followupEnabled) {
    return NextResponse.json(
      { error: 'Follow-up feature is not enabled' },
      { status: 404 }
    )
  }

  try {
    const { projectId } = await params
    const body: FollowUpAnswer = await request.json()

    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      }

    // Store as artifact (non-breaking, optional)
    // Use 'evidence_bundle_v1' type as a workaround since 'followup_v1' is not in the DB schema yet
    // The content_json will contain the follow-up answer
    await createArtifact(supabase, {
      project_id: projectId,
      type: 'evidence_bundle_v1', // Temporary: use existing type, filter by content structure
      content_json: body as any, // Cast to any to work around type checking
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing follow-up answer:', error)
    return NextResponse.json(
      { error: 'Failed to store answer' },
      { status: 500 }
    )
  }
}

