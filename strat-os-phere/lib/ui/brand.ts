/**
 * Brand Design Tokens
 * 
 * Centralized design tokens for consistent styling across marketing and app.
 * All tokens are Tailwind class strings to maintain consistency with existing patterns.
 * 
 * Design Philosophy:
 * - Restrained neutrals + single accent
 * - Color encodes meaning, not personality
 * - Status colors are semantic (draft/ready/has results)
 * - Evidence strength uses subtle progress indicators
 */

export const brand = {
  // Primary accent color classes
  primary: {
    bg: "bg-accent-primary",
    text: "text-accent-primary",
    border: "border-accent-primary",
    bgSubtle: "bg-accent-primary/10",
    bgMedium: "bg-accent-primary/20",
    bgStrong: "bg-accent-primary/90",
  },
  
  // Primary gradient (for CTAs)
  gradient: {
    bg: "plinth-gradient",
    text: "text-white",
    hover: "hover:opacity-90",
  },
  
  // Surface colors (backgrounds, cards, panels)
  surface: {
    base: "bg-surface",
    muted: "bg-surface-muted",
    marketing: "bg-[hsl(var(--marketing-surface))]",
    marketing2: "bg-[hsl(var(--marketing-surface-2))]",
    border: "border-border-subtle",
    borderStrong: "border-border-strong",
    tint: "plinth-surface-tint",
    tint2: "plinth-surface-tint-2",
  },
  
  // Typography scale
  typeScale: {
    headline: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
    subhead: "text-2xl md:text-3xl font-semibold tracking-tight",
    body: "text-base md:text-lg leading-relaxed",
    bodyLarge: "text-lg md:text-xl leading-relaxed",
    label: "text-sm font-medium",
    labelSmall: "text-xs font-medium",
    metadata: "text-xs text-text-muted",
  },
  
  // Border radius presets
  radius: {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  },
  
  // Shadow presets
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  },
  
  // Spacing presets (for consistent gaps/padding)
  spacing: {
    xs: "gap-1 space-y-1",
    sm: "gap-2 space-y-2",
    md: "gap-4 space-y-4",
    lg: "gap-6 space-y-6",
    xl: "gap-8 space-y-8",
    section: "py-24 md:py-32",
  },
  
  // Project status colors (semantic states)
  status: {
    draft: {
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-border",
    },
    ready: {
      bg: "bg-accent-primary/10",
      text: "text-accent-primary",
      border: "border-accent-primary/30",
    },
    hasResults: {
      bg: "bg-success/10",
      text: "text-success",
      border: "border-success/30",
    },
  },
  
  // Evidence strength colors (for progress indicators)
  evidence: {
    none: {
      bg: "bg-muted-foreground/20",
      text: "text-muted-foreground",
      label: "None",
    },
    weak: {
      bg: "bg-warning/30",
      text: "text-warning",
      label: "Low",
    },
    medium: {
      bg: "bg-accent-primary/40",
      text: "text-accent-primary",
      label: "Medium",
    },
    strong: {
      bg: "bg-success",
      text: "text-success",
      label: "Strong",
    },
  },
  
  // Tone colors for TrustChips and status indicators
  tone: {
    neutral: {
      bg: "bg-surface-muted",
      text: "text-text-secondary",
      border: "border-border-subtle",
    },
    good: {
      bg: "bg-success/10",
      text: "text-success",
      border: "border-success/30",
    },
    warn: {
      bg: "bg-warning/10",
      text: "text-warning",
      border: "border-warning/30",
    },
    bad: {
      bg: "bg-danger/10",
      text: "text-danger",
      border: "border-danger/30",
    },
  },
} as const

