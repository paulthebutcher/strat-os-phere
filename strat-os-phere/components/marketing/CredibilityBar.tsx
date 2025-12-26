/**
 * Credibility Bar
 * 
 * A thin, low-contrast credibility bar that appears below the hero.
 * Quietly signals enterprise readiness without flashy visuals.
 */
"use client"

import { MarketingContainer } from "./MarketingContainer"
import { cn } from "@/lib/utils"

export function CredibilityBar() {
  return (
    <div className="w-full bg-slate-50/40 border-y border-black/5">
      <MarketingContainer maxWidth="6xl">
        <div className="py-2 sm:py-4">
          <p className="editorial-meta text-center">
            Built for product, strategy, and UX leaders at scale
          </p>
        </div>
      </MarketingContainer>
    </div>
  )
}

