/**
 * View model type for project cards on the Projects landing page.
 * This is a safe, UI-focused representation that doesn't assume optional DB fields exist.
 */
export interface ProjectCardModel {
  id: string
  title: string
  market?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  lastTouchedAt: string | null
  status: 'draft' | 'running' | 'ready' | 'unknown'
  primaryAction: {
    label: string
    href: string
  }
  secondaryAction?: {
    label: string
    href: string
  }
  metaChips: Array<{
    label: string
    tone?: 'neutral' | 'good' | 'warn'
  }>
}

