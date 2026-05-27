'use client'

import { useRef, useState } from 'react'
import { Star } from 'lucide-react'

export default function FavoriteButton({ maddeId, initial }: { maddeId: number; initial?: boolean }) {
  const [fav, setFav] = useState<boolean>(initial ?? false)
  const [loading, setLoading] = useState(false)
  const pendingRef = useRef(false)

  async function toggle() {
    if (pendingRef.current) return
    pendingRef.current = true

    const next = !fav
    setFav(next)
    setLoading(true)

    try {
      const res = await fetch('/api/favoriler', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maddeId }),
      })
      if (!res.ok) setFav(!next)
    } catch {
      setFav(!next)
    } finally {
      setLoading(false)
      pendingRef.current = false
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={fav}
      aria-label={fav ? 'Favoriden çıkar' : 'Favorilere ekle'}
      className={`icon-btn ${
        fav
          ? 'text-amber-500 border-amber-300 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400'
          : ''
      }`}
    >
      <Star className="w-3.5 h-3.5" strokeWidth={1.75} fill={fav ? 'currentColor' : 'none'} />
    </button>
  )
}
