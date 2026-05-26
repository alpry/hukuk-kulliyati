'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import KanunAccordion from './KanunAccordion'
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

type Note = { id: string; icerik: string }

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-100 text-yellow-800 rounded-sm">{part}</mark>
          : part
      )}
    </>
  )
}

function getSnippet(metin: string, query: string): string {
  const idx = metin.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return metin.slice(0, 300)
  const start = Math.max(0, idx - 120)
  const end = Math.min(metin.length, idx + query.length + 120)
  return (start > 0 ? '…' : '') + metin.slice(start, end) + (end < metin.length ? '…' : '')
}


function SearchCard({ m, cs, query, showFull, kanunId, onBreadcrumbClick }: {
  m: SearchMadde
  cs: ColorScheme
  query: string
  showFull: boolean
  kanunId: string
  onBreadcrumbClick?: () => void
}) {
  const [note, setNote] = useState<Note | null>(null)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const pathParts = m.path ? m.path.split(' > ').slice(1) : []

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled || !user) return
      setUserId(user.id)
      const noteRes = await supabase
        .from('notlar')
        .select('*')
        .eq('user_id', user.id)
        .eq('madde_id', Number(m.id))
        .maybeSingle()
      if (cancelled) return
      if (noteRes.data) {
        setNote(noteRes.data)
        setNoteText(noteRes.data.icerik)
      }
    }
    load()
    return () => { cancelled = true }
  }, [m.id])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [noteText])

  async function handleSave() {
    if (!userId || !noteText.trim()) return
    setSaving(true)
    if (note) {
      await supabase.from('notlar').update({ icerik: noteText, updated_at: new Date().toISOString() }).eq('id', note.id)
    } else {
      const { data } = await supabase.from('notlar').insert({ madde_id: Number(m.id), icerik: noteText, user_id: userId }).select().single()
      if (data) setNote(data)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const displayText = showFull ? m.metin : getSnippet(m.metin, query)

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-4 pt-3 pb-2">
        <Link href={`/dashboard/kanun/${kanunId}/madde/${m.id}`} className="group">
          <div className="flex items-center gap-2 mb-1.5 hover:opacity-75 transition-opacity">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums card-pill"
              style={{ backgroundColor: cs.light, color: cs.primary }}
            >
              Madde {m.madde_no}
            </span>
            {m.baslik && (
              <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">{m.baslik}</span>
            )}
          </div>
        </Link>

        {pathParts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mb-2">
            {pathParts.map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-slate-300 text-[10px]">›</span>}
                <button
                  onClick={e => {
                    e.preventDefault()
                    onBreadcrumbClick?.()
                    router.push(`/dashboard/kanun/${kanunId}?section=${encodeURIComponent(part)}`)
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-700 hover:underline transition-colors"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-700 leading-5 whitespace-pre-line">
          {showFull ? (
            m.metin
          ) : (
            <Highlight text={displayText} query={query} />
          )}
        </p>
      </div>

      <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
        <textarea
          onClick={e => e.preventDefault()}
          ref={textareaRef}
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="Not ekle..."
          rows={2}
          className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none resize-none overflow-hidden placeholder:text-slate-400 transition-shadow"
          onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${cs.primary}20` }}
          onBlur={e => { e.target.style.boxShadow = '' }}
        />
        {noteText.trim() && (
          <div className="flex justify-end mt-1.5">
            <button
              onClick={e => {
                e.preventDefault()
                handleSave()
              }}
              disabled={saving}
              className="text-white text-[10px] font-semibold px-3 py-1 rounded-lg disabled:opacity-40"
              style={{ backgroundColor: cs.primary }}
            >
              {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
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
  const router = useRouter()

  // URL parametrisinden section al
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
      // Madde numarasına göre ara
      const maddeNo = parseInt(maddeMatch[1])
      req = supabase
        .from('maddeler')
        .select('id, madde_no, baslik, metin, path')
        .eq('kanun_id', kanunId)
        .eq('madde_no', maddeNo)
        .limit(1)
    } else {
      // Metin, başlık ve path'te ara
      const searchPattern = `%${trimmed}%`
      req = supabase
        .from('maddeler')
        .select('id, madde_no, baslik, metin, path')
        .eq('kanun_id', kanunId)
        .or(`metin.ilike.${searchPattern},baslik.ilike.${searchPattern},path.ilike.${searchPattern}`)
        .order('madde_no')
        .limit(30)
    }

    const { data, error } = await req
    if (error) {
      console.error('Search error:', error)
    }
    setResults(data || [])
    setLoading(false)
  }, [kanunId])

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(t)
  }, [query, doSearch])

  const isMaddeSearch = /^madde\s+\d+$/i.test(query.trim())
  const isSearching = query.trim().length >= 2

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='Ara… (Madde numarası: 5, kelime: zamanaşımı)'
          className="w-full pl-10 pr-10 py-2.5 bg-white rounded-lg text-xs text-slate-800 border border-slate-200 focus:outline-none placeholder:text-slate-400 transition-shadow"
          onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${cs.primary}20` }}
          onBlur={e => { e.target.style.boxShadow = '' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isSearching ? (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 rounded-full border-2 border-slate-200 animate-spin" style={{ borderTopColor: cs.primary }} />
            </div>
          ) : results === null || results.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400">
              {results !== null ? 'Sonuç bulunamadı.' : ''}
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-3">{results.length} sonuç</p>
              {results.map(m => (
                <SearchCard
                  key={m.id}
                  m={m}
                  cs={cs}
                  query={query.trim()}
                  showFull={isMaddeSearch}
                  kanunId={kanunId}
                  onBreadcrumbClick={() => setQuery('')}
                />
              ))}
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
