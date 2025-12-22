/**
 * Graphics style system
 * 
 * Provides palettes and utilities for consistent visual styling across graphics components.
 */

export type Palette = {
  name: string;
  bg: string;
  fg: string;
  accent1: string;
  accent2: string;
  accent3: string;
};

export const palettes: Record<string, Palette> = {
  indigo: {
    name: "indigo",
    bg: "hsl(230, 60%, 45%)", // accent-primary
    fg: "hsl(0, 0%, 98%)",
    accent1: "hsl(230, 60%, 55%)",
    accent2: "hsl(230, 60%, 35%)",
    accent3: "hsl(230, 40%, 60%)",
  },
  emerald: {
    name: "emerald",
    bg: "hsl(142, 60%, 40%)", // success
    fg: "hsl(0, 0%, 98%)",
    accent1: "hsl(142, 60%, 50%)",
    accent2: "hsl(142, 50%, 35%)",
    accent3: "hsl(142, 70%, 55%)",
  },
  amber: {
    name: "amber",
    bg: "hsl(38, 80%, 45%)", // warning
    fg: "hsl(0, 0%, 98%)",
    accent1: "hsl(38, 80%, 55%)",
    accent2: "hsl(38, 70%, 35%)",
    accent3: "hsl(38, 90%, 60%)",
  },
  slate: {
    name: "slate",
    bg: "hsl(0, 0%, 40%)", // text-secondary
    fg: "hsl(0, 0%, 98%)",
    accent1: "hsl(0, 0%, 50%)",
    accent2: "hsl(0, 0%, 30%)",
    accent3: "hsl(0, 0%, 60%)",
  },
};

/**
 * Deterministically picks a palette based on a seed string.
 * Uses simple hash of the string to select from available palettes.
 */
export function pickPalette(seed?: string): Palette {
  if (!seed) {
    return palettes.indigo;
  }

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const paletteKeys = Object.keys(palettes);
  const index = Math.abs(hash) % paletteKeys.length;
  return palettes[paletteKeys[index]];
}

/**
 * Returns opacity values for different visual levels.
 */
export function opacityScale(level: "subtle" | "medium" | "bold"): number {
  switch (level) {
    case "subtle":
      return 0.05;
    case "medium":
      return 0.15;
    case "bold":
      return 0.3;
    default:
      return 0.1;
  }
}
