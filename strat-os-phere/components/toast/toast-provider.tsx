'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AnalysisRunToast } from './analysis-run-toast'

interface AnalysisRunToastState {
  projectId: string
  runId: string
  resultsUrl: string
}

interface ToastContextValue {
  showAnalysisRunToast: (state: AnalysisRunToastState) => void
  dismissAnalysisRunToast: () => void
  currentToast: AnalysisRunToastState | null
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return no-op functions if context is not available
    // This allows components to work even if not wrapped in ToastProvider
    return {
      showAnalysisRunToast: () => {},
      dismissAnalysisRunToast: () => {},
      currentToast: null,
    }
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [currentToast, setCurrentToast] = useState<AnalysisRunToastState | null>(null)

  const showAnalysisRunToast = useCallback((state: AnalysisRunToastState) => {
    setCurrentToast(state)
  }, [])

  const dismissAnalysisRunToast = useCallback(() => {
    setCurrentToast(null)
  }, [])

  return (
    <ToastContext.Provider
      value={{
        showAnalysisRunToast,
        dismissAnalysisRunToast,
        currentToast,
      }}
    >
      {children}
      {currentToast && (
        <AnalysisRunToast
          projectId={currentToast.projectId}
          runId={currentToast.runId}
          resultsUrl={currentToast.resultsUrl}
          onDismiss={dismissAnalysisRunToast}
        />
      )}
    </ToastContext.Provider>
  )
}

