'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CompetitiveLandscapeIllustration } from '@/components/graphics'

export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      <div className="w-48 h-36 mb-8 opacity-40">
        <CompetitiveLandscapeIllustration />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Create your first analysis
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Get started by creating a new competitive analysis project.
      </p>

      <ul className="text-left space-y-2 mb-8 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="text-foreground font-medium">•</span>
          <span>Add competitors</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-foreground font-medium">•</span>
          <span>Generate opportunities</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-foreground font-medium">•</span>
          <span>Share results</span>
        </li>
      </ul>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/projects/new">New analysis</Link>
        </Button>
      </div>
    </div>
  )
}

