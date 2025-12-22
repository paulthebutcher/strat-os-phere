'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { AnalysisRunEvent } from '@/lib/supabase/types'

interface RunTimelineDrawerProps {
  runId: string
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Drawer showing run timeline with phases and events
 */
export function RunTimelineDrawer({
  runId,
  projectId,
  open,
  onOpenChange,
}: RunTimelineDrawerProps) {
  const [events, setEvents] = useState<AnalysisRunEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    async function loadEvents() {
      try {
        const response = await fetch(`/api/runs/${runId}/events`)
        const data = await response.json()
        if (data.ok) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error('Failed to load events', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [runId, open])

  // Group events by phase
  const eventsByPhase = new Map<string, AnalysisRunEvent[]>()
  for (const event of events) {
    const phase = event.phase || 'unknown'
    const existing = eventsByPhase.get(phase) || []
    existing.push(event)
    eventsByPhase.set(phase, existing)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Run Timeline</SheetTitle>
          <SheetDescription>
            Progress events and phases for this analysis run
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-sm text-muted-foreground">No events yet</div>
          ) : (
            Array.from(eventsByPhase.entries()).map(([phase, phaseEvents]) => (
              <div key={phase} className="space-y-2">
                <div className="font-semibold text-foreground">{phase}</div>
                <div className="space-y-1 pl-4">
                  {phaseEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-sm text-muted-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            event.level === 'error'
                              ? 'bg-destructive'
                              : event.level === 'warn'
                              ? 'bg-yellow-500'
                              : 'bg-primary'
                          }`}
                        />
                        <span>{event.message}</span>
                      </div>
                      {event.meta && typeof event.meta === 'object' && 'detail' in event.meta && (
                        <div className="pl-4 text-xs text-muted-foreground/80">
                          {String(event.meta.detail)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

