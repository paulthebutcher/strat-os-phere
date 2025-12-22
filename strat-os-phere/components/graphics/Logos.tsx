/**
 * Logo components
 * 
 * Plinth brand mark and wordmark as SVG components.
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  ariaHidden?: boolean;
}

/**
 * Plinth mark (icon only)
 * Simple geometric mark representing foundation/base
 */
export function PlinthMark({ className, ariaHidden = false }: LogoProps) {
  return (
    <svg
      className={cn("w-6 h-6", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : "img"}
      aria-label={ariaHidden ? undefined : "Plinth"}
    >
      {/* Foundation/base shape */}
      <rect x="4" y="16" width="16" height="4" rx="1" fill="currentColor" opacity="0.8" />
      {/* Support columns */}
      <rect x="6" y="8" width="3" height="8" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="10.5" y="4" width="3" height="12" rx="1" fill="currentColor" />
      <rect x="15" y="8" width="3" height="8" rx="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/**
 * Plinth wordmark (text logo)
 */
export function PlinthWordmark({ className, ariaHidden = false }: LogoProps) {
  return (
    <svg
      className={cn("h-5", className)}
      viewBox="0 0 120 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : "img"}
      aria-label={ariaHidden ? undefined : "Plinth"}
    >
      {/* Simple wordmark using geometric shapes for letters */}
      {/* P */}
      <rect x="2" y="2" width="3" height="20" fill="currentColor" />
      <rect x="5" y="2" width="6" height="3" fill="currentColor" />
      <rect x="5" y="9" width="6" height="3" fill="currentColor" />
      <rect x="9" y="5" width="2" height="4" fill="currentColor" />
      
      {/* L */}
      <rect x="14" y="2" width="3" height="20" fill="currentColor" />
      <rect x="14" y="19" width="8" height="3" fill="currentColor" />
      
      {/* I */}
      <rect x="25" y="2" width="3" height="20" fill="currentColor" />
      
      {/* N */}
      <rect x="31" y="2" width="3" height="20" fill="currentColor" />
      <line x1="34" y1="2" x2="41" y2="22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="38" y="2" width="3" height="20" fill="currentColor" />
      
      {/* T */}
      <rect x="44" y="2" width="10" height="3" fill="currentColor" />
      <rect x="47.5" y="2" width="3" height="20" fill="currentColor" />
      
      {/* H */}
      <rect x="57" y="2" width="3" height="20" fill="currentColor" />
      <rect x="57" y="9.5" width="8" height="3" fill="currentColor" />
      <rect x="62" y="2" width="3" height="20" fill="currentColor" />
    </svg>
  );
}
