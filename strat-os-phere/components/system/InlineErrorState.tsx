'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface InlineErrorStateProps {
  title?: string
  subtitle?: string
  onReload?: () => void
}

/**
 * User-friendly error state component for schema drift and other data errors.
 * Displays a clear message instead of a blank screen or Next.js error page.
 */
export function InlineErrorState({
  title = "We hit a data mismatch",
  subtitle = "This usually means the app is ahead of the database schema. We're fixing it.",
  onReload,
}: InlineErrorStateProps) {
  const handleReload = () => {
    if (onReload) {
      onReload()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md w-full space-y-4 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button onClick={handleReload} variant="default">
          Reload
        </Button>
      </div>
    </div>
  )
}

