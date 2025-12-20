'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { InsightLineage, SignalType } from '@/lib/results/lineageHelpers'
import { cn } from '@/lib/utils'

interface InsightLineageDrawerProps {
  lineage: InsightLineage
  title: string
  isOpen: boolean
  onClose: () => void
}

const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  reviews: 'Reviews',
  pricing: 'Pricing',
  changelog: 'Changelog',
  docs: 'Documentation',
  jobs: 'Job Postings',
  marketing: 'Marketing',
  support_forums: 'Support Forums',
  unknown: 'Other Sources',
}

export function InsightLineageDrawer({
  lineage,
  title,
  isOpen,
  onClose,
}: InsightLineageDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus the close button when drawer opens
      setTimeout(() => {
        const closeButton = drawerRef.current?.querySelector('button[aria-label="Close drawer"]') as HTMLButtonElement
        closeButton?.focus()
      }, 0)
    } else {
      // Restore focus when drawer closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return

    const drawer = drawerRef.current
    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    drawer.addEventListener('keydown', handleTab)
    return () => drawer.removeEventListener('keydown', handleTab)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-lg',
          'transform transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lineage-drawer-title"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 id="lineage-drawer-title" className="text-sm font-semibold text-foreground">
                How this emerged
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">{title}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Inputs Section */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Inputs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {lineage.inputs.signalTypes.map((signalType) => (
                    <Badge
                      key={signalType}
                      variant="secondary"
                      className="text-xs"
                    >
                      {SIGNAL_TYPE_LABELS[signalType]}
                    </Badge>
                  ))}
                </div>
                {lineage.inputs.signalTypes.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    Signal types not specified in metadata
                  </p>
                )}
              </section>

              {/* Observed Patterns Section */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Observed Patterns
                </h3>
                <ul className="space-y-2">
                  {lineage.observedPatterns.map((pattern, index) => (
                    <li
                      key={index}
                      className="text-sm text-foreground before:content-['•'] before:mr-2 before:text-muted-foreground"
                    >
                      {pattern}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Synthesis Section */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Synthesis
                </h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {lineage.synthesis}
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

