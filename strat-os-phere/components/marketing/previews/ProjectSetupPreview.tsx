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
    <div className="bg-white p-6 md:p-8 min-h-[300px] flex flex-col">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Create a new analysis
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-medium text-text-primary block">
                Investment focus
              </label>
              <Input
                id="name"
                placeholder="e.g., Enterprise SSO features"
                className="text-sm"
                defaultValue="Enterprise SSO features"
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
                className="text-sm min-h-[80px]"
                defaultValue="Should we prioritize enterprise SSO in Q2?"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

