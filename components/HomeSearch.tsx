'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Highlight, snippet } from '@/lib/highlight'

type Result = {
  id: string
  madde_no: number
  baslik: string | null
  metin: string
  path: string | null
  kanun_id: number
  kanunBaslik: string
}

type KanunMini = { kanun_id: number; baslik: string }

export default function HomeSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const kanunMapRef = useRef<Map<number, string>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Kanun başlıklarını bir kere yükle
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.from('kanunlar').select('kanun_id, baslik')
      if (cancelled) return
      const m = new Map<number, string>()
      ;(data as KanunMini[] | null || []).forEach(k => m.set(Number(k.kanun_id), k.baslik))
      kanunMapRef.current = m
    })()
    return () => { cancelled = true }
  }, [supabase])

  // Dış tıklama -> kapat
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) { setResults(null); return }
    setLoading(true)

    // "TBK 49" gibi kanun adı + madde no
    const compound = trimmed.match(/^([A-Za-zçÇğĞıİöÖşŞüÜ.\s]+?)\s+(\d+)$/i)
    let data: Result[] = []

    if (compound) {
      const kanunAdi = compound[1].trim().toLowerCase()
      const maddeNo = parseInt(compound[2])
      // Önce başlık ile kanun ara
      const kanunlar = Array.from(kanunMapRef.current.entries()).filter(([, b]) => {
        const lo = b.toLowerCase()
        return lo.includes(kanunAdi) ||
          lo.split(/\s+/).map(w => w[0]).join('').includes(kanunAdi.replace(/\s+/g, ''))
      })
      if (kanunlar.length > 0) {
        const ids = kanunlar.map(([id]) => id)
        const { data: rows } = await supabase
          .from('maddeler')
          .select('id, madde_no, baslik, metin, path, kanun_id')
          .in('kanun_id', ids)
          .eq('madde_no', maddeNo)
          .limit(10)
        data = (rows || []).map(r => ({ ...r, kanunBaslik: kanunMapRef.current.get(Number(r.kanun_id)) || '' })) as Result[]
      }
    }

    if (data.length === 0) {
      const numeric = trimmed.match(/^(\d+)$/)
      if (numeric) {
        const { data: rows } = await supabase
          .from('maddeler')
          .select('id, madde_no, baslik, metin, path, kanun_id')
          .eq('madde_no', parseInt(numeric[1]))
          .limit(20)
        data = (rows || []).map(r => ({ ...r, kanunBaslik: kanunMapRef.current.get(Number(r.kanun_id)) || '' })) as Result[]
      } else {
        const p = `%${trimmed}%`
        const { data: rows } = await supabase
          .from('maddeler')
          .select('id, madde_no, baslik, metin, path, kanun_id')
          .ilike('metin', p)
          .limit(20)
        data = (rows || []).map(r => ({ ...r, kanunBaslik: kanunMapRef.current.get(Number(r.kanun_id)) || '' })) as Result[]
      }
    }

    setResults(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 280)
    return () => clearTimeout(t)
  }, [query, doSearch])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="search-shell">
        <Search className="w-[18px] h-[18px] text-subtle shrink-0" strokeWidth={1.75} />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Madde ara… TBK 49, ölçülülük ilkesi, cumhurbaşkanı seçim süresi"
          className="flex-1 bg-transparent outline-none border-0 text-[15px] placeholder:text-subtle py-1"
        />
        {loading && (
          <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin shrink-0" />
        )}
        {query && !loading && (
          <button
            onClick={() => { setQuery(''); setResults(null) }}
            className="p-1 rounded-md text-subtle hover:text-muted hover:bg-[var(--surface-muted)] transition-colors"
            aria-label="Temizle"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-30 left-0 right-0 mt-2 surface p-2 max-h-[60vh] overflow-y-auto">
          {results === null || results.length === 0 ? (
            <p className="text-[12px] text-subtle text-center py-6">
              {loading ? 'Aranıyor…' : 'Sonuç bulunamadı'}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {results.map(r => (
                <li key={r.id}>
                  <Link
                    href={`/dashboard/kanun/${r.kanun_id}/madde/${r.id}`}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full card-pill bg-[var(--primary-soft)] text-[var(--primary)]">
                        Madde {r.madde_no}
                      </span>
                      <span className="text-[11px] text-muted truncate">{r.kanunBaslik}</span>
                    </div>
                    {r.baslik && <p className="text-[12px] font-medium mb-0.5 truncate">{r.baslik}</p>}
                    <p className="text-[11px] text-subtle line-clamp-2">
                      <Highlight text={snippet(r.metin, query)} query={query} />
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
