'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

interface CompetitorsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CompetitorsError({ error, reset }: CompetitorsErrorProps) {
  useEffect(() => {
    // Log error for observability
    console.error('[competitors] Error boundary caught error:', error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center p-4">
      <SurfaceCard className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h1 className="text-lg font-semibold">Something went wrong</h1>
        </div>
        
        <p className="text-sm text-muted-foreground">
          We encountered an error while loading the competitors page. This might be a temporary issue.
        </p>

        {error.message && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
            <p className="text-xs font-mono text-destructive">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={reset} variant="brand" className="w-full">
            Try again
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Back to Projects</Link>
          </Button>
        </div>
      </SurfaceCard>
    </div>
  )
}

