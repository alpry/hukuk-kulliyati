'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Note {
  id: string
  icerik: string
}

export default function NoteEditor({
  maddeId,
  existingNote,
}: {
  maddeId: string
  existingNote: Note | null
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Notlarım</h3>
        {existingNote && icerik && (
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
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
        className="w-full text-sm border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">
          {icerik.length} karakter
        </span>
        <button
          onClick={handleSave}
          disabled={saving || !icerik.trim()}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}
