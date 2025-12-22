/**
 * Illustration components
 * 
 * SVG-based illustrations for core concepts.
 * Iconographic diagram style (boxes + arrows + badges).
 */

import React from "react";
import { Palette, pickPalette } from "./style";
import { cn } from "@/lib/utils";

export interface IllustrationProps {
  palette?: Palette;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * Competitive Landscape illustration
 * Shows multiple competitors/boxes with connections
 */
export function CompetitiveLandscapeIllustration({
  palette,
  className,
  ariaHidden = true,
}: IllustrationProps) {
  const activePalette = palette || pickPalette("competitive");
  const stroke = activePalette.bg;
  const fill = activePalette.accent1;

  return (
    <svg
      className={cn("w-full h-full", className)}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      {/* Background boxes (competitors) */}
      <rect x="40" y="100" width="80" height="60" rx="4" fill={fill} opacity="0.2" stroke={stroke} strokeWidth="2" />
      <rect x="160" y="80" width="80" height="60" rx="4" fill={fill} opacity="0.3" stroke={stroke} strokeWidth="2" />
      <rect x="280" y="110" width="80" height="60" rx="4" fill={fill} opacity="0.25" stroke={stroke} strokeWidth="2" />
      
      {/* Connecting lines */}
      <line x1="120" y1="130" x2="160" y2="110" stroke={stroke} strokeWidth="2" opacity="0.4" />
      <line x1="240" y1="110" x2="280" y2="140" stroke={stroke} strokeWidth="2" opacity="0.4" />
      
      {/* Center focus box */}
      <rect x="150" y="160" width="100" height="70" rx="4" fill={activePalette.bg} opacity="0.15" stroke={stroke} strokeWidth="3" />
      <text x="200" y="195" textAnchor="middle" fontSize="14" fill={stroke} fontWeight="600" opacity="0.8">You</text>
      
      {/* Opportunity badges */}
      <circle cx="80" cy="140" r="8" fill={activePalette.accent2} />
      <circle cx="320" cy="150" r="8" fill={activePalette.accent2} />
    </svg>
  );
}

/**
 * Evidence Confidence illustration
 * Shows confidence levels with stacked evidence sources
 */
export function EvidenceConfidenceIllustration({
  palette,
  className,
  ariaHidden = true,
}: IllustrationProps) {
  const activePalette = palette || pickPalette("evidence");
  const stroke = activePalette.bg;

  return (
    <svg
      className={cn("w-full h-full", className)}
      viewBox="0 0 350 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      {/* Evidence stack (left side) */}
      <rect x="40" y="180" width="60" height="40" rx="4" fill={activePalette.accent1} opacity="0.3" stroke={stroke} strokeWidth="2" />
      <rect x="45" y="140" width="60" height="40" rx="4" fill={activePalette.accent2} opacity="0.4" stroke={stroke} strokeWidth="2" />
      <rect x="50" y="100" width="60" height="40" rx="4" fill={activePalette.accent3} opacity="0.5" stroke={stroke} strokeWidth="2" />
      
      <defs>
        <marker id="evidence-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={stroke} />
        </marker>
      </defs>
      {/* Arrow pointing to confidence meter */}
      <path d="M 110 120 L 180 120" stroke={stroke} strokeWidth="2" fill="none" markerEnd="url(#evidence-arrowhead)" />
      
      {/* Confidence meter (right side) */}
      <rect x="200" y="80" width="20" height="120" rx="10" fill={activePalette.bg} opacity="0.1" stroke={stroke} strokeWidth="2" />
      <rect x="200" y="140" width="20" height="60" rx="10" fill={activePalette.bg} opacity="0.6" />
      
      {/* Labels */}
      <text x="70" y="230" textAnchor="middle" fontSize="12" fill={stroke} opacity="0.6">Sources</text>
      <text x="210" y="75" textAnchor="middle" fontSize="12" fill={stroke} opacity="0.6">Confidence</text>
    </svg>
  );
}

/**
 * Opportunities illustration
 * Shows ranked opportunities with scores
 */
export function OpportunitiesIllustration({
  palette,
  className,
  ariaHidden = true,
}: IllustrationProps) {
  const activePalette = palette || pickPalette("opportunities");
  const stroke = activePalette.bg;

  return (
    <svg
      className={cn("w-full h-full", className)}
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      {/* Ranked opportunity cards */}
      <rect x="50" y="40" width="300" height="50" rx="4" fill={activePalette.accent1} opacity="0.2" stroke={stroke} strokeWidth="2" />
      <rect x="60" y="50" width="20" height="30" rx="2" fill={activePalette.bg} opacity="0.4" />
      <line x1="90" y1="65" x2="320" y2="65" stroke={stroke} strokeWidth="2" opacity="0.6" />
      <circle cx="330" cy="65" r="12" fill={activePalette.accent2} opacity="0.5" />
      <text x="330" y="69" textAnchor="middle" fontSize="10" fill={activePalette.fg} fontWeight="600">1</text>
      
      <rect x="50" y="110" width="280" height="50" rx="4" fill={activePalette.accent2} opacity="0.15" stroke={stroke} strokeWidth="2" />
      <rect x="60" y="120" width="20" height="30" rx="2" fill={activePalette.bg} opacity="0.3" />
      <line x1="90" y1="135" x2="300" y2="135" stroke={stroke} strokeWidth="2" opacity="0.5" />
      <circle cx="310" cy="135" r="12" fill={activePalette.accent2} opacity="0.4" />
      <text x="310" y="139" textAnchor="middle" fontSize="10" fill={activePalette.fg} fontWeight="600">2</text>
      
      <rect x="50" y="180" width="260" height="50" rx="4" fill={activePalette.accent3} opacity="0.1" stroke={stroke} strokeWidth="2" />
      <rect x="60" y="190" width="20" height="30" rx="2" fill={activePalette.bg} opacity="0.25" />
      <line x1="90" y1="205" x2="280" y2="205" stroke={stroke} strokeWidth="2" opacity="0.4" />
      <circle cx="290" cy="205" r="12" fill={activePalette.accent2} opacity="0.3" />
      <text x="290" y="209" textAnchor="middle" fontSize="10" fill={activePalette.fg} fontWeight="600">3</text>
      
      {/* Trending arrow */}
      <path d="M 350 200 L 370 180 L 350 160" stroke={activePalette.accent1} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Workflow illustration
 * Shows 3-step process flow
 */
export function WorkflowIllustration({
  palette,
  className,
  ariaHidden = true,
}: IllustrationProps) {
  const activePalette = palette || pickPalette("workflow");
  const stroke = activePalette.bg;

  return (
    <svg
      className={cn("w-full h-full", className)}
      viewBox="0 0 450 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      {/* Step 1 */}
      <circle cx="80" cy="100" r="30" fill={activePalette.accent1} opacity="0.2" stroke={stroke} strokeWidth="2" />
      <text x="80" y="107" textAnchor="middle" fontSize="18" fill={stroke} fontWeight="600">1</text>
      
      <defs>
        <marker id="workflow-arrow1" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={stroke} />
        </marker>
        <marker id="workflow-arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={stroke} />
        </marker>
      </defs>
      {/* Arrow 1 */}
      <path d="M 110 100 L 170 100" stroke={stroke} strokeWidth="2" fill="none" markerEnd="url(#workflow-arrow1)" />
      
      {/* Step 2 */}
      <circle cx="225" cy="100" r="30" fill={activePalette.accent2} opacity="0.25" stroke={stroke} strokeWidth="2" />
      <text x="225" y="107" textAnchor="middle" fontSize="18" fill={stroke} fontWeight="600">2</text>
      
      {/* Arrow 2 */}
      <path d="M 255 100 L 315 100" stroke={stroke} strokeWidth="2" fill="none" markerEnd="url(#workflow-arrow2)" />
      
      {/* Step 3 */}
      <circle cx="370" cy="100" r="30" fill={activePalette.accent3} opacity="0.3" stroke={stroke} strokeWidth="2" />
      <text x="370" y="107" textAnchor="middle" fontSize="18" fill={stroke} fontWeight="600">3</text>
      
      {/* Connecting line */}
      <line x1="80" y1="100" x2="370" y2="100" stroke={stroke} strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />
    </svg>
  );
}
