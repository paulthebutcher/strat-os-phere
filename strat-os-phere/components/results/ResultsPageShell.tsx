import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface ResultsPageShellProps {
  children: ReactNode
  className?: string
}

/**
 * Presentational wrapper for results page content
 * Provides consistent max-width, centering, and vertical spacing
 */
export function ResultsPageShell({
  children,
  className,
}: ResultsPageShellProps) {
  return (
    <div className={cn('flex min-h-[calc(100vh-57px)] items-start justify-center px-4', className)}>
      <main className="flex w-full max-w-7xl flex-col gap-8 py-12">
        {children}
      </main>
    </div>
  )
}

