import * as React from "react";
import { cn } from "@/lib/utils";
import { badgeToneClass } from "@/lib/ui/badgeTone";

export interface OpportunityCardProps {
  title: string;
  description?: string;
  score?: number;
  badges?: Array<{ label: string; tone?: "info" | "success" | "warning" }>;
  citationsCount?: number;
  evidenceLine?: string;
  className?: string;
}

/**
 * OpportunityCard - Premium opportunity card component
 * 
 * Matches the exact look from the landing sample: score pill, title, description,
 * badge row, divider, evidence excerpt.
 */
export function OpportunityCard({
  title,
  description,
  score,
  badges = [],
  citationsCount,
  evidenceLine,
  className,
}: OpportunityCardProps) {
  return (
    <div className={cn("p-6 md:p-8", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="mb-2 text-xl font-bold text-[rgb(var(--plinth-text))]">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-[rgb(var(--plinth-muted))] md:text-base">
              {description}
            </p>
          )}
        </div>
        {score !== undefined && (
          <div className="flex shrink-0 items-center gap-2 rounded-lg bg-[rgba(var(--plinth-accent)/0.1)] px-3 py-1.5">
            <span className="text-lg font-bold text-[rgb(var(--plinth-accent))]">
              {score.toFixed(1)}
            </span>
            <span className="text-xs text-[rgb(var(--plinth-muted))]">score</span>
          </div>
        )}
      </div>

      {(badges.length > 0 || citationsCount !== undefined) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {citationsCount !== undefined && (
            <span className="inline-flex items-center rounded-md bg-[rgba(var(--plinth-accent)/0.1)] px-2.5 py-1 text-xs font-medium text-[rgb(var(--plinth-accent))] border border-[rgba(var(--plinth-accent)/0.2)]">
              {citationsCount} citation{citationsCount !== 1 ? "s" : ""}
            </span>
          )}
          {badges.map((badge, idx) => (
            <span
              key={idx}
              className={cn(
                "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border",
                badgeToneClass(badge.tone)
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {evidenceLine && (
        <div className="mt-6 border-t border-[rgba(var(--plinth-border))] pt-4">
          <p className="text-xs text-[rgb(var(--plinth-muted))]">
            <strong className="font-semibold text-[rgb(var(--plinth-text))]">
              Evidence:
            </strong>{" "}
            {evidenceLine}
          </p>
        </div>
      )}
    </div>
  );
}

