'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AnalysisRun, Artifact } from '@/lib/supabase/types'

interface ResultsPageClientProps {
  projectId: string
  initialRun: AnalysisRun | null
  initialArtifacts: Artifact[]
  children: React.ReactNode
}

/**
 * Client component that handles polling for run updates and artifacts
 * Wraps the Results page content to add live refresh
 */
export function ResultsPageClient({
  projectId,
  initialRun,
  initialArtifacts,
  children,
}: ResultsPageClientProps) {
  const router = useRouter()
  const [run, setRun] = useState(initialRun)
  const [artifacts, setArtifacts] = useState(initialArtifacts)
  const [isPolling, setIsPolling] = useState(
    initialRun?.status === 'running' || initialRun?.status === 'queued'
  )

  useEffect(() => {
    if (!isPolling || !run) return

    const pollInterval = setInterval(async () => {
      try {
        // Poll for run status
        const runResponse = await fetch(`/api/projects/${projectId}/runs/latest`)
        const runData = await runResponse.json()
        
        if (runData.ok && runData.run) {
          setRun(runData.run)
          
          // Stop polling if run is completed or failed
          if (runData.run.status === 'completed' || runData.run.status === 'failed') {
            setIsPolling(false)
            // Refresh the page to show final results
            router.refresh()
          }
        }

        // Poll for new artifacts
        const artifactsResponse = await fetch(`/api/runs/${run.id}/artifacts`)
        const artifactsData = await artifactsResponse.json()
        
        if (artifactsData.ok) {
          const newArtifactIds = new Set(artifactsData.artifacts.map((a: { id: string }) => a.id))
          const currentArtifactIds = new Set(artifacts.map((a) => a.id))
          
          // If we have new artifacts, refresh the page
          if (artifactsData.artifacts.length > artifacts.length) {
            router.refresh()
          }
        }
      } catch (error) {
        console.error('Polling error', error)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [isPolling, run, projectId, router, artifacts.length])

  // Stop polling if run status changes to completed/failed
  useEffect(() => {
    if (run && (run.status === 'completed' || run.status === 'failed')) {
      setIsPolling(false)
    }
  }, [run])

  return <>{children}</>
}

