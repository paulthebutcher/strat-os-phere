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
        <div className="py-3 sm:py-4">
          <p className="text-xs sm:text-sm text-text-secondary text-center leading-relaxed">
            Built for product, strategy, and UX leaders at scale
          </p>
        </div>
      </MarketingContainer>
    </div>
  )
}

