/**
 * ProjectSetupPreview
 * 
 * Simple preview showing project setup / input form.
 * Shows it's approachable and fast to start.
 */
"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ProjectSetupPreview() {
  return (
    <div className="bg-white p-4 md:p-5 min-h-[240px] flex flex-col">
      {/* Lighter visual weight: reduced padding, smaller form */}
      <div className="space-y-3">
        <div className="space-y-2.5">
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <label htmlFor="decision" className="text-xs font-medium text-text-primary block">
              Decision
            </label>
            <Textarea
              id="decision"
              placeholder="What decision are you trying to make?"
              className="text-sm min-h-[60px]"
              defaultValue="Should we introduce a free tier to unlock mid-market adoption?"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

