/**
 * Read follow-up answer for a project
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listArtifacts } from '@/lib/data/artifacts'
import type { FollowUpAnswer } from './types'

/**
 * Read the latest follow-up answer for a project
 */
export async function readFollowUpAnswer(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<FollowUpAnswer | null> {
  const artifacts = await listArtifacts(supabase, { projectId })
  
  // Find artifacts that look like follow-up answers
  // Filter by content structure since we're using evidence_bundle_v1 type temporarily
  const followupArtifacts = artifacts
    .filter((a) => {
      const content = a.content_json
      return (
        content &&
        typeof content === 'object' &&
        'answer' in content &&
        'answeredAt' in content &&
        !('schema_version' in content) // Exclude actual evidence bundles
      )
    })
    .sort((a, b) => {
      const aTime = new Date(a.created_at).getTime()
      const bTime = new Date(b.created_at).getTime()
      return bTime - aTime
    })

  if (followupArtifacts.length === 0) {
    return null
  }

  const latestArtifact = followupArtifacts[0]
  const content = latestArtifact.content_json

  if (!content || typeof content !== 'object') {
    return null
  }

  // Validate it's a FollowUpAnswer
  if ('answer' in content && 'answeredAt' in content) {
    return {
      questionId: 'questionId' in content ? String(content.questionId) : undefined,
      answer: String(content.answer),
      answeredAt: String(content.answeredAt),
    } as FollowUpAnswer
  }

  return null
}

