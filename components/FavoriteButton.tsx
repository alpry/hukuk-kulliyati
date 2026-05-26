'use client'

import { useEffect, useState, useTransition } from 'react'
import { Star } from 'lucide-react'
import { addFavorite, isFavorite, removeFavorite } from '@/lib/favorites'

export default function FavoriteButton({ maddeId, initial }: { maddeId: number; initial?: boolean }) {
  const [fav, setFav] = useState<boolean>(initial ?? false)
  const [ready, setReady] = useState<boolean>(initial !== undefined)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (initial !== undefined) return
    let cancelled = false
    isFavorite(maddeId).then(v => { if (!cancelled) { setFav(v); setReady(true) } })
    return () => { cancelled = true }
  }, [maddeId, initial])

  function toggle() {
    if (!ready || pending) return
    const next = !fav
    setFav(next)
    startTransition(async () => {
      const { error } = next ? await addFavorite(maddeId) : await removeFavorite(maddeId)
      if (error) setFav(!next)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={!ready || pending}
      aria-pressed={fav}
      aria-label={fav ? 'Favoriden çıkar' : 'Favorilere ekle'}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] transition-colors ${
        fav
          ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'
          : 'border-[var(--border)] bg-[var(--surface)] text-muted hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
      }`}
    >
      <Star className="w-3.5 h-3.5" strokeWidth={1.75} fill={fav ? 'currentColor' : 'none'} />
      {fav ? 'Favoride' : 'Favorile'}
    </button>
  )
}
