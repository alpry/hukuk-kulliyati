'use client'

import { useState } from 'react'
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
}: {
  maddeId: string
  existingNote: Note | null
  colorScheme: ColorScheme
}) {
  const [icerik, setIcerik] = useState(existingNote?.icerik || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
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
    if (existingNote) {
      const res = await supabase
        .from('notlar')
        .update({ icerik, updated_at: new Date().toISOString() })
        .eq('id', existingNote.id)
      error = res.error
    } else {
      const res = await supabase
        .from('notlar')
        .insert({ madde_id: parseInt(maddeId), icerik, user_id: user.id })
      error = res.error
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
    if (!existingNote) return
    await supabase.from('notlar').delete().eq('id', existingNote.id)
    setIcerik('')
  }

  const cs = colorScheme

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: cs.primary }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-800">Notlarım</h3>
        </div>
        {existingNote && icerik && (
          <button
            onClick={handleDelete}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Notu Sil
          </button>
        )}
      </div>

      <textarea
        value={icerik}
        onChange={e => setIcerik(e.target.value)}
        placeholder="Bu madde için notunuzu buraya yazın..."
        rows={6}
        className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent resize-none placeholder:text-slate-400 transition-shadow"
        style={{ '--tw-ring-color': cs.primary } as React.CSSProperties}
        onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${cs.light}, 0 0 0 4px ${cs.primary}40` }}
        onBlur={e => { e.target.style.boxShadow = '' }}
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-400">{icerik.length} karakter</span>
        <button
          onClick={handleSave}
          disabled={saving || !icerik.trim()}
          className="text-white text-sm px-5 py-2 rounded-xl font-medium transition-all disabled:opacity-40"
          style={{ backgroundColor: saving || !icerik.trim() ? '#94a3b8' : cs.primary }}
        >
          {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}
