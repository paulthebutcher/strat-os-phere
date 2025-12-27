/**
 * Design tokens for consistent typography, spacing, and layout
 * 
 * These tokens provide a single source of truth for common design values
 * used across the application. They help maintain consistency and make
 * it easier to update spacing/typography globally.
 */

// Layout tokens
export const containerMaxWidth = 'max-w-7xl'
export const sectionPaddingY = 'py-8 sm:py-12'
export const cardRadius = 'rounded-lg'
export const shadowCard = 'shadow-sm'

// App shell layout tokens
// Gutter between left nav and main content: 24px on desktop, 16px on mobile
export const appGutter = {
  mobile: 'pl-4', // 16px
  desktop: 'pl-6', // 24px
  combined: 'pl-4 md:pl-6', // Responsive: 16px mobile, 24px desktop
} as const

// Typography tokens
export const textStyles = {
  heading: {
    xl: 'text-3xl font-semibold tracking-tight',
    lg: 'text-2xl font-semibold tracking-tight',
    md: 'text-xl font-semibold tracking-tight',
    sm: 'text-lg font-semibold tracking-tight',
  },
  subheading: {
    lg: 'text-lg font-medium',
    md: 'text-base font-medium',
    sm: 'text-sm font-medium',
  },
  body: {
    lg: 'text-base leading-normal',
    md: 'text-sm leading-normal',
    sm: 'text-xs leading-normal',
  },
  muted: {
    lg: 'text-base text-muted-foreground',
    md: 'text-sm text-muted-foreground',
    sm: 'text-xs text-muted-foreground',
  },
} as const

// Spacing tokens
export const spacing = {
  section: {
    gap: 'gap-6',
    paddingY: sectionPaddingY,
  },
  card: {
    padding: 'p-6',
    gap: 'gap-4',
  },
  page: {
    paddingX: 'px-4 sm:px-6 lg:px-8',
    paddingY: 'py-6 sm:py-8',
  },
} as const

