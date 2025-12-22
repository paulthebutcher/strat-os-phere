'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { formatRelativeDate } from '@/components/projects/formatRelativeDate'
import type { Artifact } from '@/lib/supabase/types'
import { getRunIdsFromArtifacts, getArtifactsForRun, isRunSuccessful, extractRunIdFromArtifact } from '@/lib/results/runs'

interface RunHistoryDrawerProps {
  projectId: string
  artifacts: Artifact[]
}

/**
 * Drawer showing run history for a project
 * Lists last 10 runs with timestamp, status, and "View" link
 */
export function RunHistoryDrawer({ projectId, artifacts }: RunHistoryDrawerProps) {
  const [open, setOpen] = useState(false)

  // Get all run IDs sorted by most recent
  const runIds = getRunIdsFromArtifacts(artifacts).slice(0, 10)

  const runs = runIds.map(runId => {
    const runArtifacts = getArtifactsForRun(artifacts, runId)
    const successful = isRunSuccessful(runArtifacts)
    
    // Get the most recent artifact timestamp for this run
    const latestArtifact = runArtifacts.reduce((latest, current) => {
      return new Date(current.created_at) > new Date(latest.created_at) ? current : latest
    }, runArtifacts[0])

    return {
      runId,
      successful,
      timestamp: latestArtifact.created_at,
      artifactCount: runArtifacts.length,
    }
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          View run history
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Run History</SheetTitle>
          <SheetDescription>
            View past analysis runs for this project
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs yet</p>
          ) : (
            runs.map((run) => (
              <div
                key={run.runId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium ${
                        run.successful ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {run.successful ? '✓ Success' : 'Incomplete'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(run.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {run.artifactCount} artifact{run.artifactCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link
                    href={`/projects/${projectId}/results?runId=${run.runId}`}
                    onClick={() => setOpen(false)}
                  >
                    View
                  </Link>
                </Button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

