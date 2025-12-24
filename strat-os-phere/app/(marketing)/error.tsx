/**
 * Marketing Error Boundary
 * 
 * Friendly error page for marketing routes.
 * No stack traces, no debug info - just a clean fallback.
 */
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for debugging (but don't show to user)
    console.error('Marketing error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-surface-muted p-4">
            <AlertCircle className="w-8 h-8 text-text-muted" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-text-primary">
            Something went wrong
          </h1>
          <p className="text-text-secondary">
            We encountered an issue loading this page. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </Button>
          <Button
            asChild
            variant="outline"
          >
            <Link href="/login">Go to login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

