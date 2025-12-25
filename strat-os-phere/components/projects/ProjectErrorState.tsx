'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/layout/PageShell'
import { PageSection } from '@/components/layout/Section'
import type { AppError } from '@/lib/errors/errors'

interface ProjectErrorStateProps {
  error: AppError
  projectId?: string
  title?: string
}

/**
 * User-friendly error state component for project pages.
 * Displays a clear message instead of a blank screen or Next.js error page.
 * Use this when data loading fails but we want to fail-open gracefully.
 * 
 * Now uses the error taxonomy for consistent UX.
 */
export function ProjectErrorState({
  error,
  projectId,
  title,
}: ProjectErrorStateProps) {
  const effectiveTitle = title || error.userMessage
  
  // Build action buttons based on error properties
  const actionButtons: React.ReactNode[] = []

  // Primary action: Reload if retryable
  if (error.isRetryable) {
    actionButtons.push(
      <Button 
        key="reload"
        onClick={() => window.location.reload()} 
        variant="default"
      >
        Reload
      </Button>
    )
  }

  // Secondary action: error.action or default "Back to Projects"
  if (error.action) {
    actionButtons.push(
      <Button 
        key="action"
        asChild 
        variant={error.isRetryable ? "outline" : "default"}
      >
        <Link href={error.action.href}>{error.action.label}</Link>
      </Button>
    )
  } else {
    actionButtons.push(
      <Button 
        key="back"
        asChild 
        variant="outline"
      >
        <Link href="/dashboard">Back to Projects</Link>
      </Button>
    )
  }

  // Special handling for SchemaMismatchError - show migration hint
  let description = error.userMessage
  if (error.code === 'SCHEMA_MISMATCH') {
    description = "The app is ahead of the database schema. Run migrations or switch to safe selects."
  }

  return (
    <PageShell>
      <PageSection>
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full space-y-4 text-center">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">{effectiveTitle}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {actionButtons}
            </div>
          </div>
        </div>
      </PageSection>
    </PageShell>
  )
}

