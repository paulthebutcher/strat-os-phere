'use client'

import { useEffect, useRef } from 'react'

interface AddCompetitorDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function AddCompetitorDrawer({
  open,
  onOpenChange,
  children,
}: AddCompetitorDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden'
      // Focus the first input when drawer opens
      setTimeout(() => {
        const firstInput = drawerRef.current?.querySelector('input') as HTMLInputElement
        firstInput?.focus()
      }, 100)
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
      // Restore focus when drawer closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [open])

  // Handle escape key
  useEffect(() => {
    if (!open) return

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  // Focus trap
  useEffect(() => {
    if (!open || !drawerRef.current) return

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
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false)
        }
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-competitor-drawer-title"
        className="relative z-50 h-full w-full max-w-2xl overflow-y-auto bg-background shadow-lg"
        style={{
          animation: 'slideInRight 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
          <h2
            id="add-competitor-drawer-title"
            className="text-lg font-semibold"
          >
            Add competitor
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full px-2 text-sm text-text-secondary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Close drawer"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  )
}

