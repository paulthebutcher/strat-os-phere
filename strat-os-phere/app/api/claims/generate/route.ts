/**
 * API route for generating claims from evidence bundle
 * POST /api/claims/generate
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readLatestEvidenceBundle } from '@/lib/evidence/readBundle'
import { extractClaims } from '@/lib/claims/extract'
import { FLAGS } from '@/lib/flags'
import type { ClaimsBundle } from '@/lib/claims/types'

export async function POST(request: NextRequest) {
  // Check feature flag
  if (!FLAGS.claimsEnabled) {
    return NextResponse.json(
      { error: 'Claims feature is not enabled' },
      { status: 404 }
    )
  }

  try {
    const body = await request.json()
    const { projectId, competitorId } = body

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

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

    // Load evidence bundle
    const evidenceBundle = await readLatestEvidenceBundle(supabase, projectId)

    if (!evidenceBundle) {
      return NextResponse.json(
        { error: 'No evidence bundle found for this project' },
        { status: 404 }
      )
    }

    // Extract claims
    const claims = extractClaims(evidenceBundle)

    // Build claims bundle
    const claimsBundle: ClaimsBundle = {
      schema_version: 1,
      meta: {
        generatedAt: new Date().toISOString(),
        company: evidenceBundle.company || undefined,
        evidenceWindowDays: undefined, // Could compute from evidence dates
        sourceCountsByType: (() => {
          const counts: Record<string, number> = {}
          for (const item of evidenceBundle.items) {
            const type = item.type || 'other'
            counts[type] = (counts[type] || 0) + 1
          }
          return counts
        })(),
      },
      claims,
    }

    return NextResponse.json(claimsBundle)
  } catch (error) {
    console.error('Error generating claims:', error)
    return NextResponse.json(
      { error: 'Failed to generate claims' },
      { status: 500 }
    )
  }
}

