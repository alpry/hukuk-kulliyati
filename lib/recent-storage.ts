'use client'

export type RecentMadde = {
  kanunId: string
  kanunBaslik: string
  maddeId: string
  maddeNo: number
  baslik: string | null
  metinOzet?: string | null
  openedAt: number
}

const KEY = 'hk:recent-maddeler'
const MAX = 25

export function getRecent(): RecentMadde[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentMadde[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function addRecent(entry: RecentMadde) {
  if (typeof window === 'undefined') return
  const current = getRecent().filter(r => r.maddeId !== entry.maddeId)
  const next = [{ ...entry, openedAt: Date.now() }, ...current].slice(0, MAX)
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* quota */
  }
}

export function clearRecent() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}

export function formatRelative(ts: number): string {
  const diff = Math.max(0, Date.now() - ts)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'az önce'
  if (m < 60) return `${m} dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} sa önce`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} gün önce`
  const mo = Math.floor(d / 30)
  return `${mo} ay önce`
}
