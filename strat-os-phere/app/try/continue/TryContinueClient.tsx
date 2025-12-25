'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { paths } from '@/lib/routes'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { loadTryDraft, clearTryDraft, clearPostAuthIntent } from '@/lib/tryDraft'
import { createProjectFromTryDraft } from '../actions'

export function TryContinueClient() {
  const router = useRouter()
  const [status, setStatus] = useState<
    'loading' | 'processing' | 'success' | 'error'
  >('loading')
  const [error, setError] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    async function resume() {
      const draft = loadTryDraft()

      if (!draft || !draft.primaryCompanyName) {
        // No draft found, redirect to new project page
        router.push('/new')
        return
      }

      setStatus('processing')

      try {
        const result = await createProjectFromTryDraft(draft)

        if (!result.success || !result.projectId) {
          throw new Error(result.message || 'Failed to create project')
        }

        setProjectId(result.projectId)
        setStatus('success')

        // Clear draft and intent
        clearTryDraft()
        clearPostAuthIntent()

        // Redirect to decision page
        // The run will be started automatically by the action
        router.push(paths.decision(result.projectId))
      } catch (err) {
        setStatus('error')
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to create project. Please try again.'
        )
      }
    }

    resume()
  }, [router])

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-57px)] flex items-center justify-center">
        <SurfaceCard className="p-8 max-w-md">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading your analysis setup...
            </p>
          </div>
        </SurfaceCard>
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="min-h-[calc(100vh-57px)] flex items-center justify-center">
        <SurfaceCard className="p-8 max-w-md">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              Creating your analysis...
            </p>
            <p className="text-xs text-muted-foreground text-center">
              This may take a moment. We're setting up your project and starting
              the analysis.
            </p>
          </div>
        </SurfaceCard>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-[calc(100vh-57px)] flex items-center justify-center">
        <SurfaceCard className="p-8 max-w-md">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  router.push('/new')
                }}
              >
                Start over
              </Button>
              <Button
                onClick={() => {
                  setStatus('processing')
                  setError(null)
                  // Retry
                  const draft = loadTryDraft()
                  if (draft) {
                    createProjectFromTryDraft(draft)
                      .then((result) => {
                        if (result.success && result.projectId) {
                          clearTryDraft()
                          clearPostAuthIntent()
                          router.push(paths.decision(result.projectId))
                        } else {
                          setStatus('error')
                          setError(result.message || 'Failed to create project')
                        }
                      })
                      .catch((err) => {
                        setStatus('error')
                        setError(
                          err instanceof Error
                            ? err.message
                            : 'Failed to create project'
                        )
                      })
                  }
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        </SurfaceCard>
      </div>
    )
  }

  // Success - should redirect, but show loading just in case
  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center">
      <SurfaceCard className="p-8 max-w-md">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Redirecting to your results...
          </p>
        </div>
      </SurfaceCard>
    </div>
  )
}

