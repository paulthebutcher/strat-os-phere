'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CompetitiveLandscapeIllustration } from '@/components/graphics'

export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto animate-fade-in">
      <div className="w-56 h-44 mb-10 opacity-50">
        <CompetitiveLandscapeIllustration />
      </div>
      <h2 className="text-3xl font-semibold text-foreground mb-3 tracking-tight">
        Start your first analysis
      </h2>
      <p className="text-base text-muted-foreground mb-10 leading-relaxed">
        Get started by creating a new competitive analysis project. We'll help you discover strategic opportunities.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button asChild size="lg" variant="brand" className="w-full sm:w-auto">
          <Link href="/projects/new?onboarding=1">Start guided analysis</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
          <Link href="/samples">Try an example</Link>
        </Button>
      </div>
    </div>
  )
}

