import type { InputConfidence } from '@/lib/supabase/types'

interface ConfidenceEchoProps {
  /**
   * The user's input confidence level from project settings
   */
  inputConfidence: InputConfidence | null | undefined
}

/**
 * ConfidenceEcho: Mirrors the user's confidence selection back in Results
 * 
 * Builds trust by showing Plinth "understands the context of its own advice."
 * Appears once at the top of Results, non-dismissable but visually light.
 */
export function ConfidenceEcho({ inputConfidence }: ConfidenceEchoProps) {
  // Hide if no confidence level is set
  if (!inputConfidence) return null

  const messages: Record<InputConfidence, string> = {
    very_confident:
      'These recommendations reflect well-researched inputs and are suitable for decision-making.',
    some_assumptions:
      'These recommendations reflect inputs based on best available information and include some assumptions.',
    exploratory:
      'These recommendations reflect exploratory inputs and are intended for early framing and hypothesis testing.',
  }

  const message = messages[inputConfidence]

  return (
    <div className="rounded-lg bg-muted/30 border border-border/50 px-4 py-3">
      <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
    </div>
  )
}

