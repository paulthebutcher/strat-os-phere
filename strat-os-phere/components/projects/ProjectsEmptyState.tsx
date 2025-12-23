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
        Create your first analysis
      </h2>
      <p className="text-base text-muted-foreground mb-10 leading-relaxed">
        Get started by creating a new competitive analysis project. We'll help you discover strategic opportunities.
      </p>

      <ul className="text-left space-y-3 mb-10 text-sm text-muted-foreground w-full max-w-sm">
        <li className="flex items-start gap-3">
          <span className="text-primary font-semibold mt-0.5">✓</span>
          <span>Add competitors and gather evidence</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-primary font-semibold mt-0.5">✓</span>
          <span>Generate ranked opportunities</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-primary font-semibold mt-0.5">✓</span>
          <span>Share results with your team</span>
        </li>
      </ul>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button asChild size="lg" variant="brand" className="w-full sm:w-auto">
          <Link href="/projects/new">New analysis</Link>
        </Button>
      </div>
    </div>
  )
}

