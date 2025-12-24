'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/layout/EmptyState'
import type { AppError } from '@/lib/errors/errors'
import { AlertCircle } from 'lucide-react'

interface PageErrorStateProps {
  error: AppError
  title?: string
}

/**
 * PageErrorState - Taxonomy-driven error state component
 * 
 * Displays user-friendly error states based on the error taxonomy.
 * Shows calm copy, appropriate CTAs, and handles retry logic.
 */
export function PageErrorState({ 
  error,
  title,
}: PageErrorStateProps) {
  const effectiveTitle = title || error.userMessage
  
  // Build action buttons based on error properties
  const actionButtons: React.ReactNode[] = []

  // Primary action: Reload if retryable, or error's action
  if (error.isRetryable) {
    actionButtons.push(
      <Button 
        key="reload"
        size="lg" 
        variant="brand" 
        className="w-full sm:w-auto"
        onClick={() => window.location.reload()}
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
        size="lg" 
        variant={error.isRetryable ? "outline" : "brand"}
        className="w-full sm:w-auto"
      >
        <Link href={error.action.href}>{error.action.label}</Link>
      </Button>
    )
  } else if (!error.isRetryable) {
    // If not retryable and no specific action, show "Back to Projects"
    actionButtons.push(
      <Button 
        key="back"
        asChild 
        size="lg" 
        variant="brand"
        className="w-full sm:w-auto"
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
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="flex justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
      </div>
      <EmptyState
        title={effectiveTitle}
        description={description}
        action={actionButtons.length > 0 ? <>{actionButtons}</> : undefined}
      />
    </div>
  )
}

