/**
 * Badge icon components
 * 
 * Small SVG icons used across product UI for badges and indicators.
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeIconProps {
  className?: string;
  ariaHidden?: boolean;
}

/**
 * Confidence badge icon
 */
export function ConfidenceBadgeIcon({ className, ariaHidden = true }: BadgeIconProps) {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M 5 8 L 7 10 L 11 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Recency badge icon (clock/calendar)
 */
export function RecencyBadgeIcon({ className, ariaHidden = true }: BadgeIconProps) {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="8" x2="8" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Citations badge icon (document with links)
 */
export function CitationsBadgeIcon({ className, ariaHidden = true }: BadgeIconProps) {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      <rect x="3" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="4" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/**
 * Industry tag icon
 */
export function IndustryTagIcon({ className, ariaHidden = true }: BadgeIconProps) {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      <path
        d="M 3 4 L 8 2 L 13 4 L 13 12 L 8 14 L 3 12 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
