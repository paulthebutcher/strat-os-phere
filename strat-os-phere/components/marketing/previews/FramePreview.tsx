/**
 * FramePreview
 * 
 * Preview showing the decision input form.
 * Highlights the explicit decision question field.
 */
"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function FramePreview() {
  return (
    <div className="bg-white p-5 md:p-6 min-h-[400px] flex flex-col">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-medium text-text-primary block">
              Investment focus
            </label>
            <Input
              id="name"
              placeholder="e.g., Free tier strategy"
              className="text-sm"
              defaultValue="Free tier strategy"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="market" className="text-xs font-medium text-text-primary block">
              Market
            </label>
            <Input
              id="market"
              placeholder="e.g., Incident management"
              className="text-sm"
              defaultValue="Incident management"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="decision" className="text-xs font-medium text-text-primary block">
              Decision
            </label>
            <Textarea
              id="decision"
              placeholder="What decision are you trying to make?"
              className="text-sm min-h-[100px] border-2 border-accent-primary/30 focus:border-accent-primary"
              defaultValue="Should we introduce a free tier to unlock mid-market adoption?"
            />
          </div>
        </div>

        {/* Caption */}
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-xs text-text-muted italic">
            Decision question is explicit
          </p>
        </div>
      </div>
    </div>
  )
}

