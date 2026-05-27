'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ColorScheme } from '@/lib/kanun-colors'

interface Note {
  id: string
  icerik: string
}

export default function NoteEditor({
  maddeId,
  existingNote,
  colorScheme,
  onSaved,
  onDeleted,
}: {
  maddeId: string
  existingNote: Note | null
  colorScheme: ColorScheme
  onSaved?: () => void
  onDeleted?: () => void
}) {
  const [icerik, setIcerik] = useState(existingNote?.icerik || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasSavedNote, setHasSavedNote] = useState(!!existingNote)
  const noteIdRef = useRef<string | null>(existingNote?.id || null)
  const supabase = createClient()

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Oturum bulunamadı, lütfen tekrar giriş yapın.')
      setSaving(false)
      return
    }

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

    if (error) {
      alert('Kayıt hatası: ' + error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDelete() {
    if (!noteIdRef.current) return
    await supabase.from('notlar').delete().eq('id', noteIdRef.current)
    setIcerik('')
    noteIdRef.current = null
    setHasSavedNote(false)
    onDeleted?.()
  }

  const cs = colorScheme

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: cs.primary }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-xs font-semibold">Notlarım</h3>
        </div>
        {hasSavedNote && icerik && (
          <button
            onClick={handleDelete}
            className="text-[10px] text-subtle hover:text-red-500 transition-colors"
          >
            Notu Sil
          </button>
        )}
      </div>

      <textarea
        value={icerik}
        onChange={e => setIcerik(e.target.value)}
        placeholder="Bu madde için notunuzu buraya yazın..."
        rows={5}
        className="w-full text-xs bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2.5 focus:outline-none resize-none transition-shadow"
        onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${cs.light}, 0 0 0 4px ${cs.primary}40` }}
        onBlur={e => { e.target.style.boxShadow = '' }}
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-subtle">{icerik.length} karakter</span>
        <button
          onClick={handleSave}
          disabled={saving || !icerik.trim()}
          className="text-white text-xs px-4 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
          style={{ backgroundColor: cs.primary }}
        >
          {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}
