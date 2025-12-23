import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEvidenceBundleForProject } from '@/lib/evidence/getEvidenceBundleForProject'
import { summarizeEvidenceBundle } from '@/lib/evidence/evidenceReport'

export const runtime = 'nodejs'

/**
 * Dev-only endpoint for evidence report
 * GET /api/dev/evidence-report?projectId=...
 *
 * Returns evidence bundle health report for a project.
 * Disabled in production unless ENABLE_DEV_TOOLS === 'true'.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Check if dev endpoint is enabled
  const isProduction = process.env.NODE_ENV === 'production'
  const devToolsEnabled = process.env.ENABLE_DEV_TOOLS === 'true'

  if (isProduction && !devToolsEnabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')

    if (!projectId || typeof projectId !== 'string' || !projectId.trim()) {
      return NextResponse.json(
        {
          error: 'Missing or empty projectId parameter',
          message: 'Please provide a projectId: ?projectId=...',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get evidence bundle with metadata
    const bundleResult = await getEvidenceBundleForProject(supabase, projectId.trim())

    // Generate report
    const report = summarizeEvidenceBundle(bundleResult.bundle)

    // Get sample URLs by type
    const sampleUrlsByType: Record<string, string[]> = {}
    if (bundleResult.bundle) {
      for (const item of bundleResult.bundle.items) {
        const type = item.type ?? 'other'
        if (!sampleUrlsByType[type]) {
          sampleUrlsByType[type] = []
        }
        if (sampleUrlsByType[type].length < 3) {
          sampleUrlsByType[type].push(item.url)
        }
      }
    }

    return NextResponse.json(
      {
        bundleFound: bundleResult.bundle !== null,
        artifactId: bundleResult.artifactId,
        updatedAt: bundleResult.updatedAt,
        report,
        sampleUrlsByType,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

