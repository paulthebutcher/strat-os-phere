'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/layout/EmptyState'

interface PageErrorStateProps {
  title?: string
  subtitle?: string
  isMissingColumn?: boolean
}

export function PageErrorState({ 
  title = "We couldn't load your dashboard",
  subtitle,
  isMissingColumn = false
}: PageErrorStateProps) {
  const defaultSubtitle = isMissingColumn
    ? "We hit a data mismatch — your project data is safe. Try again or create a new analysis."
    : "Something went wrong while loading your data. Your project data is safe. Please try again."
  
  const finalSubtitle = subtitle ?? defaultSubtitle

  return (
    <EmptyState
      title={title}
      description={finalSubtitle}
      action={
        <>
          <Button 
            size="lg" 
            variant="brand" 
            className="w-full sm:w-auto"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            <Link href="/new">Start New Analysis</Link>
          </Button>
        </>
      }
    />
  )
}

