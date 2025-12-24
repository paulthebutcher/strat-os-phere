import { createClient } from '@/lib/supabase/server'
import { getEvidenceCoverage } from '@/lib/evidence'
import { evaluateReadiness } from '@/lib/evidence/readiness'
import { EvidenceCoveragePanel } from './EvidenceCoveragePanel'

interface EvidenceCoveragePanelWrapperProps {
  projectId: string
}

/**
 * Server component wrapper that fetches coverage data and renders the panel
 */
export async function EvidenceCoveragePanelWrapper({
  projectId,
}: EvidenceCoveragePanelWrapperProps) {
  const supabase = await createClient()

  try {
    const coverage = await getEvidenceCoverage(supabase, projectId)
    const readiness = evaluateReadiness(coverage)

    return (
      <EvidenceCoveragePanel
        coverage={coverage}
        readiness={readiness}
        projectId={projectId}
      />
    )
  } catch (error) {
    // If coverage fetch fails, show empty state
    console.error('Failed to fetch evidence coverage:', error)
    return (
      <div className="panel p-6">
        <h3 className="text-base font-semibold text-foreground mb-1">
          Evidence coverage
        </h3>
        <p className="text-sm text-muted-foreground">
          Unable to load coverage data. Please try again later.
        </p>
      </div>
    )
  }
}

