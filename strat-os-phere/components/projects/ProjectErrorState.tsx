'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/layout/PageShell'
import { Section } from '@/components/layout/Section'

interface ProjectErrorStateProps {
  projectId?: string
  title?: string
  subtitle?: string
  onReload?: () => void
  isMissingColumn?: boolean
}

/**
 * User-friendly error state component for project pages.
 * Displays a clear message instead of a blank screen or Next.js error page.
 * Use this when data loading fails but we want to fail-open gracefully.
 */
export function ProjectErrorState({
  projectId,
  title = "We couldn't load this project",
  subtitle,
  onReload,
  isMissingColumn,
}: ProjectErrorStateProps) {
  // Default subtitle with migration hint for schema drift
  const defaultSubtitle = isMissingColumn
    ? "The app may be ahead of the database schema. Run migrations or update selects."
    : "Something went wrong while loading the project data. This might be a temporary issue."
  
  const effectiveSubtitle = subtitle || defaultSubtitle
  const handleReload = () => {
    if (onReload) {
      onReload()
    } else {
      window.location.reload()
    }
  }

  return (
    <PageShell>
      <Section>
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full space-y-4 text-center">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{effectiveSubtitle}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleReload} variant="default">
                Reload
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </PageShell>
  )
}

