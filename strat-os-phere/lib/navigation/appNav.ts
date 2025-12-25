import {
  Target,
  TrendingUp,
  Briefcase,
  ClipboardList,
  Users,
  FileText,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItemId =
  | 'opportunities'
  | 'strategic_bets'
  | 'jobs'
  | 'scorecard'
  | 'competitors'
  | 'evidence'
  | 'settings'

export interface NavItem {
  id: NavItemId
  label: string
  icon: LucideIcon
  href: (projectId: string) => string
  // If true, only show when the artifact exists
  conditional?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'opportunities',
    label: 'Opportunities',
    icon: Target,
    href: (projectId) => `/projects/${projectId}/opportunities`,
  },
  {
    id: 'strategic_bets',
    label: 'Strategic Bets',
    icon: TrendingUp,
    href: (projectId) => `/projects/${projectId}/strategic-bets`,
    conditional: true, // Only show if strategic bets artifact exists
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    href: (projectId) => `/projects/${projectId}/jobs`,
  },
  {
    id: 'scorecard',
    label: 'Scorecard',
    icon: ClipboardList,
    href: (projectId) => `/projects/${projectId}/scorecard`,
  },
  {
    id: 'competitors',
    label: 'Competitors',
    icon: Users,
    href: (projectId) => `/projects/${projectId}/competitors`,
  },
  {
    id: 'evidence',
    label: 'Evidence',
    icon: FileText,
    href: (projectId) => `/projects/${projectId}/evidence`,
    conditional: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: (projectId) => `/projects/${projectId}/settings`,
    conditional: true,
  },
]

