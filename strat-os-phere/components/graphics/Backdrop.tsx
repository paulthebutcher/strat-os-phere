/**
 * Backdrop component
 * 
 * Reusable SVG backdrop with gridlines, gradient blobs, and optional noise.
 * Used behind sections to add depth and visual interest.
 */

import React from "react";
import { Palette, pickPalette, opacityScale } from "./style";
import { cn } from "@/lib/utils";

export interface BackdropProps {
  variant?: "hero" | "section" | "card" | "sidebar";
  palette?: Palette;
  density?: "subtle" | "medium";
  className?: string;
}

export function Backdrop({
  variant = "section",
  palette,
  density = "subtle",
  className,
}: BackdropProps) {
  const activePalette = palette || pickPalette("default");
  const opacity = opacityScale(density);

  // Variant-specific sizing and positioning
  const dimensions = {
    hero: { width: "100%", height: "100%", viewBox: "0 0 1200 600" },
    section: { width: "100%", height: "100%", viewBox: "0 0 1200 400" },
    card: { width: "100%", height: "100%", viewBox: "0 0 400 300" },
    sidebar: { width: "100%", height: "100%", viewBox: "0 0 300 800" },
  };

  const config = dimensions[variant];

  return (
    <svg
      className={cn("absolute inset-0 pointer-events-none", className)}
      width={config.width}
      height={config.height}
      viewBox={config.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Grid pattern */}
        <pattern
          id={`grid-${variant}`}
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke={activePalette.bg}
            strokeWidth="0.5"
            opacity={opacity * 0.5}
          />
        </pattern>

        {/* Gradient blobs */}
        <radialGradient id={`blob1-${variant}`} cx="30%" cy="20%">
          <stop offset="0%" stopColor={activePalette.accent1} stopOpacity={opacity * 2} />
          <stop offset="100%" stopColor={activePalette.accent2} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`blob2-${variant}`} cx="70%" cy="80%">
          <stop offset="0%" stopColor={activePalette.accent2} stopOpacity={opacity * 1.5} />
          <stop offset="100%" stopColor={activePalette.accent3} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`blob3-${variant}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={activePalette.accent3} stopOpacity={opacity} />
          <stop offset="100%" stopColor={activePalette.accent1} stopOpacity="0" />
        </radialGradient>

        {/* Noise filter (very subtle) */}
        <filter id={`noise-${variant}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0.02" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* Grid background */}
      <rect width="100%" height="100%" fill={`url(#grid-${variant})`} />

      {/* Gradient blobs */}
      <circle
        cx="30%"
        cy="20%"
        r={variant === "hero" ? "200" : variant === "section" ? "150" : "100"}
        fill={`url(#blob1-${variant})`}
        style={{ mixBlendMode: "multiply" }}
      />
      <circle
        cx="70%"
        cy="80%"
        r={variant === "hero" ? "180" : variant === "section" ? "140" : "90"}
        fill={`url(#blob2-${variant})`}
        style={{ mixBlendMode: "multiply" }}
      />
      <circle
        cx="50%"
        cy="50%"
        r={variant === "hero" ? "160" : variant === "section" ? "120" : "80"}
        fill={`url(#blob3-${variant})`}
        style={{ mixBlendMode: "multiply" }}
      />

      {/* Subtle noise overlay */}
      {density === "medium" && (
        <rect
          width="100%"
          height="100%"
          fill="rgba(255,255,255,0.02)"
          opacity="0.03"
          filter={`url(#noise-${variant})`}
        />
      )}
    </svg>
  );
}
