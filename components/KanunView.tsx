'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import KanunAccordion from './KanunAccordion'
import MaddeListItem from './MaddeListItem'
import { snippet } from '@/lib/highlight'
import type { ColorScheme } from '@/lib/kanun-colors'

type Madde = {
  id: string
  madde_no: number
  path: string | null
  baslik: string | null
}

type SearchMadde = {
  id: string
  madde_no: number
  baslik: string | null
  metin: string
  path: string | null
}

export default function KanunView({ maddeler, kanunId, noteIds, colorScheme }: {
  maddeler: Madde[]
  kanunId: string
  noteIds: string[]
  colorScheme: ColorScheme
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchMadde[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const cs = colorScheme
  const supabase = createClient()
  const searchParams = useSearchParams()
  const noteSet = new Set(noteIds)

  useEffect(() => {
    const section = searchParams.get('section')
    setExpandedSection(section)
  }, [searchParams])

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed || trimmed.length < 2) { setResults(null); return }
    setLoading(true)

    const maddeMatch = trimmed.match(/^(?:madde\s+)?(\d+)$/i)
    let req
    if (maddeMatch) {
      const maddeNo = parseInt(maddeMatch[1])
      req = supabase
        .from('maddeler')
        .select('id, madde_no, baslik, metin, path')
        .eq('kanun_id', kanunId)
        .eq('madde_no', maddeNo)
        .limit(1)
    } else {
      const p = `%${trimmed}%`
      req = supabase
        .from('maddeler')
        .select('id, madde_no, baslik, metin, path')
        .eq('kanun_id', kanunId)
        .ilike('metin', p)
        .order('madde_no')
        .limit(30)
    }

    const { data, error } = await req
    if (error) console.error('Search error:', error)
    setResults((data as SearchMadde[] | null) || [])
    setLoading(false)
  }, [kanunId, supabase])

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(t)
  }, [query, doSearch])

  const isSearching = query.trim().length >= 2

  return (
    <div>
      <div className="search-shell mb-6">
        <Search className="w-4 h-4 text-subtle shrink-0" strokeWidth={1.75} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Bu kanun içinde ara… (madde no veya kavram)"
          className="flex-1 bg-transparent outline-none border-0 text-[13px] placeholder:text-subtle py-0.5"
        />
        {loading && <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin shrink-0" />}
        {query && !loading && (
          <button
            onClick={() => setQuery('')}
            className="p-1 rounded-md text-subtle hover:text-muted hover:bg-[var(--surface-muted)] transition-colors"
            aria-label="Temizle"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isSearching ? (
        <div>
          {results === null || results.length === 0 ? (
            <div className="surface p-8 text-center">
              <p className="text-[13px] text-muted">{loading ? 'Aranıyor…' : 'Sonuç bulunamadı'}</p>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-subtle mb-2.5 uppercase tracking-widest font-medium">
                {results.length} sonuç
              </p>
              <div className="surface divide-y divide-[var(--border)] overflow-hidden">
                {results.map(m => (
                  <MaddeListItem
                    key={m.id}
                    kanunId={kanunId}
                    maddeId={m.id}
                    maddeNo={m.madde_no}
                    baslik={m.baslik}
                    pathLabel={m.path}
                    snippet={snippet(m.metin, query)}
                    highlightQuery={query}
                    hasNote={noteSet.has(String(m.id))}
                    cs={cs}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <KanunAccordion
          maddeler={maddeler}
          kanunId={kanunId}
          noteIds={noteIds}
          colorScheme={colorScheme}
          expandedSection={expandedSection}
        />
      )}
    </div>
  )
}
