'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { PageId } from '@/lib/guidance/content'
import { getGuidanceForPage } from '@/lib/guidance/content'

interface PageWalkthroughProps {
  pageId: PageId
  onOpenChange?: (open: boolean) => void
}

const STORAGE_KEY_PREFIX = 'plinth.walkthrough.dismissed.'

function getStorageKey(pageId: PageId): string {
  return `${STORAGE_KEY_PREFIX}${pageId}`
}

function isDismissed(pageId: PageId): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(getStorageKey(pageId)) === 'true'
}

function dismissWalkthrough(pageId: PageId): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getStorageKey(pageId), 'true')
}

/**
 * One-time walkthrough dialog that shows on first visit to a page.
 * Can be reopened via a "Need a quick tour?" link.
 */
export function PageWalkthrough({
  pageId,
  onOpenChange,
  open: controlledOpen,
}: PageWalkthroughProps & { open?: boolean }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const guidance = getGuidanceForPage(pageId)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen

  useEffect(() => {
    // Check if walkthrough should show on mount (only if not controlled)
    if (controlledOpen === undefined && !isDismissed(pageId)) {
      setInternalOpen(true)
    }
  }, [pageId, controlledOpen])

  function handleOpenChange(newOpen: boolean) {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  function handleGotIt() {
    handleOpenChange(false)
  }

  function handleDontShowAgain() {
    dismissWalkthrough(pageId)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{guidance.title}</DialogTitle>
          <DialogDescription>{guidance.intro}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              3 things to do next:
            </h4>
            <ul className="space-y-2">
              {guidance.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-semibold mt-0.5">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDontShowAgain}
            className="w-full sm:w-auto"
          >
            Don&apos;t show again
          </Button>
          <Button onClick={handleGotIt} className="w-full sm:w-auto">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Component that can be controlled externally to show the walkthrough.
 * Useful for "Need a quick tour?" links.
 */
export function PageWalkthroughTrigger({
  onOpen,
  className,
}: {
  onOpen: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors ${className || ''}`}
    >
      Need a quick tour?
    </button>
  )
}

