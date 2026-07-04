import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif"
const BODY_FONT = "'Plus Jakarta Sans', system-ui, sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#f7f4ee',
  surface: '#ffffff',
  raised: '#f3ede1',
  text: '#1f2430',
  muted: '#6d7485',
  line: '#ddd2bd',
  accent: '#aa2b1d',
  accentSoft: '#f3cf7a',
  onAccent: '#fffaf1',
  glow: 'rgba(204,86,30,0.16)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Stories', note: 'Long-form reads, updates and practical insight.' },
  listing: { ...base, kicker: 'Directory', note: 'Profiles, businesses and useful local information.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Fresh offers, open requests and timely listings.' },
  image: { ...base, kicker: 'Gallery', note: 'Visual posts, snapshots and image-led discovery.' },
  sbm: { ...base, kicker: 'Resources', note: 'Saved links and tools worth keeping close.' },
  pdf: { ...base, kicker: 'Documents', note: 'Guides, downloads and reference material.' },
  profile: { ...base, kicker: 'Profiles', note: 'People, services and professional highlights.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': '#cc561e',
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
