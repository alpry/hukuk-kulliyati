'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Highlight, snippet } from '@/lib/highlight'

export type NotRow = {
  id: string
  icerik: string
  updated_at: string | null
  madde_id: number
  maddeler: {
    id: number
    madde_no: number
    baslik: string | null
    kanun_id: number
    kanunlar: { kanun_id: number; baslik: string } | null
  } | null
}

function relTime(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'az önce'
  if (m < 60) return `${m} dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} sa önce`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} gün önce`
  return new Date(iso).toLocaleDateString('tr-TR')
}

export default function NotlarList({ notlar }: { notlar: NotRow[] }) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState(notlar)
  const [removing, setRemoving] = useState<Set<string>>(new Set())
  const trimmed = query.trim()
  const isSearching = trimmed.length >= 2

  const filtered = useMemo(() => {
    if (!isSearching) return items
    const q = trimmed.toLowerCase()
    return items.filter(n => n.icerik.toLowerCase().includes(q))
  }, [items, isSearching, trimmed])

  async function handleDelete(e: React.MouseEvent, noteId: string) {
    e.preventDefault()
    e.stopPropagation()
    if (removing.has(noteId)) return
    setRemoving(prev => new Set(prev).add(noteId))
    const supabase = createClient()
    const { error } = await supabase.from('notlar').delete().eq('id', noteId)
    if (!error) {
      setItems(prev => prev.filter(n => n.id !== noteId))
    } else {
      setRemoving(prev => {
        const next = new Set(prev)
        next.delete(noteId)
        return next
      })
    }
  }

  return (
    <>
      <div className="search-shell mb-4">
        <Search className="w-4 h-4 text-subtle shrink-0" strokeWidth={1.75} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Notlarımda ara…"
          className="flex-1 bg-transparent outline-none border-0 text-[13px] placeholder:text-subtle py-0.5"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-1 rounded-md text-subtle hover:text-muted hover:bg-[var(--surface-muted)] transition-colors"
            aria-label="Temizle"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isSearching && (
        <p className="text-[11px] text-subtle mb-2.5 uppercase tracking-widest font-medium">
          {filtered.length} sonuç
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="surface p-8 text-center">
          <p className="text-[13px] text-muted">
            {isSearching ? 'Sonuç bulunamadı' : 'Henüz notunuz yok'}
          </p>
        </div>
      ) : (
        <ul className="surface divide-y divide-[var(--border)]">
          {filtered.map(n => {
            const m = n.maddeler
            const k = m?.kanunlar
            const href = m && k ? `/dashboard/kanun/${k.kanun_id}/madde/${m.id}` : '#'
            const display = isSearching ? snippet(n.icerik, trimmed, 60, 160) : n.icerik
            const isRemoving = removing.has(n.id)
            return (
              <li key={n.id} className="relative">
                <Link
                  href={href}
                  className="block px-4 py-3.5 pr-12 hover:bg-[var(--surface-muted)] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {m && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full card-pill bg-[var(--primary-soft)] text-[var(--primary)]">
                        Madde {m.madde_no}
                      </span>
                    )}
                    {k && <span className="text-[11px] text-muted truncate">{k.baslik}</span>}
                    <span className="ml-auto text-[10px] text-subtle">{relTime(n.updated_at)}</span>
                  </div>
                  {m?.baslik && <p className="text-[12px] font-medium mb-1">{m.baslik}</p>}
                  <p className="text-[12px] text-muted line-clamp-2 whitespace-pre-line">
                    <Highlight text={display} query={isSearching ? trimmed : undefined} />
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--primary)]">
                    Aç <ArrowRight className="w-3 h-3" strokeWidth={2} />
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={e => handleDelete(e, n.id)}
                  disabled={isRemoving}
                  aria-label="Notu sil"
                  className="absolute top-3 right-3 p-2 rounded-md text-subtle hover:text-red-500 hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
