// Third-party Imports
import type * as Icon from 'lucide-react'

type IconName = keyof typeof Icon

export type MenuLeafSubItem = {
  label: string
  href: string
  activePath?: string
  badge?: string
  badgeClassName?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export type MenuGroupSubItem = {
  label: string
  childItems: MenuLeafSubItem[]
}

export type MenuSubItem = MenuLeafSubItem | MenuGroupSubItem

export type MenuItem = {
  icon: IconName
  label: string
} & (
  | {
      href: string
      badge?: string
      badgeClassName?: string
      childItems?: never
      target?: '_blank' | '_self' | '_parent' | '_top'
    }
  | {
      href?: never
      badge?: string
      badgeClassName?: string
      childItems: MenuSubItem[]
    }
)

export type NavItem = {
  groupLabel?: string
  items: MenuItem[]
}

export const navItems: NavItem[] = [
  {
    groupLabel: 'Ideas for India 2026',
    items: [
      {
        icon: 'Radio',
        label: 'Sovereign Disaster Command',
        href: '/dashboard/format/disaster-command',
        badge: 'Live Demo',
        badgeClassName: 'bg-[#FBBA72]/15 text-[#FBBA72] border-[#FBBA72]/40',
      },
      {
        icon: 'Award',
        label: 'Ideas for India Pitch Deck',
        href: '/dashboard/format/pitch-deck',
        badge: 'Q1–Q9',
        badgeClassName: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
      },
    ]
  },
  {
    groupLabel: 'Core SABER Platform',
    items: [
      {
        icon: 'FileText',
        label: 'Classic Query Inspector',
        href: '/dashboard/format/query',
        badge: '14,832 Scenes',
        badgeClassName: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
      },
      {
        icon: 'CloudOff',
        label: 'Cloud-Free Demonstration',
        href: '/dashboard/format/cloud-free',
      },
      {
        icon: 'Share2',
        label: 'Interactive Query Space',
        href: '/dashboard/format/embeddings',
      },
      {
        icon: 'Database',
        label: 'DSRSID 1,000 Scene Search',
        href: '/dashboard/format/dsrsid-search',
      },
      {
        icon: 'Sliders',
        label: 'Ablation Studies',
        href: '/dashboard/format/abliation',
      },
      {
        icon: 'Activity',
        label: 'Training Telemetry',
        href: '/dashboard/format/training',
      },
    ]
  }
]
