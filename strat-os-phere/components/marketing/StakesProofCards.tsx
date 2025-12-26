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
          copy="Strategic decisions typically take 6–12 weeks to resolve. During that time, teams wait—or move in parallel without coordination."
          proofPoint="Planning cycles, review meetings, rework."
          visual={<TimeVisual />}
        />

        {/* Card 2 - Cost */}
        <ProofCard
          title="Cost Compounds"
          copy="Delays multiply cost across engineering capacity, leadership review cycles, and external research spend."
          proofPoint="One unresolved decision touches 5–10 people repeatedly."
          visual={<CostVisual />}
        />

        {/* Card 3 - Opportunity */}
        <ProofCard
          title="Missed Leverage"
          copy="While teams wait, competitors move, markets shift, budgets lock, and strategic windows close."
          proofPoint="Opportunity cost rarely appears on a roadmap."
          visual={<OpportunityVisual />}
        />

        {/* Card 4 - Drift */}
        <ProofCard
          title="Default Decisions Win"
          copy="The biggest risk isn't choosing wrong. It's never choosing—and letting inertia decide the outcome."
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
    <div className="bg-white border border-border-subtle rounded-lg shadow-sm p-6 space-y-5">
      {/* Simplified visual motif */}
      <div className="h-12 flex items-center justify-center text-text-muted/30">
        {visual}
      </div>

      {/* Content - enhanced typography and spacing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary leading-tight">
          {title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {copy}
        </p>
        <p className="text-xs text-text-muted italic border-t border-border-subtle pt-3.5">
          {proofPoint}
        </p>
      </div>
    </div>
  )
}

// Visual motifs - simplified, typographic emphasis

function TimeVisual() {
  return (
    <svg
      width="100"
      height="32"
      viewBox="0 0 100 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Simplified timeline */}
      <line
        x1="10"
        y1="16"
        x2="90"
        y2="16"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 2"
        opacity="0.25"
      />
      {/* Timeline markers */}
      <line x1="25" y1="12" x2="25" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      <line x1="50" y1="12" x2="50" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      <line x1="75" y1="12" x2="75" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.25" />
    </svg>
  )
}

function CostVisual() {
  return (
    <div className="w-full h-full flex items-end justify-center gap-1.5 px-4">
      {/* Simplified stacked bars */}
      <div className="h-4 w-1.5 bg-current opacity-20" />
      <div className="h-6 w-1.5 bg-current opacity-25" />
      <div className="h-8 w-1.5 bg-current opacity-30" />
      <div className="h-7 w-1.5 bg-current opacity-25" />
      <div className="h-9 w-1.5 bg-current opacity-30" />
    </div>
  )
}

function OpportunityVisual() {
  return (
    <svg
      width="100"
      height="32"
      viewBox="0 0 100 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Simplified divergence */}
      <path
        d="M 20 24 L 45 16 L 65 14"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.2"
      />
      <path
        d="M 20 24 L 45 16 L 70 18 L 85 22"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.2"
      />
    </svg>
  )
}

function DriftVisual() {
  return (
    <svg
      width="100"
      height="32"
      viewBox="0 0 100 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Simplified misalignment */}
      <rect
        x="20"
        y="14"
        width="50"
        height="2"
        fill="currentColor"
        opacity="0.2"
        rx="1"
      />
      <rect
        x="24"
        y="18"
        width="50"
        height="2"
        fill="currentColor"
        opacity="0.2"
        rx="1"
      />
      <rect
        x="28"
        y="22"
        width="50"
        height="2"
        fill="currentColor"
        opacity="0.2"
        rx="1"
      />
    </svg>
  )
}

