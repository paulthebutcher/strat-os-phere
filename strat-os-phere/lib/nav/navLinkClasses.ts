/**
 * Navigation link class utilities
 * Provides consistent styling for navigation items with exact Tailwind tokens
 */

import { cn } from '@/lib/utils'

export interface NavLinkClassesOptions {
  isActive: boolean
  isDisabled?: boolean
  isDecision?: boolean
}

/**
 * Get base classes for navigation links
 * Applies exact Tailwind tokens as specified in PR requirements
 */
export function navLinkClasses({ isActive, isDisabled = false, isDecision = false }: NavLinkClassesOptions): string {
  return cn(
    // Base styles
    'relative flex items-center gap-3 rounded-xl px-3 py-2',
    'text-slate-700',
    'transition-all duration-150',
    'group', // For icon hover states
    
    // Active state (current route)
    isActive && [
      'bg-slate-100',
      'text-slate-900 font-semibold',
      'ring-1 ring-slate-200/60', // Subtle inset border
      // Left accent bar
      'before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-blue-600',
    ],
    
    // Hover state (only when not active)
    !isActive && !isDisabled && [
      'hover:bg-slate-50',
      'hover:text-slate-900',
    ],
    
    // Focus state (keyboard navigation)
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    
    // Disabled state
    isDisabled && [
      'opacity-50 pointer-events-none',
    ],
    
    // Decision item gets slightly stronger treatment when active
    isDecision && isActive && 'font-semibold'
  )
}

/**
 * Get icon classes for navigation items
 * Icons should follow the hover/active state of their parent
 */
export function navIconClasses({ isActive, isDisabled = false }: { isActive: boolean; isDisabled?: boolean }): string {
  return cn(
    'h-5 w-5 shrink-0 transition-colors',
    // Base icon color
    isActive ? 'text-slate-900' : 'text-slate-500',
    // Hover state (handled by group-hover on parent)
    !isActive && !isDisabled && 'group-hover:text-slate-700',
    // Disabled state
    isDisabled && 'opacity-50'
  )
}

