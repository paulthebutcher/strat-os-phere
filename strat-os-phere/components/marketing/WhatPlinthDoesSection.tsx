/**
 * What Plinth Does — and Doesn't Do
 * 
 * Icon-led value cards with one sentence per card.
 * Paired "Plinth focuses on" vs "Plinth avoids".
 * 
 * Feels like a principles system, not marketing copy.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { cn } from "@/lib/utils"
import { Target, FileText, Shield, Compass, XCircle, Gauge } from "lucide-react"

interface ValueCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  text: string
  variant?: "focus" | "avoid"
}

function ValueCard({ icon: Icon, text, variant = "focus" }: ValueCardProps) {
  const isFocus = variant === "focus"
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border",
        isFocus
          ? "bg-white border-border-subtle shadow-sm"
          : "bg-surface-muted/50 border-border-subtle/60"
      )}
    >
      <div
        className={cn(
          "mt-0.5 shrink-0",
          isFocus ? "text-accent-primary" : "text-text-muted"
        )}
      >
        <Icon size={18} />
      </div>
      <p className="text-sm text-text-primary leading-relaxed flex-1">{text}</p>
    </div>
  )
}

const focusItems = [
  {
    icon: Target,
    text: "Competitive signals that shape real bets",
  },
  {
    icon: FileText,
    text: "Explicit assumptions and evidence",
  },
  {
    icon: Shield,
    text: "Outputs you can stand behind",
  },
]

const avoidItems = [
  {
    icon: Compass,
    text: "Endless exploration",
  },
  {
    icon: Gauge,
    text: "False certainty",
  },
  {
    icon: XCircle,
    text: "Vanity metrics",
  },
]

export function WhatPlinthDoesSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="space-y-8 sm:space-y-12">
            {/* Section header */}
            <div className="text-center space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
                How Plinth creates real advantage
              </h2>
            </div>

            {/* Two-column layout with icon-led cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
              {/* Column 1: Plinth focuses on */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">
                  Plinth focuses on
                </h3>
                <Stagger stagger={40} className="space-y-3">
                  {focusItems.map((item, idx) => (
                    <ValueCard key={idx} icon={item.icon} text={item.text} variant="focus" />
                  ))}
                </Stagger>
              </div>

              {/* Column 2: Plinth avoids */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">
                  Plinth avoids
                </h3>
                <Stagger stagger={40} className="space-y-3">
                  {avoidItems.map((item, idx) => (
                    <ValueCard key={idx} icon={item.icon} text={item.text} variant="avoid" />
                  ))}
                </Stagger>
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
