'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RunTimelineDrawer } from './RunTimelineDrawer'
import type { AnalysisRun } from '@/lib/supabase/types'

interface InProgressBannerProps {
  run: AnalysisRun
  projectId: string
}

/**
 * Banner shown at top of Results page when a run is in progress
 */
export function InProgressBanner({ run, projectId }: InProgressBannerProps) {
  const [showTimeline, setShowTimeline] = useState(false)

  const percent = run.percent ?? 0
  const phase = run.current_phase ?? 'Starting...'

  return (
    <>
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <div>
              <div className="font-semibold text-foreground">
                Analysis in progress
              </div>
              <div className="text-sm text-muted-foreground">
                {phase} • {percent}%
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTimeline(true)}
          >
            View timeline
          </Button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          You can leave this page—results will appear as they're ready.
        </div>
        {percent > 0 && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>
      {showTimeline && (
        <RunTimelineDrawer
          runId={run.id}
          projectId={projectId}
          open={showTimeline}
          onOpenChange={setShowTimeline}
        />
      )}
    </>
  )
}

