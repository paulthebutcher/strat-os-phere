/**
 * Simple toast notification utility
 * For now, using inline feedback patterns instead of global toast system
 * to avoid requiring root layout changes.
 * 
 * This file is a placeholder for future toast implementation.
 * Components should use inline feedback (e.g., CopySectionButton's "Copied" state)
 * or success/error messages within their own component boundaries.
 */

// Placeholder exports for consistency
export function useToast() {
  return {
    showToast: (_message: string, _variant: 'success' | 'error' | 'info') => {
      // No-op for now - components use inline feedback
    },
  }
}

export const toast = {
  success: (_message: string) => {
    // No-op for now
  },
  error: (_message: string) => {
    // No-op for now
  },
  info: (_message: string) => {
    // No-op for now
  },
}

