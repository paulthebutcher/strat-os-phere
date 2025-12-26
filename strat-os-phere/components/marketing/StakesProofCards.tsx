/**
 * StakesProofCards
 * 
 * Light, editorial proof-point cards showing the cost of being wrong.
 * Tells the story: "This usually takes a long time and costs a lot of money."
 * 
 * Visual treatment:
 * - Light background cards with subtle borders
 * - Simple SVG/CSS visual motifs (timeline, bars, forked path, drift)
 * - Clear proof points
 * - Editorial, not UI-like
 */
"use client"

import { cn } from "@/lib/utils"

interface StakesProofCardsProps {
  className?: string
}

export function StakesProofCards({ className }: StakesProofCardsProps) {
  return (
    <div className={cn("w-full space-y-8", className)}>
      {/* 4-card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 - Time */}
        <ProofCard
          title="Weeks Lost"
          copy="Strategic decisions like this typically take 6–12 weeks to resolve. During that time, teams wait—or move in parallel."
          proofPoint="Planning cycles, review meetings, rework."
          visual={<TimeVisual />}
        />

        {/* Card 2 - Cost */}
        <ProofCard
          title="Cost Compounds"
          copy="Delays quietly multiply cost across engineering capacity, leadership cycles, and external research."
          proofPoint="One unresolved decision touches 5–10 people repeatedly."
          visual={<CostVisual />}
        />

        {/* Card 3 - Opportunity */}
        <ProofCard
          title="Missed Leverage"
          copy="While teams wait, competitors move, markets shift, budgets lock, and windows close."
          proofPoint="Opportunity cost rarely appears on a roadmap."
          visual={<OpportunityVisual />}
        />

        {/* Card 4 - Drift */}
        <ProofCard
          title="Default Decisions Win"
          copy="The biggest risk isn't choosing wrong. It's never choosing—and letting inertia decide."
          proofPoint="Indecision is still a strategy (just not yours)."
          visual={<DriftVisual />}
        />
      </div>

      {/* Transition line */}
      <div className="text-center pt-4">
        <p className="text-base text-text-secondary leading-relaxed max-w-2xl mx-auto">
          Plinth collapses this cycle—without trading rigor for speed.
        </p>
      </div>
    </div>
  )
}

interface ProofCardProps {
  title: string
  copy: string
  proofPoint: string
  visual: React.ReactNode
}

function ProofCard({ title, copy, proofPoint, visual }: ProofCardProps) {
  return (
    <div className="bg-white border border-border-subtle rounded-lg shadow p-6 space-y-4">
      {/* Visual motif */}
      <div className="h-16 flex items-center justify-center text-text-muted/40">
        {visual}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-text-primary leading-tight">
          {title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {copy}
        </p>
        <p className="text-xs text-text-muted italic border-t border-border-subtle pt-3">
          {proofPoint}
        </p>
      </div>
    </div>
  )
}

// Visual motifs - simple SVG/CSS shapes

function TimeVisual() {
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Timeline line */}
      <line
        x1="10"
        y1="20"
        x2="110"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 2"
        opacity="0.3"
      />
      {/* Timeline ticks */}
      <line x1="20" y1="15" x2="20" y2="25" stroke="currentColor" strokeWidth="1" />
      <line x1="40" y1="15" x2="40" y2="25" stroke="currentColor" strokeWidth="1" />
      <line x1="60" y1="15" x2="60" y2="25" stroke="currentColor" strokeWidth="1" />
      {/* Slipping marker (slanted) */}
      <g transform="translate(80, 20)">
        <line
          x1="0"
          y1="-8"
          x2="0"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.6"
        />
        <line
          x1="-4"
          y1="0"
          x2="4"
          y2="4"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </g>
    </svg>
  )
}

function CostVisual() {
  return (
    <div className="w-full h-full flex items-end justify-center gap-1.5 px-4">
      {/* Stacked bars / receipt-like rows */}
      <div className="h-6 w-2 bg-current opacity-20" />
      <div className="h-10 w-2 bg-current opacity-30" />
      <div className="h-14 w-2 bg-current opacity-40" />
      <div className="h-12 w-2 bg-current opacity-35" />
      <div className="h-16 w-2 bg-current opacity-45" />
    </div>
  )
}

function OpportunityVisual() {
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Forked path / divergence */}
      <path
        d="M 20 30 L 50 20 L 70 15"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M 20 30 L 50 20 L 80 25 L 100 30"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
      {/* Divergence point marker */}
      <circle cx="50" cy="20" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

function DriftVisual() {
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Drift / misalignment layers */}
      <rect
        x="20"
        y="12"
        width="60"
        height="4"
        fill="currentColor"
        opacity="0.2"
        rx="2"
      />
      <rect
        x="25"
        y="18"
        width="60"
        height="4"
        fill="currentColor"
        opacity="0.25"
        rx="2"
      />
      <rect
        x="30"
        y="24"
        width="60"
        height="4"
        fill="currentColor"
        opacity="0.3"
        rx="2"
      />
    </svg>
  )
}

