/**
 * Toast notification helpers
 * Uses sonner for global toast notifications
 */

import { toast as sonnerToast } from 'sonner'

export function toastSuccess(title: string, description?: string) {
  sonnerToast.success(title, {
    description,
  })
}

export function toastError(title: string, description?: string) {
  sonnerToast.error(title, {
    description,
  })
}

export function toastInfo(title: string, description?: string) {
  sonnerToast.info(title, {
    description,
  })
}

// Re-export the toast object for convenience
export const toast = {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
}

