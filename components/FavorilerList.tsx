'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Star, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export type FavRow = {
  id: string
  created_at: string
  madde_id: number
  maddeler: {
    id: number
    madde_no: number
    baslik: string | null
    metin: string
    kanun_id: number
    kanunlar: { kanun_id: number; baslik: string } | null
  } | null
}

export default function FavorilerList({ favoriler: initial }: { favoriler: FavRow[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [removing, setRemoving] = useState<Set<string>>(new Set())

  async function handleRemove(e: React.MouseEvent, fav: FavRow) {
    e.preventDefault()
    e.stopPropagation()
    if (removing.has(fav.id)) return
    setRemoving(prev => new Set(prev).add(fav.id))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setRemoving(prev => {
        const next = new Set(prev)
        next.delete(fav.id)
        return next
      })
      return
    }

    const { error } = await supabase
      .from('favoriler')
      .delete()
      .eq('user_id', user.id)
      .eq('madde_id', fav.madde_id)

    if (!error) {
      setItems(prev => prev.filter(x => x.id !== fav.id))
      router.refresh()
    } else {
      setRemoving(prev => {
        const next = new Set(prev)
        next.delete(fav.id)
        return next
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="surface p-8 text-center">
        <Star className="w-6 h-6 text-subtle mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-[13px] font-medium">Favori maddeniz yok</p>
        <p className="text-[12px] text-subtle mt-1">
          Bir madde sayfasında yıldız ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
        </p>
      </div>
    )
  }

  return (
    <ul className="surface divide-y divide-[var(--border)]">
      {items.map(f => {
        const m = f.maddeler
        const k = m?.kanunlar
        if (!m || !k) return null
        const isRemoving = removing.has(f.id)
        return (
          <li key={f.id} className="relative">
            <Link
              href={`/dashboard/kanun/${k.kanun_id}/madde/${m.id}`}
              className="block px-4 py-3.5 pr-12 hover:bg-[var(--surface-muted)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full card-pill bg-[var(--primary-soft)] text-[var(--primary)]">
                  Madde {m.madde_no}
                </span>
                <span className="text-[11px] text-muted truncate">{k.baslik}</span>
              </div>
              {m.baslik && <p className="text-[12px] font-medium mb-1">{m.baslik}</p>}
              <p className="text-[12px] text-muted line-clamp-2">{m.metin}</p>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--primary)]">
                Aç <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </div>
            </Link>
            <button
              type="button"
              onClick={e => handleRemove(e, f)}
              disabled={isRemoving}
              aria-label="Favoriden çıkar"
              className="absolute top-3 right-3 p-2 rounded-md text-subtle hover:text-red-500 hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
