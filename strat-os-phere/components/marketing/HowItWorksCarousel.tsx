/**
 * HowItWorksCarousel
 * 
 * Notion-style horizontal carousel for "How it works" section.
 * 4 slides: Frame, Scan, Weigh, Decide
 * Single-word headlines, expanded copy, purposeful visuals.
 */
'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HOW_IT_WORKS_SLIDES, type HowItWorksSlide } from './howItWorksSlides'

// Re-export type for backwards compatibility
export type SlideData = HowItWorksSlide

const slides = HOW_IT_WORKS_SLIDES

export function HowItWorksCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const goToSlide = (index: number) => {
    setActiveIndex(index)
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const slideWidth = container.clientWidth
      container.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth',
      })
    }
  }

  const goToPrevious = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : slides.length - 1
    goToSlide(newIndex)
  }

  const goToNext = () => {
    const newIndex = activeIndex < slides.length - 1 ? activeIndex + 1 : 0
    goToSlide(newIndex)
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const newIndex = activeIndex > 0 ? activeIndex - 1 : slides.length - 1
        goToSlide(newIndex)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const newIndex = activeIndex < slides.length - 1 ? activeIndex + 1 : 0
        goToSlide(newIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex])

  // Track scroll position for swipe
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const slideWidth = container.clientWidth
      const newIndex = Math.round(scrollLeft / slideWidth)
      setActiveIndex((prevIndex) => {
        if (newIndex !== prevIndex && newIndex >= 0 && newIndex < slides.length) {
          return newIndex
        }
        return prevIndex
      })
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const ActivePreview = slides[activeIndex].preview

  return (
    <div className="w-full">
      {/* Carousel container with subtle background */}
      <div className="rounded-2xl border border-border-subtle bg-surface-muted/30 p-6 md:p-8 lg:p-12 shadow-sm">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'transition-all rounded-full',
                index === activeIndex
                  ? 'w-2.5 h-2.5 bg-accent-primary'
                  : 'w-2 h-2 bg-border-subtle hover:bg-border-strong'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="text-center mb-6">
          <span className="text-sm font-medium text-text-muted">
            {activeIndex + 1} of {slides.length}
          </span>
        </div>

        {/* Carousel slides container */}
        <div
          ref={scrollContainerRef}
          className="relative overflow-x-auto scroll-smooth scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <div className="flex">
            {slides.map((slide, index) => {
              const Preview = slide.preview
              const isActive = index === activeIndex

              return (
                <div
                  key={slide.id}
                  className="w-full shrink-0 px-2"
                  style={{ 
                    scrollSnapAlign: 'start',
                    minWidth: '100%'
                  }}
                >
                  <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                      {/* Left: Content */}
                      <div className="space-y-6">
                        {/* Single-word headline */}
                        <h3 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-text-primary">
                          {slide.headline}
                        </h3>

                        {/* Expanded copy */}
                        <div className="space-y-4">
                          {slide.copy.map((paragraph, pIndex) => (
                            <p
                              key={pIndex}
                              className="text-base md:text-lg leading-relaxed text-text-secondary"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Right: Visual preview */}
                      <div className="relative">
                        <div className="rounded-xl border border-border-subtle bg-white shadow-lg overflow-hidden">
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
                            {isActive && (
                              <div className="absolute inset-0 animate-fade-in">
                                <Preview />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="rounded-full"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="rounded-full"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

