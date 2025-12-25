/**
 * HowItWorksCarousel
 * 
 * Refactored with persistent step headlines and stacked visuals.
 * Step titles are always visible for better scanning.
 */
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { HOW_IT_WORKS_SLIDES, type HowItWorksSlide } from './howItWorksSlides'

const slides = HOW_IT_WORKS_SLIDES

export function HowItWorksCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const newIndex = activeIndex > 0 ? activeIndex - 1 : slides.length - 1
        setActiveIndex(newIndex)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const newIndex = activeIndex < slides.length - 1 ? activeIndex + 1 : 0
        setActiveIndex(newIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex])

  const activeSlide = slides[activeIndex]
  const ActivePreview = activeSlide.preview

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-border-subtle bg-surface-muted/30 p-6 md:p-8 lg:p-12 shadow-sm">
        {/* Persistent step list - always visible */}
        <div className="mb-8 md:mb-12">
          <div className="flex gap-2 md:gap-3 justify-center md:justify-start overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 md:mx-0 md:px-0">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={slide.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'group relative px-3 py-2 md:px-5 md:py-3 rounded-lg transition-all duration-200 text-left shrink-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2',
                    isActive
                      ? 'bg-accent-primary/10 border border-accent-primary/30 shadow-sm'
                      : 'bg-white/50 border border-border-subtle hover:border-border-strong hover:bg-white'
                  )}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Go to step ${slide.stepNumber}: ${slide.headline}`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span
                      className={cn(
                        'text-xs md:text-sm font-semibold tabular-nums',
                        isActive
                          ? 'text-accent-primary'
                          : 'text-text-muted group-hover:text-text-secondary'
                      )}
                    >
                      {String(slide.stepNumber).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          'text-sm md:text-base font-semibold leading-tight whitespace-nowrap',
                          isActive
                            ? 'text-text-primary'
                            : 'text-text-secondary group-hover:text-text-primary'
                        )}
                      >
                        {slide.headline}
                      </span>
                      {slide.shortDescriptor && (
                        <span
                          className={cn(
                            'text-xs leading-tight mt-0.5 hidden md:block',
                            isActive
                              ? 'text-text-muted'
                              : 'text-text-muted/70 group-hover:text-text-muted'
                          )}
                        >
                          {slide.shortDescriptor}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content area - stacked layout */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Headline and copy */}
            <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary">
                {activeSlide.headline}
              </h3>

              <div className="space-y-3 max-w-2xl">
                {activeSlide.copy.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className="text-base md:text-lg leading-relaxed text-text-secondary"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Visual preview - stacked below copy */}
            <div className="relative">
              <div className="rounded-xl border border-border-subtle bg-white shadow-lg overflow-hidden max-w-[760px] mx-auto">
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

                {/* Preview content */}
                <div className="relative bg-background min-h-[400px] md:min-h-[500px]">
                  <div className="absolute inset-0 animate-fade-in">
                    <ActivePreview />
                  </div>
                </div>
              </div>

              {/* Proof line - optional micro-proof caption */}
              {activeSlide.proofLine && (
                <p className="text-sm text-text-muted text-center mt-4 max-w-2xl mx-auto">
                  {activeSlide.proofLine}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
