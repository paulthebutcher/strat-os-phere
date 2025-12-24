/**
 * StepsCarousel
 * 
 * Notion-style carousel for "How it works" steps.
 * Left side: list of step titles with active indicator
 * Right side: large preview area showing active screenshot
 */
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import PreviewCollectEvidence from './previews/PreviewCollectEvidence'
import PreviewNormalize from './previews/PreviewNormalize'
import PreviewRankBets from './previews/PreviewRankBets'

export type StepItem = {
  id: string
  stepLabel: string // e.g. "STEP 1"
  title: string
  description: string
  previewId: 'collect' | 'normalize' | 'rank'
}

const previewComponents = {
  collect: PreviewCollectEvidence,
  normalize: PreviewNormalize,
  rank: PreviewRankBets,
}

interface StepsCarouselProps {
  steps: StepItem[]
}

export function StepsCarousel({ steps }: StepsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % steps.length)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + steps.length) % steps.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [steps.length])

  const ActivePreview = previewComponents[steps[activeIndex].previewId]

  return (
    <div className="w-full">
      {/* Mobile: Horizontal chips above preview */}
      <div className="md:hidden mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                'border',
                index === activeIndex
                  ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary'
                  : 'bg-surface border-border-subtle text-text-secondary hover:bg-surface-muted'
              )}
            >
              {step.stepLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 md:gap-12">
        {/* Left: Step list */}
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={step.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'w-full text-left transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:ring-offset-2 rounded-lg'
                )}
              >
                <div
                  className={cn(
                    'relative pl-4 pr-4 py-4 rounded-lg transition-all',
                    isActive
                      ? 'bg-accent-primary/5 border-l-2 border-accent-primary'
                      : 'border-l-2 border-transparent hover:bg-surface-muted/50'
                  )}
                >
                  {/* Active indicator rail */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent-primary rounded-r" />
                  )}

                  {/* Step label */}
                  <div className="mb-1">
                    <span
                      className={cn(
                        'text-xs font-semibold uppercase tracking-wide',
                        isActive ? 'text-accent-primary' : 'text-text-muted'
                      )}
                    >
                      {step.stepLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className={cn(
                      'text-base font-semibold mb-2 transition-colors',
                      isActive ? 'text-text-primary' : 'text-text-secondary'
                    )}
                  >
                    {step.title}
                  </h3>

                  {/* Description (only for active step) */}
                  {isActive && (
                    <p className="text-sm text-text-secondary leading-relaxed animate-fade-in">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Right: Preview area */}
        <div className="relative">
          <div className="sticky top-8">
            {/* Device frame */}
            <div className="rounded-xl border border-border-subtle bg-surface shadow-lg overflow-hidden">
              {/* Window chrome */}
              <div className="h-10 bg-surface-muted border-b border-border-subtle flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-text-muted font-medium">
                    Plinth
                  </span>
                </div>
              </div>

              {/* Preview content with smooth transition */}
              <div className="relative bg-background min-h-[500px] md:min-h-[600px]">
                <div
                  key={activeIndex}
                  className="absolute inset-0 animate-fade-in"
                >
                  <ActivePreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

