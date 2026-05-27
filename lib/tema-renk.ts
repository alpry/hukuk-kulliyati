export type TemaRenk = 'mor' | 'bakir' | 'yesil' | 'kirmizi' | 'gri'

export const TEMA_RENKLERI: { id: TemaRenk; label: string; hex: string }[] = [
  { id: 'mor', label: 'Mor', hex: '#4F46E5' },
  { id: 'bakir', label: 'Bakır', hex: '#92400e' },
  { id: 'yesil', label: 'Koyu Yeşil', hex: '#166534' },
  { id: 'kirmizi', label: 'Koyu Kırmızı', hex: '#9f1239' },
  { id: 'gri', label: 'Koyu Gri', hex: '#374151' },
]

const VARSAYILAN: TemaRenk = 'mor'
const STORAGE_KEY = 'hk_color'
const VALID = new Set<TemaRenk>(TEMA_RENKLERI.map(t => t.id))

export function applyTemaRenk(renk: TemaRenk) {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  TEMA_RENKLERI.forEach(t => html.classList.remove(`theme-${t.id}`))
  html.classList.add(`theme-${renk}`)
  try {
    localStorage.setItem(STORAGE_KEY, renk)
  } catch {}
}

export function getInitialTemaRenk(): TemaRenk {
  if (typeof localStorage === 'undefined') return VARSAYILAN
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v && VALID.has(v as TemaRenk) ? (v as TemaRenk) : VARSAYILAN
  } catch {
    return VARSAYILAN
  }
}
