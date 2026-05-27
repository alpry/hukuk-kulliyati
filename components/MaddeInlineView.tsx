'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, StickyNote } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import FavoriteButton from './FavoriteButton'
import { deriveMaddeTitle } from '@/lib/madde-title'
import type { ColorScheme } from '@/lib/kanun-colors'

type Detail = {
  metin: string
  note: { id: string; icerik: string } | null
  isFav: boolean
}

function InlineNoteEditor({
  maddeId,
  existingNote,
  cs,
  onSaved,
  onDeleted,
}: {
  maddeId: string
  existingNote: { id: string; icerik: string } | null
  cs: ColorScheme
  onSaved?: () => void
  onDeleted?: () => void
}) {
  const [icerik, setIcerik] = useState(existingNote?.icerik || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const noteIdRef = useRef<string | null>(existingNote?.id || null)
  const [hasSavedNote, setHasSavedNote] = useState(!!existingNote)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [icerik])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    let error
    if (noteIdRef.current) {
      const res = await supabase
        .from('notlar')
        .update({ icerik, updated_at: new Date().toISOString() })
        .eq('id', noteIdRef.current)
      error = res.error
    } else {
      const res = await supabase
        .from('notlar')
        .insert({ madde_id: parseInt(maddeId), icerik, user_id: user.id })
        .select('id')
        .single()
      error = res.error
      if (!error && res.data) {
        noteIdRef.current = res.data.id
        setHasSavedNote(true)
        onSaved?.()
      }
    }

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  async function handleDelete() {
    if (!noteIdRef.current) return
    await supabase.from('notlar').delete().eq('id', noteIdRef.current)
    setIcerik('')
    noteIdRef.current = null
    setHasSavedNote(false)
    onDeleted?.()
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={icerik}
        onChange={e => setIcerik(e.target.value)}
        placeholder="Bu madde için notunuzu buraya yazın..."
        rows={1}
        className="w-full text-[12px] bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 resize-none overflow-hidden focus:outline-none transition-shadow"
        style={{ minHeight: '36px' }}
        onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${cs.primary}30` }}
        onBlur={e => { e.target.style.boxShadow = '' }}
      />
      <div className="flex items-center justify-between">
        {hasSavedNote && icerik ? (
          <button onClick={handleDelete} className="text-[10px] text-subtle hover:text-red-500 transition-colors">
            Notu Sil
          </button>
        ) : <span />}
        <button
          onClick={handleSave}
          disabled={saving || !icerik.trim()}
          className="text-[11px] font-medium px-3 py-1 rounded-lg text-white disabled:opacity-40 transition-all"
          style={{ backgroundColor: cs.primary }}
        >
          {saving ? 'Kaydediliyor…' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}

export default function MaddeInlineView({
  kanunId,
  maddeId,
  maddeNo,
  baslik,
  path,
  hasNote: initialHasNote,
  cs,
}: {
  kanunId: string
  maddeId: string
  maddeNo: number
  baslik?: string | null
  path?: string | null
  hasNote?: boolean
  cs: ColorScheme
}) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasNote, setHasNote] = useState(initialHasNote ?? false)
  const pendingRef = useRef(false)

  const title = deriveMaddeTitle(baslik, path).title

  async function handleToggle() {
    setOpen(o => !o)
    if (!open && !detail && !pendingRef.current) {
      pendingRef.current = true
      setLoading(true)
      const supabase = createClient()
      const [maddeRes, { data: { user } }] = await Promise.all([
        supabase.from('maddeler').select('metin').eq('id', maddeId).single(),
        supabase.auth.getUser(),
      ])
      let note = null
      let isFav = false
      if (user) {
        const [noteRes, favRes] = await Promise.all([
          supabase.from('notlar').select('id, icerik').eq('user_id', user.id).eq('madde_id', Number(maddeId)).maybeSingle(),
          supabase.from('favoriler').select('id').eq('user_id', user.id).eq('madde_id', Number(maddeId)).maybeSingle(),
        ])
        note = noteRes.data
        isFav = !!favRes.data
      }
      setDetail({ metin: maddeRes.data?.metin || '', note, isFav })
      setLoading(false)
      pendingRef.current = false
    }
  }

  return (
    <div
      className="rounded-lg overflow-hidden transition-colors"
      style={hasNote ? { borderLeft: `2px solid ${cs.primary}` } : undefined}
    >
      {/* Accordion header */}
      <div className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--surface-muted)] transition-colors">
        <Link
          href={`/dashboard/kanun/${kanunId}/madde/${maddeId}`}
          onClick={e => e.stopPropagation()}
          className="text-[10px] font-bold px-2 py-0.5 rounded-full card-pill shrink-0 tabular-nums leading-none hover:opacity-80 transition-opacity"
          style={{ backgroundColor: cs.light, color: cs.primary }}
        >
          Madde {maddeNo}
        </Link>
        <button
          onClick={handleToggle}
          className="flex items-center flex-1 min-w-0 text-left"
        >
          {title ? (
            <span className="flex-1 min-w-0 text-[12.5px] text-muted truncate leading-snug">{title}</span>
          ) : (
            <span className="flex-1" />
          )}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {open && detail && (
            <FavoriteButton maddeId={Number(maddeId)} initial={detail.isFav} />
          )}
          {hasNote && <StickyNote className="w-3.5 h-3.5" style={{ color: cs.primary }} strokeWidth={1.75} />}
          <button
            onClick={handleToggle}
            aria-label={open ? 'Kapat' : 'Aç'}
            className="flex items-center"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 text-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 pt-3 pb-4 space-y-3">
          {loading ? (
            <p className="text-[12px] text-subtle py-2 text-center">Yükleniyor…</p>
          ) : detail ? (
            <>
              <p className="text-[13px] leading-7 whitespace-pre-line">
                {detail.metin}
              </p>
              <InlineNoteEditor
                maddeId={maddeId}
                existingNote={detail.note}
                cs={cs}
                onSaved={() => setHasNote(true)}
                onDeleted={() => setHasNote(false)}
              />
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
